<?php

namespace App\Http\Controllers;

use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RecordController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($this->filtered($request)->get());
    }

    public function history(Request $request)
    {
        $query = Record::query();
        $year = $this->boundedInt($request->query('year'), 1970, 2100);
        $month = $this->boundedInt($request->query('month'), 1, 12);

        if ($year !== null) {
            $query->whereYear('received_at', $year);
        }

        if ($month !== null) {
            $query->whereMonth('received_at', $month);
        }

        $grouped = Record::groupedByRecordedDate($query);
        $perPage = 31;
        $total = $grouped->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min(max(1, (int) $request->query('page', 1)), $lastPage);
        $dates = $grouped->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'data' => $dates,
            'meta' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateRecord($request);
        $data['reference_no'] = $this->nextReference($data['reference_no'] ?? null);

        if ($request->hasFile('file')) {
            $data = array_merge($data, $this->storeAttachment($request));
        }

        $record = Record::create($data);

        return response()->json($record, 201);
    }

    public function update(Request $request, Record $record)
    {
        $data = $this->validateRecord($request, $record);

        if (! empty($data['reference_no'])) {
            $record->reference_no = $data['reference_no'];
        }

        unset($data['reference_no']);

        if ($request->hasFile('file')) {
            $this->deleteAttachment($record);
            $data = array_merge($data, $this->storeAttachment($request));
        }

        $record->fill($data);
        $record->save();

        return response()->json($record);
    }

    public function destroy(Record $record)
    {
        $this->deleteAttachment($record);
        $record->delete();

        return response()->json(['message' => 'Record deleted.']);
    }

    public function export(Request $request)
    {
        $records = $this->filtered($request)->get();
        $date = $request->query('date', 'all');

        $headers = [
            'ID',
            'Document Title',
            'Sender (Person/Dept)',
            'Date & Time Received',
            'Received By',
            'OIC',
            'Venue',
            'Remarks',
            'Date & Time Routed To',
            'Routed To',
            'Document',
            'Due on',
            'Status',
        ];

        $rows = [$headers];

        foreach ($records as $record) {
            $rows[] = [
                $record->reference_no,
                $record->title,
                $record->sender,
                optional($record->received_at)->format('M. j, Y g:i A'),
                $record->received_by,
                $record->oic,
                $record->venue,
                $record->remarks,
                optional($record->routed_at)->format('M. j, Y g:i A'),
                $record->routed_to,
                $record->document_label,
                $record->due_on?->format('M. j, Y') ?: '-',
                $record->status,
            ];
        }

        $html = '<html><head><meta charset="UTF-8"></head><body><table border="1">';
        foreach ($rows as $index => $row) {
            $html .= '<tr>';
            $tag = $index === 0 ? 'th' : 'td';
            foreach ($row as $cell) {
                $html .= '<'.$tag.'>'.e((string) $cell).'</'.$tag.'>';
            }
            $html .= '</tr>';
        }
        $html .= '</table></body></html>';

        $filename = 'cpdo-records-'.$date.'.xls';

        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    private function boundedInt(mixed $value, int $min, int $max): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        $number = (int) $value;

        if ($number < $min || $number > $max) {
            return null;
        }

        return $number;
    }

    private function filtered(Request $request)
    {
        $query = Record::query()->orderBy('received_at')->orderBy('reference_no');

        if ($request->filled('date')) {
            $query->whereDate('received_at', $request->query('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $like = '%'.$request->query('search').'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('reference_no', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    ->orWhere('sender', 'like', $like)
                    ->orWhere('received_by', 'like', $like)
                    ->orWhere('oic', 'like', $like)
                    ->orWhere('venue', 'like', $like)
                    ->orWhere('remarks', 'like', $like)
                    ->orWhere('routed_to', 'like', $like)
                    ->orWhere('status', 'like', $like);
            });
        }

        return $query;
    }

    private function validateRecord(Request $request, ?Record $record = null): array
    {
        $data = $request->validate([
            'reference_no' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'sender' => ['required', 'string', 'max:255'],
            'received_date' => ['required', 'date'],
            'received_time' => ['required', 'date_format:H:i'],
            'received_by' => ['required', 'string', 'max:255'],
            'oic' => ['nullable', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:255'],
            'routed_date' => ['nullable', 'date'],
            'routed_time' => ['nullable', 'date_format:H:i'],
            'routed_to' => ['nullable', 'string', 'max:255'],
            'document_label' => ['nullable', 'string', 'max:50'],
            'due_on' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['Approved', 'Pending', 'For Review', 'Returned'])],
            'file' => ['nullable', 'file', 'max:20480'],
        ]);

        $receivedAt = $data['received_date'].' '.$data['received_time'].':00';
        $routedAt = null;

        if (! empty($data['routed_date']) && ! empty($data['routed_time'])) {
            $routedAt = $data['routed_date'].' '.$data['routed_time'].':00';
        }

        return [
            'reference_no' => $data['reference_no'] ?? null,
            'title' => $data['title'],
            'sender' => $data['sender'],
            'received_at' => $receivedAt,
            'received_by' => $data['received_by'],
            'oic' => $data['oic'] ?? null,
            'venue' => $data['venue'] ?? null,
            'remarks' => $data['remarks'] ?? null,
            'routed_at' => $routedAt,
            'routed_to' => $data['routed_to'] ?? null,
            'document_label' => $data['document_label'] ?? ($record?->document_label ?: '.pdf'),
            'due_on' => $data['due_on'] ?? null,
            'status' => $data['status'],
        ];
    }

    private function nextReference(?string $requested): string
    {
        if ($requested) {
            return $requested;
        }

        $latest = Record::query()
            ->where('reference_no', 'like', 'DOC-%')
            ->orderByDesc('id')
            ->value('reference_no');

        $number = 1;
        if ($latest && preg_match('/(\d+)$/', $latest, $matches)) {
            $number = ((int) $matches[1]) + 1;
        }

        return 'DOC-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }

    private function storeAttachment(Request $request): array
    {
        $uploaded = $request->file('file');
        $path = $uploaded->store('records', 'public');
        $extension = strtolower($uploaded->getClientOriginalExtension() ?: 'pdf');

        return [
            'file_path' => $path,
            'document_label' => '.'.$extension,
        ];
    }

    private function deleteAttachment(Record $record): void
    {
        if ($record->file_path) {
            Storage::disk('public')->delete($record->file_path);
        }
    }
}
