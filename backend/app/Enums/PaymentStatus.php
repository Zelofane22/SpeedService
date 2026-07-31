<?php

namespace App\Enums;

/**
 * État d'un paiement : en attente, réussi ou échoué.
 */
enum PaymentStatus: string
{
    case Pending   = 'pending';
    case Succeeded = 'succeeded';
    case Failed    = 'failed';
}
