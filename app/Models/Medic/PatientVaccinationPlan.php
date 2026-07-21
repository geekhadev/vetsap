<?php

namespace App\Models\Medic;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'patient_id',
    'protocol_id',
    'protocol_snapshot',
    'assigned_at',
    'assigned_by',
])]
class PatientVaccinationPlan extends Model
{
    use HasUuids;

    protected $table = 'medic_patient_vaccination_plans';

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * @return BelongsTo<VaccinationProtocol, $this>
     */
    public function protocol(): BelongsTo
    {
        return $this->belongsTo(VaccinationProtocol::class, 'protocol_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * @return HasMany<PatientVaccinationDose, $this>
     */
    public function doses(): HasMany
    {
        return $this->hasMany(PatientVaccinationDose::class, 'plan_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'protocol_snapshot' => 'array',
            'assigned_at' => 'datetime',
        ];
    }
}
