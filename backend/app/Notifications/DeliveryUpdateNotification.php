<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeliveryUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $deliveryId,
        public readonly string $reference,
        public readonly string $title,
        public readonly string $message,
    ) {
        $this->afterCommit();
    }

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
