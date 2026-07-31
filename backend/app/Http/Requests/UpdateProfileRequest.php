<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Validation de la mise à jour du profil client : le changement de mot de passe
 * exige le mot de passe courant, et le téléphone est exclu de l'unicité pour
 * l'utilisateur concerné.
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = Auth::id();

        return [
            'name'                  => ['required', 'string', 'max:255'],
            'phone'                 => ['required', 'string', 'max:20', "unique:users,phone,{$userId}"],
            'current_password'      => ['required_with:password', 'string'],
            'password'              => ['nullable', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required_with:password', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'             => 'Le nom est obligatoire.',
            'phone.required'            => 'Le numéro de téléphone est obligatoire.',
            'phone.unique'              => 'Ce numéro de téléphone est déjà utilisé.',
            'current_password.required_with' => 'Le mot de passe actuel est obligatoire pour changer le mot de passe.',
            'password.min'              => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'        => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
