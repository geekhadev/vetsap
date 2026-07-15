<?php

namespace App\Http\Requests\Medic;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClinicalAttentionExamResultStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,jpg,jpeg,png,webp',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Selecciona un archivo PDF o una imagen.',
            'file.mimes' => 'El archivo debe ser PDF, JPG, PNG o WEBP.',
            'file.max' => 'El archivo no puede superar los 10 MB.',
        ];
    }
}
