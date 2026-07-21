<?php

namespace App\Http\Requests\Sale;

use App\Enums\Sale\SaleDocumentDetailType;
use App\Enums\Sale\TaxTreatment;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PosChargeRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId() ?? '';

        return [
            'customer_id' => [
                'required',
                'uuid',
                Rule::exists('sale_customers', 'id')->where('company_id', $companyId),
            ],
            'cash_register_id' => [
                'required',
                'uuid',
                Rule::exists('sale_cash_registers', 'id')->where('company_id', $companyId),
            ],
            'sii_tax_document_type_id' => [
                'nullable',
                'uuid',
                Rule::exists('shared_sii_tax_document_types', 'id')->where('use_sale', true),
            ],
            'payment_type_id' => [
                'required',
                'uuid',
                Rule::exists('shared_payment_types', 'id'),
            ],
            'global_discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'draft_sale_document_ids' => ['nullable', 'array'],
            'draft_sale_document_ids.*' => [
                'uuid',
                Rule::exists('sale_documents', 'id')->where('company_id', $companyId),
            ],
            'extra_details' => ['nullable', 'array'],
            'extra_details.*.detail_type' => ['required', 'string', Rule::enum(SaleDocumentDetailType::class)],
            'extra_details.*.product_id' => [
                'nullable',
                'uuid',
                Rule::exists('store_products', 'id')->where('company_id', $companyId),
            ],
            'extra_details.*.description' => ['required', 'string', 'max:255'],
            'extra_details.*.quantity' => ['required', 'integer', 'min:1'],
            'extra_details.*.unit_price' => ['required', 'integer', 'min:0'],
            'extra_details.*.discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'extra_details.*.tax_treatment' => ['required', 'string', Rule::enum(TaxTreatment::class)],
            'payments' => ['nullable', 'array'],
            'payments.*.payment_method_id' => [
                'required',
                'uuid',
                Rule::exists('shared_payment_methods', 'id'),
            ],
            'payments.*.amount' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array{
     *     customer_id: string,
     *     cash_register_id: string,
     *     sii_tax_document_type_id: string|null,
     *     payment_type_id: string,
     *     global_discount_percent: float,
     *     draft_sale_document_ids: list<string>,
     *     extra_details: list<array<string, mixed>>,
     *     payments: list<array{payment_method_id: string, amount: int}>,
     *     notes: string|null
     * }
     */
    public function chargePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return [
            'customer_id' => (string) $validated['customer_id'],
            'cash_register_id' => (string) $validated['cash_register_id'],
            'sii_tax_document_type_id' => $validated['sii_tax_document_type_id'] ?? null,
            'payment_type_id' => (string) $validated['payment_type_id'],
            'global_discount_percent' => (float) ($validated['global_discount_percent'] ?? 0),
            'draft_sale_document_ids' => array_values($validated['draft_sale_document_ids'] ?? []),
            'extra_details' => array_values($validated['extra_details'] ?? []),
            'payments' => array_map(
                static fn (array $payment): array => [
                    'payment_method_id' => (string) $payment['payment_method_id'],
                    'amount' => (int) $payment['amount'],
                ],
                $validated['payments'] ?? [],
            ),
            'notes' => $validated['notes'] ?? null,
        ];
    }
}
