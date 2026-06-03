<?php

namespace App\Http\Requests\Configuration;

use App\Models\Company;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanyOfficeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $company = $this->route('company');

        return $company instanceof Company && $this->user()?->can('update', $company) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Company $company */
        $company = $this->route('company');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('configuration_company_offices', 'name')
                    ->where('company_id', $company->id),
            ],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'is_main' => ['prohibited'],
        ];
    }
}
