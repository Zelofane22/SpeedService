<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActionLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'admin_id',
        'action',
        'subject_type',
        'subject_id',
        'description',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
