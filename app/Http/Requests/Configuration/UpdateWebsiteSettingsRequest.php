<?php

namespace App\Http\Requests\Configuration;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Company;
use App\Support\Web\GoogleMapsEmbedUrl;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWebsiteSettingsRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        $company = $this->selectedCompany();

        return $company instanceof Company && $this->user()?->can('update', $company) === true;
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public function rules(): array
    {
        $company = $this->selectedCompany();

        if (! $company instanceof Company) {
            return [
                'slug' => ['required'],
            ];
        }

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('configuration_companies', 'slug')->ignore($company->id),
            ],
            'primary_color' => ['nullable', 'hex_color'],
            'facebook_url' => ['nullable', 'string', 'max:500'],
            'instagram_url' => ['nullable', 'string', 'max:500'],
            'whatsapp_phone' => ['nullable', 'string', 'max:30'],
            'whatsapp_message' => ['nullable', 'string', 'max:500'],
            'contact_map_url' => ['nullable', 'string', 'max:4000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'primary_color' => 'color principal',
            'facebook_url' => 'URL de Facebook',
            'instagram_url' => 'URL de Instagram',
            'whatsapp_phone' => 'número de WhatsApp',
            'whatsapp_message' => 'mensaje de WhatsApp',
            'contact_map_url' => 'ubicación de la clínica',
        ];
    }

    protected function prepareForValidation(): void
    {
        $payload = [];

        $color = $this->input('primary_color');

        if (is_string($color)) {
            $trimmed = trim($color);

            if ($trimmed === '') {
                $payload['primary_color'] = null;
            } else {
                if (! str_starts_with($trimmed, '#')) {
                    $trimmed = '#'.$trimmed;
                }

                $payload['primary_color'] = strtoupper($trimmed);
            }
        }

        if ($this->exists('contact_map_url')) {
            $mapUrl = $this->input('contact_map_url');
            $payload['contact_map_url'] = is_string($mapUrl)
                ? GoogleMapsEmbedUrl::normalize($mapUrl)
                : null;
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    /**
     * @return array<string, string|null>
     */
    public function settingsPayload(): array
    {
        /** @var array<string, string|null> */
        return $this->safe()->only([
            'primary_color',
            'facebook_url',
            'instagram_url',
            'whatsapp_phone',
            'whatsapp_message',
            'contact_map_url',
        ]);
    }
}
