<?php

namespace App\Models;

use Database\Factories\CompanyOfficeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'name',
    'email',
    'phone',
    'address',
    'is_main',
])]
class CompanyOffice extends Model
{
    /** @use HasFactory<CompanyOfficeFactory> */
    use HasFactory, HasUuids;

    protected $table = 'configuration_company_offices';

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @param  Builder<CompanyOffice>  $query
     * @return Builder<CompanyOffice>
     */
    public function scopeWhereNotMain(Builder $query): Builder
    {
        return $query->where('is_main', false);
    }

    /**
     * @param  Builder<CompanyOffice>  $query
     * @return Builder<CompanyOffice>
     */
    public function scopeWhereMain(Builder $query): Builder
    {
        return $query->where('is_main', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_main' => 'boolean',
        ];
    }

    protected static function newFactory(): CompanyOfficeFactory
    {
        return CompanyOfficeFactory::new();
    }
}
