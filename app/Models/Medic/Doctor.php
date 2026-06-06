<?php

namespace App\Models\Medic;

use App\Enums\Medic\DoctorDocumentType;
use App\Models\Company;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'company_id',
    'document_type',
    'document_number',
    'first_name',
    'last_name',
    'phone',
    'email',
    'is_active',
    'use_web',
])]
class Doctor extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'medic_doctors';

    public const SORTABLE_COLUMNS = [
        'first_name',
        'last_name',
        'document_number',
        'is_active',
        'use_web',
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
     * @return BelongsToMany<Service, $this>
     */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(
            Service::class,
            'medic_doctor_services',
            'doctor_id',
            'service_id',
        )
            ->withPivot('duration_override_minutes')
            ->withTimestamps();
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
            $inner->where('first_name', 'like', $term)
                ->orWhere('last_name', 'like', $term)
                ->orWhere('document_number', 'like', $term)
                ->orWhere('phone', 'like', $term)
                ->orWhere('email', 'like', $term);
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_type' => DoctorDocumentType::class,
            'is_active' => 'boolean',
            'use_web' => 'boolean',
        ];
    }
}
