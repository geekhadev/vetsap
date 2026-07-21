<?php

namespace App\Models\Store;

use App\Models\Company;
use App\Models\Store\Concerns\InteractsWithStoreMasterRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'name',
    'is_active',
])]
class ProductType extends Model
{
    use HasUuids;
    use InteractsWithStoreMasterRecord;

    protected $table = 'store_product_types';

    /**
     * Tipo global reservado: los servicios se gestionan en Medicina, no como productos.
     */
    public const GLOBAL_SERVICES_NAME = 'Servicios';

    /**
     * Tipo global para productos vacuna (planes de vacunación / inventario).
     */
    public const GLOBAL_VACCINES_NAME = 'Vacunas';

    public const SORTABLE_COLUMNS = [
        'name',
        'is_active',
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
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'product_type_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
