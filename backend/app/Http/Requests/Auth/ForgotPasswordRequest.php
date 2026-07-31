<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation de la demande de réinitialisation de mot de passe.
 * reset_url optionnelle permet aux clients (notamment drivers) d'envoyer un
 * lien de réinitialisation propre à leur application.
 */
class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'     => ['required', 'email'],
            'reset_url' => ['nullable', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'  => 'L\'adresse email est obligatoire.',
            'email.email'     => 'L\'adresse email n\'est pas valide.',
            'reset_url.url'   => 'Le lien de réinitialisation n\'est pas valide.',
        ];
    }
}
