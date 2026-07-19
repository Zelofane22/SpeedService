<?php

namespace App\Services;

use App\Enums\DeliveryNotificationEvent;
use App\Enums\NotificationChannel;
use App\Jobs\SendDeliverySms;
use App\Models\Delivery;
use App\Models\NotificationLog;
use App\Notifications\DeliveryUpdateNotification;

class DeliveryNotificationService
{
    public function send(Delivery $delivery, DeliveryNotificationEvent $event): void
    {
        $delivery->loadMissing('client', 'driver');
        $client = $delivery->client;

        if ($client === null) {
            return;
        }

        [$title, $message] = $this->content($delivery, $event);
        $data = [
            'event' => $event->value,
            'delivery_id' => $delivery->id,
            'reference' => $delivery->reference,
            'status' => $delivery->status->value,
        ];

        $createdChannels = [];

        foreach ([NotificationChannel::InApp, NotificationChannel::Email, NotificationChannel::Sms] as $channel) {
            $log = NotificationLog::firstOrCreate(
                [
                    'user_id' => $client->id,
                    'delivery_id' => $delivery->id,
                    'event' => $event->value,
                    'channel' => $channel,
                ],
                [
                    'title' => $title,
                    'message' => $message,
                    'data' => $data,
                ],
            );
            $createdChannels[$channel->value] = $log->wasRecentlyCreated;
        }

        if ($createdChannels[NotificationChannel::Email->value]) {
            try {
                $client->notify(new DeliveryUpdateNotification(
                    $delivery->id,
                    $delivery->reference,
                    $title,
                    $message,
                ));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        if ($createdChannels[NotificationChannel::Sms->value]) {
            SendDeliverySms::dispatch(
                $client->phone,
                $title . ' — ' . $message . ' (' . $delivery->reference . ')',
            );
        }
    }

    private function content(Delivery $delivery, DeliveryNotificationEvent $event): array
    {
        return match ($event) {
            DeliveryNotificationEvent::OrderConfirmed => [
                'Commande validée',
                'Votre commande a été validée et sera bientôt proposée à un livreur.',
            ],
            DeliveryNotificationEvent::DriverAssigned => [
                'Livreur affecté',
                $delivery->driver
                    ? $delivery->driver->name . ' a accepté votre livraison.'
                    : 'Un livreur a été affecté à votre commande.',
            ],
            DeliveryNotificationEvent::PackagePickedUp => [
                'Colis récupéré',
                'Votre colis a été récupéré et est maintenant en route vers sa destination.',
            ],
            DeliveryNotificationEvent::PackageDelivered => [
                'Colis livré',
                'Votre colis a bien été livré. Merci d’avoir choisi Speed Service.',
            ],
            DeliveryNotificationEvent::OrderCreated => [
                'Commande créée',
                'Votre commande a bien été enregistrée. Finalisez le paiement pour la faire valider.',
            ],
            DeliveryNotificationEvent::AwaitingValidation => [
                'Paiement à confirmer',
                'Votre paiement est en attente de validation manuelle par un administrateur.',
            ],
            DeliveryNotificationEvent::OrderCancelled => [
                'Commande annulée',
                'Votre commande a été annulée.',
            ],
        };
    }
}
