<?php

namespace App\Mail;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email adressé à l'administrateur lors de la création d'une nouvelle commande.
 */
class AdminNewOrderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Delivery $delivery) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[SpeedService] Nouvelle commande — ' . $this->delivery->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new_order',
            with: ['delivery' => $this->delivery],
        );
    }
}
