<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverApplicationStatus;
use App\Enums\DocumentType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\DriverApplicationStatusMail;
use App\Models\AdminActionLog;
use App\Models\DriverApplication;
use App\Models\DriverDocument;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DriverApplicationController extends Controller
{
    public function apply(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'required|email|unique:driver_applications,email',
            'phone'           => 'required|string|max:20',
            'city'            => 'required|string|max:100',
            'vehicle_type'    => 'required|string|in:bicycle,motorcycle,car,van',
            'vehicle_brand'   => 'nullable|string|max:100',
            'vehicle_plate'   => 'nullable|string|max:20',
            'payment_method'  => 'nullable|string|in:mtn_momo,moov_money,bank',
            'payment_number'  => 'nullable|string|max:30',
            'bank_name'       => 'nullable|string|max:100',
            'bank_iban'       => 'nullable|string|max:50',
        ]);

        $data['user_id']      = $request->user()?->id;
        $data['status']       = DriverApplicationStatus::Pending;
        $data['submitted_at'] = now();

        $application = DriverApplication::create($data);

        Mail::to($application->email)->queue(
            new DriverApplicationStatusMail($application, 'submitted')
        );

        return response()->json([
            'message'        => 'Candidature soumise avec succès.',
            'application_id' => $application->id,
        ], 201);
    }

    public function uploadDocuments(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate([
            'application_id' => 'required|uuid|exists:driver_applications,id',
            'documents'      => 'required|array|min:1',
            'documents.*.type' => 'required|string',
            'documents.*.file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $application = DriverApplication::findOrFail($request->application_id);

        $this->storeDocuments($request, $application, "documents/{$application->id}", $cloudinary);

        return response()->json(['message' => 'Documents téléversés avec succès.']);
    }

    public function status(Request $request): JsonResponse
    {
        $request->validate([
            'application_id' => 'required|uuid|exists:driver_applications,id',
        ]);

        $application = DriverApplication::with('documents')
            ->findOrFail($request->application_id);

        return response()->json([
            'status'              => $application->status,
            'status_label'        => $application->status->label(),
            'rejection_reason'    => $application->rejection_reason,
            'complement_request'  => $application->complement_request,
            'reviewed_at'         => $application->reviewed_at,
            'documents'           => $application->documents->map(fn ($d) => [
                'type'             => $d->document_type,
                'validation_status' => $d->validation_status,
                'rejection_note'   => $d->rejection_note,
            ]),
        ]);
    }

    public function complement(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate([
            'application_id' => 'required|uuid|exists:driver_applications,id',
            'documents'      => 'required|array|min:1',
            'documents.*.type' => 'required|string',
            'documents.*.file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $application = DriverApplication::findOrFail($request->application_id);

        if ($application->status !== DriverApplicationStatus::ComplementRequested) {
            return response()->json(['message' => 'Aucun complément demandé.'], 422);
        }

        $this->storeDocuments($request, $application, "documents/{$application->id}/complement", $cloudinary);

        $application->update(['status' => DriverApplicationStatus::UnderReview]);

        return response()->json(['message' => 'Documents complémentaires soumis.']);
    }

    /**
     * Téléverse chaque document vers Cloudinary (privé) et crée les DriverDocument associés.
     * Les photos de profil / véhicule sont en plus reliées sur la candidature pour un accès direct.
     */
    private function storeDocuments(
        Request $request,
        DriverApplication $application,
        string $folder,
        CloudinaryService $cloudinary,
    ): void {
        foreach ($request->file('documents') as $index => $docData) {
            $type = $request->input("documents.{$index}.type");
            $file = $docData['file'];

            $upload = $cloudinary->uploadPrivate($file, $folder);

            DriverDocument::create([
                'application_id'    => $application->id,
                'document_type'     => $type,
                'file_path'         => $upload['public_id'],
                'storage_disk'      => 'cloudinary',
                'resource_type'     => $upload['resource_type'],
                'format'            => $upload['format'],
                'original_name'     => $file->getClientOriginalName(),
                'mime_type'         => $file->getMimeType(),
                'validation_status' => 'pending',
            ]);

            // Photos profil / véhicule : on relie aussi le public_id sur la candidature.
            if ($type === DocumentType::ProfilePhoto->value) {
                $application->profile_photo_path = $upload['public_id'];
            } elseif ($type === DocumentType::VehiclePhoto->value) {
                $application->vehicle_photo_path = $upload['public_id'];
            }
        }

        if ($application->isDirty(['profile_photo_path', 'vehicle_photo_path'])) {
            $application->save();
        }
    }

    // --- Admin endpoints ---

    public function adminList(Request $request): JsonResponse
    {
        $applications = DriverApplication::with('documents')
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('submitted_at')
            ->paginate(20);

        return response()->json($applications);
    }

    public function adminShow(string $id): JsonResponse
    {
        $application = DriverApplication::with(['documents', 'reviewer'])->findOrFail($id);

        $data = $application->toArray();
        $data['documents'] = $application->documents->map(fn ($d) => [
            'id'                => $d->id,
            'document_type'     => $d->document_type,
            'original_name'     => $d->original_name,
            'mime_type'         => $d->mime_type,
            'validation_status' => $d->validation_status,
            'rejection_note'    => $d->rejection_note,
        ]);

        return response()->json($data);
    }

    public function downloadDocument(string $documentId, CloudinaryService $cloudinary): \Symfony\Component\HttpFoundation\Response
    {
        $document = DriverDocument::findOrFail($documentId);

        // Documents stockés sur Cloudinary : redirection vers une URL signée à durée limitée.
        if ($document->storage_disk === 'cloudinary') {
            $url = $cloudinary->signedUrl(
                $document->file_path,
                $document->resource_type ?? 'image',
                $document->format,
            );

            return redirect()->away($url);
        }

        // Fallback historique : anciens fichiers sur le disque local.
        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_name,
            ['Content-Type' => $document->mime_type ?? 'application/octet-stream']
        );
    }

    public function adminReview(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'action'             => 'required|in:approve,reject,request_complement',
            'rejection_reason'   => 'required_if:action,reject|nullable|string',
            'complement_request' => 'required_if:action,request_complement|nullable|string',
        ]);

        $application = DriverApplication::findOrFail($id);

        $newStatus = match ($data['action']) {
            'approve'            => DriverApplicationStatus::Approved,
            'reject'             => DriverApplicationStatus::Rejected,
            'request_complement' => DriverApplicationStatus::ComplementRequested,
        };

        $setupUrl = null;

        if ($data['action'] === 'approve') {
            $user = User::firstOrCreate(
                ['email' => $application->email],
                [
                    'name'      => $application->first_name . ' ' . $application->last_name,
                    'phone'     => $application->phone,
                    'password'  => Str::random(32),
                    'role'      => UserRole::Driver,
                    'is_active' => true,
                ]
            );

            $token    = Password::broker()->createToken($user);
            $riderUrl = rtrim(env('DRIVER_URL', 'http://localhost:3002'), '/');
            $setupUrl = $riderUrl . '/set-password?' . http_build_query([
                'token' => $token,
                'email' => $user->email,
            ]);

            $application->user_id = $user->id;
        }

        $application->update([
            'status'             => $newStatus,
            'rejection_reason'   => $data['rejection_reason'] ?? null,
            'complement_request' => $data['complement_request'] ?? null,
            'reviewed_by'        => $request->user()->id,
            'reviewed_at'        => now(),
        ]);

        Mail::to($application->email)->queue(
            new DriverApplicationStatusMail($application, $data['action'], $setupUrl)
        );

        AdminActionLog::create([
            'admin_id'     => $request->user()->id,
            'action'       => 'driver_application.reviewed',
            'subject_type' => 'driver_application',
            'subject_id'   => $application->id,
            'description'  => "Candidature de {$application->first_name} {$application->last_name} : {$newStatus->label()}.",
        ]);

        return response()->json(['message' => 'Décision enregistrée.']);
    }
}
