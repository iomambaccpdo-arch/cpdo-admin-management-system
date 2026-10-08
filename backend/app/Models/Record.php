<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Record extends Model
{
    protected $fillable = [
        'reference_no',
        'title',
        'sender',
        'received_at',
        'received_by',
        'oic',
        'venue',
        'remarks',
        'routed_at',
        'routed_to',
        'document_label',
        'file_path',
        'due_on',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'routed_at' => 'datetime',
            'due_on' => 'date:Y-m-d',
        ];
    }

    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)->timezone(config('app.timezone'))->format('Y-m-d\TH:i:sP');
    }

    public static function groupedByRecordedDate($query)
    {
        return $query
            ->selectRaw('DATE(received_at) as record_date, COUNT(*) as total')
            ->groupByRaw('DATE(received_at)')
            ->orderByRaw('DATE(received_at) desc')
            ->get()
            ->map(fn ($row) => [
                'date' => substr((string) $row->record_date, 0, 10),
                'total' => (int) $row->total,
            ])
            ->values();
    }
}
