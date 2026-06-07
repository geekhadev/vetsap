<?php

namespace App\Http\Requests\Configuration;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Medic\Service;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCalendarSettingsRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('default_service_id') === '') {
            $this->merge(['default_service_id' => null]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return [
                'starts_at' => ['required'],
            ];
        }

        return [
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'time_block_minutes' => ['required', 'string', Rule::in(['15', '30', '45', '60'])],
            'default_service_id' => [
                'nullable',
                'string',
                Rule::exists(Service::class, 'id')->where(
                    fn ($query) => $query
                        ->where('company_id', $companyId)
                        ->where('is_active', true),
                ),
            ],
            'doctor_notifications' => ['required', 'array'],
            'doctor_notifications.on_create' => ['required', 'boolean'],
            'doctor_notifications.on_confirm' => ['required', 'boolean'],
            'doctor_notifications.on_cancel' => ['required', 'boolean'],
            'doctor_notifications.on_reschedule' => ['required', 'boolean'],
            'client_notifications' => ['required', 'array'],
            'client_notifications.on_create' => ['required', 'boolean'],
            'client_notifications.on_confirm' => ['required', 'boolean'],
            'client_notifications.on_cancel' => ['required', 'boolean'],
            'client_notifications.on_reschedule' => ['required', 'boolean'],
            'client_notifications.on_payment_issued' => ['required', 'boolean'],
            'client_notifications.on_invoice_issued' => ['required', 'boolean'],
            'client_notifications.on_medical_record_after_visit' => ['required', 'boolean'],
            'client_notifications.on_prescription_after_visit' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{
     *     starts_at: string,
     *     ends_at: string,
     *     time_block_minutes: string,
     *     default_service_id: string|null,
     *     doctor_notifications: array{
     *         on_create: bool,
     *         on_confirm: bool,
     *         on_cancel: bool,
     *         on_reschedule: bool,
     *     },
     *     client_notifications: array{
     *         on_create: bool,
     *         on_confirm: bool,
     *         on_cancel: bool,
     *         on_reschedule: bool,
     *         on_payment_issued: bool,
     *         on_invoice_issued: bool,
     *         on_medical_record_after_visit: bool,
     *         on_prescription_after_visit: bool,
     *     },
     * }
     */
    public function calendarSettingsPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        /** @var array{on_create: bool, on_confirm: bool, on_cancel: bool, on_reschedule: bool} $doctorNotifications */
        $doctorNotifications = $validated['doctor_notifications'];

        /** @var array{
         *     on_create: bool,
         *     on_confirm: bool,
         *     on_cancel: bool,
         *     on_reschedule: bool,
         *     on_payment_issued: bool,
         *     on_invoice_issued: bool,
         *     on_medical_record_after_visit: bool,
         *     on_prescription_after_visit: bool,
         * } $clientNotifications */
        $clientNotifications = $validated['client_notifications'];

        $defaultServiceId = $validated['default_service_id'] ?? null;

        return [
            'starts_at' => (string) $validated['starts_at'],
            'ends_at' => (string) $validated['ends_at'],
            'time_block_minutes' => (string) $validated['time_block_minutes'],
            'default_service_id' => $defaultServiceId !== null && $defaultServiceId !== ''
                ? (string) $defaultServiceId
                : null,
            'doctor_notifications' => $doctorNotifications,
            'client_notifications' => $clientNotifications,
        ];
    }
}
