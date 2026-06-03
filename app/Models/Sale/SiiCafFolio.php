<?php

namespace App\Models\Sale;

use App\Enums\Sale\SiiCafFolioStatus;
use App\Models\Company;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sale_sii_caf_id',
    'company_id',
    'folio_number',
    'status',
    'used_at',
])]
class SiiCafFolio extends Model
{
    use HasUuids;

    protected $table = 'sale_sii_caf_folios';

    /**
     * @return BelongsTo<SiiCaf, $this>
     */
    public function siiCaf(): BelongsTo
    {
        return $this->belongsTo(SiiCaf::class, 'sale_sii_caf_id');
    }

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
            'folio_number' => 'integer',
            'status' => SiiCafFolioStatus::class,
            'used_at' => 'datetime',
        ];
    }
}
