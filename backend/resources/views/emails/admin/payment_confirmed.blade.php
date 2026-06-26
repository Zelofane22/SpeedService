<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #FAF7FB; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #861D6D; padding: 32px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 22px; }
        .body { padding: 32px; color: #1D1D1F; line-height: 1.6; }
        .body p { margin: 0 0 16px; }
        .info-box { background: #FAF7FB; border-left: 4px solid #861D6D; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .info-box strong { display: inline-block; min-width: 160px; }
        .badge { display: inline-block; background: #22c55e; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold; }
        .footer { padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
        .btn { display: inline-block; background: #861D6D; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>SpeedService — Administration</h1>
    </div>
    <div class="body">
        @if ($requiresValidation)
            <p>Un paiement <span class="badge" style="background:#f59e0b;">À valider</span> est en attente de validation manuelle.</p>
        @else
            <p>Un paiement a été <span class="badge">confirmé</span> sur la plateforme.</p>
        @endif

        <div class="info-box">
            <strong>Référence commande :</strong> {{ $delivery->reference }}<br>
            <strong>Client :</strong> {{ $delivery->client->name ?? '—' }}<br>
            <strong>Montant :</strong> {{ number_format($delivery->payment->amount ?? $delivery->price, 0, ',', ' ') }} FCFA<br>
            <strong>Mode de paiement :</strong> {{ $delivery->payment->method->value ?? '—' }}<br>
            @if ($delivery->payment->transaction_reference ?? null)
            <strong>Référence transaction :</strong> {{ $delivery->payment->transaction_reference }}<br>
            @endif
            <strong>Statut commande :</strong> {{ $delivery->status->value }}<br>
            <strong>Date :</strong> {{ now()->format('d/m/Y H:i') }}
        </div>

        @if ($requiresValidation)
            <p><strong>Action requise :</strong> Ce paiement nécessite une validation manuelle dans le back-office.</p>
        @endif

        <a class="btn" href="{{ config('app.admin_url', 'https://admin.speedservice.bj') }}/deliveries/{{ $delivery->id }}">
            Voir la commande
        </a>
    </div>
    <div class="footer">SpeedService — Notification automatique. Ne pas répondre à cet email.</div>
</div>
</body>
</html>
