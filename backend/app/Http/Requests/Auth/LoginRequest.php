<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation de la connexion par email ou téléphone (identifier) + mot de passe.
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Rétro-compatibilité : les anciens clients envoient `email` au lieu d'`identifier`.
        if (! $this->filled('identifier') && $this->filled('email')) {
            $this->merge(['identifier' => $this->input('email')]);
        }
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'L\'adresse email ou le numéro de téléphone est obligatoire.',
            'password.required'   => 'Le mot de passe est obligatoire.',
        ];
    }
}
