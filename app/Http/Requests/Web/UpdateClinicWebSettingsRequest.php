<?php

namespace App\Http\Requests\Web;

use App\Models\Company;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClinicWebSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $company = $this->route('company');

        return $company instanceof Company && $this->user()?->can('update', $company) === true;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        /** @var Company $company */
        $company = $this->route('company');

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('configuration_companies', 'slug')->ignore($company->id),
            ],
            'facebook_url' => ['nullable', 'string', 'max:500'],
            'instagram_url' => ['nullable', 'string', 'max:500'],
            'whatsapp_phone' => ['nullable', 'string', 'max:30'],
            'whatsapp_message' => ['nullable', 'string', 'max:500'],
            'contact_map_url' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string|null>
     */
    public function settingsPayload(): array
    {
        /** @var array<string, string|null> */
        return $this->safe()->only([
            'facebook_url',
            'instagram_url',
            'whatsapp_phone',
            'whatsapp_message',
            'contact_map_url',
        ]);
    }
}
