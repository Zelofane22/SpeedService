<?php

namespace App\Console\Commands;

use App\Mail\AdminNewOrderMail;
use App\Mail\AdminPaymentConfirmedMail;
use App\Models\Delivery;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Commande de développement : envoie un email admin de test (nouvelle commande,
 * paiement confirmé ou paiement à valider) sur la dernière livraison en base.
 */
class TestAdminMail extends Command
{
    protected $signature = 'mail:test-admin {--type=new-order : new-order | payment-confirmed | payment-validation}';

    protected $description = 'Envoie un email de test admin (nouvelle commande ou paiement confirmé)';

    public function handle(): int
    {
        $adminEmail = config('mail.admin_notification_email');
        $type       = $this->option('type');

        if (! $adminEmail) {
            $this->error('ADMIN_NOTIFICATION_EMAIL non configuré dans .env');
            return 1;
        }

        $delivery = Delivery::with(['client', 'payment'])->latest()->first();

        if (! $delivery) {
            $this->error('Aucune livraison en base. Créez d\'abord une livraison via l\'API.');
            return 1;
        }

        $this->info("Livraison test  : {$delivery->reference}");
        $this->info("Destinataire    : {$adminEmail}");
        $this->info("Type            : {$type}");

        match ($type) {
            'new-order' => Mail::to($adminEmail)->send(new AdminNewOrderMail($delivery)),
            'payment-confirmed' => Mail::to($adminEmail)->send(
                new AdminPaymentConfirmedMail($delivery, requiresValidation: false)
            ),
            'payment-validation' => Mail::to($adminEmail)->send(
                new AdminPaymentConfirmedMail($delivery, requiresValidation: true)
            ),
            default => $this->error("Type inconnu : {$type}") && exit(1),
        };

        $this->info('Email envoyé avec succès.');
        return 0;
    }
}
