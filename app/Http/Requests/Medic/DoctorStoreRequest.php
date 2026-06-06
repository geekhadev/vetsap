<?php

namespace App\Http\Requests\Medic;

use App\Enums\Medic\DoctorDocumentType;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\DoctorPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DoctorStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge(DoctorPayloadValidationRules::mergeNormalizedNullableFields([
            'phone' => $this->input('phone'),
            'email' => $this->input('email'),
        ]));
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return ['first_name' => ['required']];
        }

        return DoctorPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{
     *     company_id: string,
     *     document_type: DoctorDocumentType,
     *     document_number: string,
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public function doctorPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return DoctorPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
