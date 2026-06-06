<?php

namespace App\Models\Agenda;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Concerns\InteractsWithAgendaAppointment;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Medic\Doctor;
use App\Models\Medic\Patient;
use App\Models\Medic\Service;
use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'appointment_status_id',
    'doctor_id',
    'service_id',
    'customer_id',
    'patient_id',
    'office_id',
    'starts_at',
    'ends_at',
    'duration_minutes',
    'price',
    'source',
    'notes',
    'public_notes',
    'status_changed_at',
    'status_changed_by_user_id',
    'created_by_user_id',
    'updated_by_user_id',
])]
class Appointment extends Model
{
    use HasUuids;
    use InteractsWithAgendaAppointment;

    protected $table = 'agenda_appointments';

    public const SORTABLE_COLUMNS = [
        'starts_at',
        'ends_at',
        'created_at',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<AppointmentStatus, $this>
     */
    public function appointmentStatus(): BelongsTo
    {
        return $this->belongsTo(AppointmentStatus::class, 'appointment_status_id');
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    /**
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * @return BelongsTo<CompanyOffice, $this>
     */
    public function office(): BelongsTo
    {
        return $this->belongsTo(CompanyOffice::class, 'office_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function statusChangedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'status_changed_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    /**
     * @return HasMany<AppointmentStatusLog, $this>
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(AppointmentStatusLog::class, 'appointment_id')
            ->orderBy('occurred_at')
            ->orderBy('created_at');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'duration_minutes' => 'integer',
            'price' => 'decimal:0',
            'source' => AppointmentSource::class,
            'status_changed_at' => 'datetime',
        ];
    }
}
