<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\AppointmentStatusPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentStatusStoreRequest extends FormRequest
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

        return AppointmentStatusPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, color: string, is_global: bool, is_active: bool}
     */
    public function appointmentStatusPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return AppointmentStatusPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
