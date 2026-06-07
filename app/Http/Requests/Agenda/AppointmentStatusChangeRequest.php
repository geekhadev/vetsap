<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AppointmentStatusChangeRequest extends FormRequest
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
            return ['appointment_status_id' => ['required']];
        }

        return [
            'appointment_status_id' => [
                'required',
                'uuid',
                Rule::exists('agenda_appointment_statuses', 'id')->where(function ($query) use ($companyId): void {
                    $query->where('is_active', true)
                        ->where(function ($inner) use ($companyId): void {
                            $inner->where('company_id', $companyId)
                                ->orWhere(function ($global): void {
                                    $global->where('is_global', true)
                                        ->whereNull('company_id');
                                });
                        });
                }),
            ],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function appointmentStatusId(): string
    {
        return (string) $this->validated('appointment_status_id');
    }

    public function statusChangeNotes(): ?string
    {
        $notes = $this->validated('notes');

        return is_string($notes) && $notes !== '' ? $notes : null;
    }
}
