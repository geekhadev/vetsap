<?php

namespace App\Models\Sale;

use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\TaxTreatment;
use App\Models\Agenda\Appointment;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\Service;
use App\Models\Store\Product;
use Database\Factories\Sale\SaleDocumentDetailFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sale_document_id',
    'detail_type',
    'service_id',
    'product_id',
    'clinical_attention_id',
    'patient_vaccination_dose_id',
    'appointment_id',
    'description',
    'notes',
    'quantity',
    'unit_price',
    'discount_percent',
    'discount_amount',
    'tax_treatment',
    'tax_percent',
    'gross_amount',
    'net_amount',
    'exempt_amount',
    'tax_amount',
    'detail_total',
    'sort_order',
])]
class SaleDocumentDetail extends Model
{
    /** @use HasFactory<SaleDocumentDetailFactory> */
    use HasFactory;

    use HasUuids;

    protected $table = 'sale_document_details';

    /**
     * @return BelongsTo<SaleDocument, $this>
     */
    public function saleDocument(): BelongsTo
    {
        return $this->belongsTo(SaleDocument::class, 'sale_document_id');
    }

    /**
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * @return BelongsTo<ClinicalAttention, $this>
     */
    public function clinicalAttention(): BelongsTo
    {
        return $this->belongsTo(ClinicalAttention::class, 'clinical_attention_id');
    }

    /**
     * @return BelongsTo<PatientVaccinationDose, $this>
     */
    public function patientVaccinationDose(): BelongsTo
    {
        return $this->belongsTo(PatientVaccinationDose::class, 'patient_vaccination_dose_id');
    }

    /**
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'detail_type' => SaleDocumentDetailType::class,
            'tax_treatment' => TaxTreatment::class,
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'discount_percent' => 'decimal:2',
            'discount_amount' => 'integer',
            'tax_percent' => 'decimal:2',
            'gross_amount' => 'integer',
            'net_amount' => 'integer',
            'exempt_amount' => 'integer',
            'tax_amount' => 'integer',
            'detail_total' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    protected static function newFactory(): SaleDocumentDetailFactory
    {
        return SaleDocumentDetailFactory::new();
    }
}
