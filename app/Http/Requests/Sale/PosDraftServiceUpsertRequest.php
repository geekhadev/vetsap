<?php

namespace App\Http\Requests\Sale;

use App\Support\SelectedCompanySession;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PosDraftServiceUpsertRequest extends FormRequest
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
        $companyId = SelectedCompanySession::selectedCompanyId($this) ?? '';

        return [
            'service_id' => [
                'required',
                'uuid',
                Rule::exists('medic_services', 'id')
                    ->where('company_id', $companyId)
                    ->where('is_active', true),
            ],
            'quantity_delta' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
