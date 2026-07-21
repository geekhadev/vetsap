<?php

namespace App\Models\Sale;

use App\Models\Company;
use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'sii_tax_document_type_id',
    'last_number',
])]
class SaleDocumentNumberSequence extends Model
{
    use HasUuids;

    protected $table = 'sale_document_number_sequences';

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<SiiTaxDocumentType, $this>
     */
    public function siiTaxDocumentType(): BelongsTo
    {
        return $this->belongsTo(SiiTaxDocumentType::class, 'sii_tax_document_type_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_number' => 'integer',
        ];
    }
}
