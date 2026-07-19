<?php

namespace App\Http\Concerns;

use App\Models\AdminActionLog;
use Illuminate\Support\Facades\Auth;

/**
 * Journalise les actions sensibles réalisées par un administrateur dans
 * `admin_action_logs`. Utilisé par les contrôleurs du back-office pour tracer
 * qui a fait quoi (piste d'audit — privilege & access management).
 */
trait LogsAdminActions
{
    protected function logAction(
        string $action,
        string $description,
        ?string $subjectType = null,
        ?string $subjectId = null,
    ): void {
        AdminActionLog::create([
            'admin_id'     => Auth::id(),
            'action'       => $action,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'description'  => $description,
        ]);
    }
}
