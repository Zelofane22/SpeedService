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
        .status-box { background: #FAF7FB; border-left: 4px solid #861D6D; padding: 16px; margin: 24px 0; border-radius: 4px; }
        .footer { padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
        .btn { display: inline-block; background: #861D6D; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>SpeedService — Livreur</h1>
    </div>
    <div class="body">
        <p>Bonjour <?php echo e($application->first_name); ?>,</p>

        <?php if($event === 'submitted'): ?>
            <p>Nous avons bien reçu votre candidature pour devenir livreur SpeedService.</p>
            <div class="status-box">
                <strong>Statut :</strong> En attente d'examen<br>
                <strong>Référence :</strong> <?php echo e($application->id); ?>

            </div>
            <p>Notre équipe va examiner votre dossier dans les prochaines 48 heures. Vous recevrez un email dès qu'une décision sera prise.</p>

        <?php elseif($event === 'approve'): ?>
            <p>Félicitations ! Votre candidature a été <strong>approuvée</strong>.</p>
            <p>Votre compte livreur a été créé. Cliquez sur le bouton ci-dessous pour choisir votre mot de passe et accéder à votre espace.</p>
            <?php if($setupUrl): ?>
                <a class="btn" href="<?php echo e($setupUrl); ?>">Créer mon mot de passe</a>
                <p style="margin-top:16px; font-size:13px; color:#666;">Ce lien est valable 60 minutes. Si vous ne l'utilisez pas dans ce délai, contactez-nous à <a href="mailto:support@speedservice.bj">support@speedservice.bj</a>.</p>
            <?php else: ?>
                <a class="btn" href="<?php echo e(env('RIDER_URL', 'https://driver.speedservice.bj')); ?>">Accéder à mon espace</a>
            <?php endif; ?>

        <?php elseif($event === 'reject'): ?>
            <p>Nous avons examiné votre candidature et, malheureusement, nous ne sommes pas en mesure de l'approuver pour le moment.</p>
            <?php if($application->rejection_reason): ?>
                <div class="status-box">
                    <strong>Motif :</strong> <?php echo e($application->rejection_reason); ?>

                </div>
            <?php endif; ?>
            <p>Vous pouvez soumettre une nouvelle candidature après 30 jours si votre situation a évolué.</p>

        <?php elseif($event === 'request_complement'): ?>
            <p>Votre candidature est en cours d'examen. Cependant, nous avons besoin de documents complémentaires avant de pouvoir prendre une décision.</p>
            <?php if($application->complement_request): ?>
                <div class="status-box">
                    <strong>Documents requis :</strong><br><?php echo e($application->complement_request); ?>

                </div>
            <?php endif; ?>
            <p>Veuillez soumettre les documents demandés dès que possible via le portail candidat.</p>
            <a class="btn" href="<?php echo e(config('app.rider_url', 'https://rider.speedservice.bj')); ?>/apply/status?id=<?php echo e($application->id); ?>">Soumettre les documents</a>
        <?php endif; ?>

        <p>Pour toute question, contactez-nous à <a href="mailto:support@speedservice.bj">support@speedservice.bj</a>.</p>
    </div>
    <div class="footer">SpeedService · Bénin · <a href="https://speedservice.bj">speedservice.bj</a></div>
</div>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/emails/driver/application_status.blade.php ENDPATH**/ ?>