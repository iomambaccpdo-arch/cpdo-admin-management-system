<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::query()->orderByDesc('created_at')->orderByDesc('id');
        $search = trim((string) $request->query('search', ''));

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($inner) use ($like) {
                $inner->where('name', 'like', $like)
                    ->orWhere('location', 'like', $like)
                    ->orWhere('extension', 'like', $like);
            });
        }

        $year = $request->query('year');
        if ($year !== null && $year !== '') {
            $year = (int) $year;
            if ($year >= 1970 && $year <= 2100) {
                $query->whereYear('created_at', $year);
            }
        }

        $month = $request->query('month');
        if ($month !== null && $month !== '') {
            $month = (int) $month;
            if ($month >= 1 && $month <= 12) {
                $query->whereMonth('created_at', $month);
            }
        }

        if ($request->routeIs('files.index')) {
            $query->where('extension', 'pdf');

            return response()->json($query->get());
        }

        $query->where('extension', '!=', 'pdf');

        $perPage = 12;
        $page = max(1, (int) $request->query('page', 1));
        $documents = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $documents->items(),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'per_page' => $documents->perPage(),
                'total' => $documents->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $rules = ['required', 'file', 'max:20480'];
        if ($request->routeIs('files.store')) {
            $rules[] = 'mimes:pdf';
        } else {
            $rules[] = 'mimes:doc,docx,xls,xlsx,png,jpg,jpeg';
        }

        $request->validate([
            'file' => $rules,
            'name' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $uploaded = $request->file('file');
        $path = $uploaded->store('documents', 'public');
        $original = pathinfo($uploaded->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = strtolower($uploaded->getClientOriginalExtension() ?: 'file');

        $document = Document::create([
            'name' => $request->input('name') ?: $original,
            'extension' => $extension,
            'location' => $request->input('location') ?: 'CPDO Records',
            'stored_path' => $path,
            'size' => $uploaded->getSize(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($document, 201);
    }

    public function download(Request $request, Document $document): StreamedResponse
    {
        $this->guardPdfRoute($request, $document);

        if (! $document->stored_path || ! Storage::disk('public')->exists($document->stored_path)) {
            abort(404, 'File is not stored on this server.');
        }

        $filename = $document->name.'.'.$document->extension;

        return Storage::disk('public')->download($document->stored_path, $filename);
    }

    public function destroy(Request $request, Document $document)
    {
        $this->guardPdfRoute($request, $document);

        if ($document->stored_path) {
            Storage::disk('public')->delete($document->stored_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    private function guardPdfRoute(Request $request, Document $document): void
    {
        if (! $request->routeIs('files.download', 'files.destroy')) {
            return;
        }

        if (strtolower((string) $document->extension) !== 'pdf') {
            abort(404, 'File is not stored on this server.');
        }
    }
}
