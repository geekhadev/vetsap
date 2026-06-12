<?php

namespace App\Http\Requests\Medic;

use App\Actions\Configuration\CalendarSettings\ResolveCalendarTimeBlockMinutesAction;
use App\Models\Company;
use App\Support\Validation\DoctorPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DoctorSyncServicesRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('services_present') && ! $this->has('services')) {
            $this->merge(['services' => []]);
        }

        $services = $this->input('services');
        if (! is_array($services)) {
            return;
        }

        foreach ($services as $index => $row) {
            if (! is_array($row)) {
                continue;
            }
            $durationOverride = $row['duration_override_minutes'] ?? null;
            if ($durationOverride === '') {
                $services[$index]['duration_override_minutes'] = null;
            }

            $priceOverride = $row['price_override'] ?? null;
            if ($priceOverride === '') {
                $services[$index]['price_override'] = null;
            }
        }

        $this->merge(['services' => $services]);
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
        $companyId = data_get($this->session()->get('company_selected'), 'id');

        if (! is_string($companyId) || $companyId === '') {
            return ['services' => ['required']];
        }

        $timeBlockMinutes = 30;
        $company = Company::query()->find($companyId);

        if ($company instanceof Company) {
            $timeBlockMinutes = app(ResolveCalendarTimeBlockMinutesAction::class)->execute($company);
        }

        return DoctorPayloadValidationRules::syncServicesRules($companyId, $timeBlockMinutes);
    }

    /**
     * @return list<array{service_id: string, duration_override_minutes: int|null, price_override: int|null}>
     */
    public function servicesPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return DoctorPayloadValidationRules::servicesPayload($validated);
    }
}
