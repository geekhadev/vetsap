<?php

namespace App\Models\Medic;

use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseSource;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Store\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'plan_id',
    'product_id',
    'series_key',
    'sequence',
    'scheduled_on',
    'administered_on',
    'status',
    'administered_origin',
    'source',
    'notes',
    'recorded_by',
])]
class PatientVaccinationDose extends Model
{
    use HasUuids;

    protected $table = 'medic_patient_vaccination_doses';

    /**
     * @return BelongsTo<PatientVaccinationPlan, $this>
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(PatientVaccinationPlan::class, 'plan_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'scheduled_on' => 'date',
            'administered_on' => 'datetime',
            'status' => VaccinationDoseStatus::class,
            'administered_origin' => VaccinationAdministeredOrigin::class,
            'source' => VaccinationDoseSource::class,
        ];
    }
}
