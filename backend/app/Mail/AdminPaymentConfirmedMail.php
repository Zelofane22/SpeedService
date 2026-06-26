<?php

namespace App\Mail;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminPaymentConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Delivery $delivery,
        public readonly bool $requiresValidation = false,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->requiresValidation
            ? '[SpeedService] Paiement à valider — ' . $this->delivery->reference
            : '[SpeedService] Paiement confirmé — ' . $this->delivery->reference;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.payment_confirmed',
            with: [
                'delivery'           => $this->delivery,
                'requiresValidation' => $this->requiresValidation,
            ],
        );
    }
}
