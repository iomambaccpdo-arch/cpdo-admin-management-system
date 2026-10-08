<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class Document extends Model
{
    protected $fillable = [
        'name',
        'extension',
        'location',
        'stored_path',
        'size',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function serializeDate(DateTimeInterface $date): string
    {
        return Carbon::instance($date)->timezone(config('app.timezone'))->format('Y-m-d\TH:i:sP');
    }
}
