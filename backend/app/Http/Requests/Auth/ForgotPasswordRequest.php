<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

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
