<?php

namespace App\Http\Requests\Configuration;

use App\Models\Company;
use App\Models\CompanyOffice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompanyOfficeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $company = $this->route('company');
        $office = $this->route('office');

        if (! $company instanceof Company || ! $office instanceof CompanyOffice) {
            return false;
        }

        if ($office->company_id !== $company->id) {
            return false;
        }

        return $this->user()?->can('update', $office) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Company $company */
        $company = $this->route('company');
        /** @var CompanyOffice $office */
        $office = $this->route('office');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('configuration_company_offices', 'name')
                    ->where('company_id', $company->id)
                    ->ignore($office->id),
            ],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
        ];
    }
}
