<?php

namespace App\Models;

use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverDocument extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'application_id',
        'document_type',
        'file_path',
        'storage_disk',
        'resource_type',
        'format',
        'original_name',
        'mime_type',
        'validation_status',
        'rejection_note',
    ];

    protected function casts(): array
    {
        return [
            'document_type' => DocumentType::class,
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(DriverApplication::class, 'application_id');
    }
}
