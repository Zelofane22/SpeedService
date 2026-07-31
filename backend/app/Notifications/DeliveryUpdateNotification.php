<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification email au client lors d'une mise à jour de sa livraison,
 * avec lien de suivi vers le frontend.
 */
class DeliveryUpdateNotification extends Notification
{
    public function __construct(
        public readonly string $deliveryId,
        public readonly string $reference,
        public readonly string $title,
        public readonly string $message,
    ) {}


    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');

        return (new MailMessage)
            ->subject($this->title . ' — Speed Service')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line($this->message)
            ->line('Référence : ' . $this->reference)
            ->action('Suivre ma livraison', $frontendUrl . '/deliveries/' . $this->deliveryId)
            ->line('Merci de votre confiance.');
    }
}
