<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Models\Company;
use App\Models\CompanyIntegrationSetting;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\SiiEconomicActivity;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use Illuminate\Support\Carbon;

final class BuildSaleDocumentPreviewAction
{
    /**
     * Payload para vista previa estilo DTE / documento oficial SII.
     *
     * @return array{
     *     id: string,
     *     status: string,
     *     document_number: string|null,
     *     issued_at: string|null,
     *     tax_percent: float,
     *     tax_amount: int,
     *     net_amount: int,
     *     exempt_amount: int,
     *     global_discount_percent: float,
     *     global_discount_amount: int,
     *     total_amount: int,
     *     paid_amount: int,
     *     notes: string|null,
     *     sii_tax_document_type: array{id: string, code: string, name: string, abbreviation: string}|null,
     *     is_boleta: bool,
     *     receptor: array{
     *         name: string,
     *         document_type: string|null,
     *         document_number: string|null,
     *         address: string|null,
     *         email: string|null,
     *         phone: string|null
     *     },
     *     emisor: array{
     *         name: string,
     *         document_number: string|null,
     *         address: string|null,
     *         city: string|null,
     *         giro: string|null,
     *         acteco: string|null,
     *         acteco_description: string|null,
     *         resolution_number: string|null,
     *         resolution_date: string|null
     *     },
     *     details: list<array{
     *         description: string,
     *         quantity: int,
     *         unit_price: int,
     *         discount_percent: float,
     *         tax_treatment: string,
     *         detail_total: int
     *     }>,
     *     payments: list<array{method_name: string, amount: int}>
     * }
     */
    public function execute(SaleDocument $document): array
    {
        $document->loadMissing([
            'company:id,name,document_number,address',
            'siiTaxDocumentType:id,code,name,abbreviation',
            'details',
            'payments.paymentMethod:id,name,code',
        ]);

        $company = $document->company;
        $siiType = $document->siiTaxDocumentType;
        $code = $siiType?->code;
        $isBoleta = $this->isBoletaCode($code);
        $settings = $this->siiSettingsMap($document->company_id);

        $actecoCode = $this->setting($settings, CompanySiiIntegrationSettingKeys::ACTECO);
        $actecoDescription = null;
        if ($actecoCode !== null && $actecoCode !== '') {
            $actecoDescription = SiiEconomicActivity::query()
                ->where('code', $actecoCode)
                ->value('description');
        }

        $resolutionNumberKey = $isBoleta
            ? CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS
            : CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_INVOICES;
        $resolutionDateKey = $isBoleta
            ? CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS
            : CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_INVOICES;

        $resolutionDateRaw = $this->setting($settings, $resolutionDateKey);
        $resolutionDate = null;
        if ($resolutionDateRaw) {
            $resolutionDate = Carbon::parse($resolutionDateRaw)->format('d/m/Y');
        }

        return [
            'id' => $document->id,
            'status' => $document->status->value,
            'payment_status' => $document->payment_status->value,
            'document_number' => $document->document_number,
            'issued_at' => $document->issued_at?->toIso8601String()
                ?? $document->created_at?->toIso8601String(),
            'tax_percent' => (float) $document->tax_percent,
            'tax_amount' => (int) $document->tax_amount,
            'net_amount' => (int) $document->net_amount,
            'exempt_amount' => (int) $document->exempt_amount,
            'global_discount_percent' => (float) $document->global_discount_percent,
            'global_discount_amount' => (int) $document->global_discount_amount,
            'total_amount' => (int) $document->total_amount,
            'paid_amount' => (int) $document->paid_amount,
            'notes' => $document->notes,
            'sii_tax_document_type' => $siiType
                ? [
                    'id' => $siiType->id,
                    'code' => $siiType->code,
                    'name' => $siiType->name,
                    'abbreviation' => $siiType->abbreviation,
                ]
                : null,
            'is_boleta' => $isBoleta,
            'receptor' => [
                'name' => $document->customer_name,
                'document_type' => $document->customer_document_type,
                'document_number' => $document->customer_document_number,
                'address' => $document->customer_address,
                'email' => $document->customer_email,
                'phone' => $document->customer_phone,
            ],
            'emisor' => [
                'name' => $company instanceof Company ? $company->name : '',
                'document_number' => $company instanceof Company ? $company->document_number : null,
                'address' => $this->setting($settings, CompanySiiIntegrationSettingKeys::DIRECTION)
                    ?? ($company instanceof Company ? $company->address : null),
                'city' => $this->setting($settings, CompanySiiIntegrationSettingKeys::CITY),
                'giro' => $this->setting($settings, CompanySiiIntegrationSettingKeys::GIRO),
                'acteco' => $actecoCode,
                'acteco_description' => $actecoDescription !== null ? (string) $actecoDescription : null,
                'resolution_number' => $this->setting($settings, $resolutionNumberKey),
                'resolution_date' => $resolutionDate,
            ],
            'details' => $document->details
                ->map(static function (SaleDocumentDetail $detail): array {
                    return [
                        'description' => $detail->description,
                        'quantity' => (int) $detail->quantity,
                        'unit_price' => (int) $detail->unit_price,
                        'discount_percent' => (float) $detail->discount_percent,
                        'tax_treatment' => $detail->tax_treatment->value,
                        'detail_total' => (int) $detail->detail_total,
                    ];
                })
                ->values()
                ->all(),
            'payments' => $document->payments
                ->map(static function (SaleDocumentPayment $payment): array {
                    return [
                        'method_name' => $payment->paymentMethod?->name ?? 'Pago',
                        'amount' => (int) $payment->amount,
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    private function isBoletaCode(?string $code): bool
    {
        if ($code === null || $code === '') {
            return true;
        }

        return in_array($code, ['39', '41', '35', '38'], true);
    }

    /**
     * @return array<string, string>
     */
    private function siiSettingsMap(string $companyId): array
    {
        return CompanyIntegrationSetting::query()
            ->where('company_id', $companyId)
            ->whereIn('key', CompanySiiIntegrationSettingKeys::all())
            ->pluck('value', 'key')
            ->map(static fn ($value): string => (string) $value)
            ->all();
    }

    /**
     * @param  array<string, string>  $settings
     */
    private function setting(array $settings, string $key): ?string
    {
        $value = $settings[$key] ?? null;

        if ($value === null || trim($value) === '') {
            return null;
        }

        return $value;
    }
}
