<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\HolidayPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class HolidayStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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
            return ['name' => ['required']];
        }

        return HolidayPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, date: string, is_active: bool}
     */
    public function holidayPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return HolidayPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
