<?php

namespace App\Enums;

/**
 * Cycle de vie d'une candidature livreur :
 * pending → under_review → approved | rejected | complement_requested.
 */
enum DriverApplicationStatus: string
{
    case Pending      = 'pending';
    case UnderReview  = 'under_review';
    case Approved     = 'approved';
    case Rejected     = 'rejected';
    case ComplementRequested = 'complement_requested';

    public function label(): string
    {
        return match($this) {
            self::Pending             => 'En attente',
            self::UnderReview         => 'En cours d\'examen',
            self::Approved            => 'Approuvée',
            self::Rejected            => 'Rejetée',
            self::ComplementRequested => 'Complément demandé',
        };
    }
}
