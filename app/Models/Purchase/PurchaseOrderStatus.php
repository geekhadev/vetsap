<?php

namespace App\Models\Purchase;

use App\Enums\Purchase\PurchaseOrderStatusColor;
use App\Models\Company;
use App\Models\Purchase\Concerns\InteractsWithCompanyOrGlobalMasterRecord;
use Database\Factories\Purchase\PurchaseOrderStatusFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'name',
    'color',
    'is_global',
])]
class PurchaseOrderStatus extends Model
{
    /** @use HasFactory<PurchaseOrderStatusFactory> */
    use HasFactory;

    use HasUuids;
    use InteractsWithCompanyOrGlobalMasterRecord;

    protected $table = 'purchase_order_statuses';

    public const SORTABLE_COLUMNS = [
        'name',
        'color',
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
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'color' => PurchaseOrderStatusColor::class,
            'is_global' => 'boolean',
        ];
    }
}
