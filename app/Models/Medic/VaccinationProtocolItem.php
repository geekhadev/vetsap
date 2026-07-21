<?php

namespace App\Models\Medic;

use App\Enums\Medic\VaccinationScheduleType;
use App\Models\Store\Product;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'protocol_id',
    'product_id',
    'schedule_type',
    'week_number',
    'min_age_weeks',
    'max_age_weeks',
    'interval_months',
    'series_key',
    'sort_order',
])]
class VaccinationProtocolItem extends Model
{
    use HasUuids;

    protected $table = 'medic_vaccination_protocol_items';

    /**
     * @return BelongsTo<VaccinationProtocol, $this>
     */
    public function protocol(): BelongsTo
    {
        return $this->belongsTo(VaccinationProtocol::class, 'protocol_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'schedule_type' => VaccinationScheduleType::class,
            'week_number' => 'integer',
            'min_age_weeks' => 'integer',
            'max_age_weeks' => 'integer',
            'interval_months' => 'integer',
            'sort_order' => 'integer',
        ];
    }
}
