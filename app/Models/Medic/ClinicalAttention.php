<?php

namespace App\Models\Medic;

use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'appointment_id',
    'template_id',
    'patient_id',
    'doctor_id',
    'status',
    'created_by_user_id',
    'updated_by_user_id',
])]
class ClinicalAttention extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_clinical_attentions';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ClinicalAttentionStatus::class,
        ];
    }

    public const SORTABLE_COLUMNS = [
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
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * @return BelongsTo<ClinicalTemplate, $this>
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ClinicalTemplate::class, 'template_id');
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * @return BelongsTo<Doctor, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return HasMany<ClinicalAttentionValue, $this>
     */
    public function values(): HasMany
    {
        return $this->hasMany(ClinicalAttentionValue::class, 'attention_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('status', ClinicalAttentionStatus::Closed);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', ClinicalAttentionStatus::Draft);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterPatient(Builder $query, ?string $patientId): Builder
    {
        if ($patientId === null || $patientId === '') {
            return $query;
        }

        return $query->where('patient_id', $patientId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterDoctor(Builder $query, ?string $doctorId): Builder
    {
        if ($doctorId === null || $doctorId === '') {
            return $query;
        }

        return $query->where('doctor_id', $doctorId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterTemplate(Builder $query, ?string $templateId): Builder
    {
        if ($templateId === null || $templateId === '') {
            return $query;
        }

        return $query->where('template_id', $templateId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->whereHas('patient', fn (Builder $q) => $q->where('name', 'like', $term))
            ->orWhereHas('doctor', fn (Builder $q) => $q->where('first_name', 'like', $term)->orWhere('last_name', 'like', $term));
    }
}
