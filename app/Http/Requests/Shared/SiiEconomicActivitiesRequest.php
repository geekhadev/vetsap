<?php

namespace App\Http\Requests\Shared;

use App\Models\Shared\SiiEconomicActivity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiiEconomicActivitiesRequest extends FormRequest
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
        /** @var SiiEconomicActivity|null $siiEconomicActivity */
        $siiEconomicActivity = $this->route('sii_economic_activity');

        return [
            'code' => [
                'required',
                'string',
                'size:6',
                'regex:/^[0-9]{6}$/',
                Rule::unique('shared_sii_economic_activities', 'code')->ignore($siiEconomicActivity),
            ],
            'description' => ['required', 'string', 'max:65535'],
            'use_iva' => ['required', 'boolean'],
            'tax_category' => ['required', 'string', 'max:32'],
            'use_internet' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{code: string, description: string, use_iva: bool, tax_category: string, use_internet: bool}
     */
    public function siiEconomicActivityPayload(): array
    {
        /** @var array{code: string, description: string, use_iva: bool, tax_category: string, use_internet: bool} */
        return $this->safe()->only([
            'code',
            'description',
            'use_iva',
            'tax_category',
            'use_internet',
        ]);
    }
}
