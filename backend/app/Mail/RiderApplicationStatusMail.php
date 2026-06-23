<?php

namespace App\Mail;

use App\Models\DriverApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RiderApplicationStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly DriverApplication $application,
        public readonly string $event, // submitted | approve | reject | request_complement
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->event) {
            'submitted'          => 'Votre candidature a été reçue — SpeedService',
            'approve'            => 'Félicitations ! Votre candidature est approuvée — SpeedService',
            'reject'             => 'Décision sur votre candidature — SpeedService',
            'request_complement' => 'Documents complémentaires requis — SpeedService',
            default              => 'Mise à jour de votre candidature — SpeedService',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rider.application_status',
            with: [
                'application' => $this->application,
                'event'       => $this->event,
            ],
        );
    }
}
