<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\AppointmentPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentStoreRequest extends FormRequest
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
            return ['customer_id' => ['required']];
        }

        return AppointmentPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function appointmentPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return $validated;
    }
}
