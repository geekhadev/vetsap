<?php

namespace App\Models\Medic;

use App\Enums\Medic\PatientSex;
use App\Models\Agenda\Appointment;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\Sale\Customer;
use App\Support\Storage\PublicStorageUrl;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'customer_id',
    'species_id',
    'record_number',
    'name',
    'breed',
    'sex',
    'birth_date',
    'weight_kg',
    'is_sterilized',
    'colors',
    'blood_type',
    'microchip_number',
    'photo_path',
    'is_active',
])]
class Patient extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_patients';

    public const SORTABLE_COLUMNS = [
        'record_number',
        'name',
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
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    /**
     * @return BelongsTo<Species, $this>
     */
    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class, 'species_id');
    }

    /**
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterSpecies(Builder $query, ?string $speciesId): Builder
    {
        if ($speciesId === null || $speciesId === '') {
            return $query;
        }

        return $query->where('species_id', $speciesId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeFilterCustomer(Builder $query, ?string $customerId): Builder
    {
        if ($customerId === null || $customerId === '') {
            return $query;
        }

        return $query->where('customer_id', $customerId);
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

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->where('name', 'like', $term)
                ->orWhere('record_number', 'like', $term)
                ->orWhere('microchip_number', 'like', $term)
                ->orWhere('breed', 'like', $term);
        });
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function photoUrl(): Attribute
    {
        return Attribute::get(
            fn (): ?string => PublicStorageUrl::fromRelativePath($this->photo_path),
        );
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sex' => PatientSex::class,
            'birth_date' => 'date',
            'weight_kg' => 'decimal:2',
            'is_sterilized' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
