<?php

namespace App\Http\Requests\Sale;

use App\Enums\Sale\SaleDocumentStatus;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Sale\SaleDocument;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaleDocumentChargeRequest extends FormRequest
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
        $document = $this->routeSaleDocument();
        $isDraft = $document?->status === SaleDocumentStatus::Draft;

        return [
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
                Rule::requiredIf($isDraft),
                'nullable',
                'uuid',
                Rule::exists('shared_payment_types', 'id'),
            ],
            'payments' => ['nullable', 'array'],
            'payments.*.payment_method_id' => [
                'required',
                'uuid',
                Rule::exists('shared_payment_methods', 'id'),
            ],
            'payments.*.amount' => ['required', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $document = $this->routeSaleDocument();

            if (! $document instanceof SaleDocument) {
                return;
            }

            if ($document->status === SaleDocumentStatus::Issued) {
                if ($this->filled('payment_type_id')) {
                    $validator->errors()->add(
                        'payment_type_id',
                        'No puedes cambiar el tipo de pago de un documento emitido.',
                    );
                }

                if ($this->filled('sii_tax_document_type_id')) {
                    $validator->errors()->add(
                        'sii_tax_document_type_id',
                        'No puedes cambiar el tipo de documento de un documento emitido.',
                    );
                }
            }
        });
    }

    /**
     * @return array{
     *     cash_register_id: string,
     *     sii_tax_document_type_id: string|null,
     *     payment_type_id: string|null,
     *     payments: list<array{payment_method_id: string, amount: int}>
     * }
     */
    public function chargePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return [
            'cash_register_id' => (string) $validated['cash_register_id'],
            'sii_tax_document_type_id' => $validated['sii_tax_document_type_id'] ?? null,
            'payment_type_id' => $validated['payment_type_id'] ?? null,
            'payments' => array_map(
                static fn (array $payment): array => [
                    'payment_method_id' => (string) $payment['payment_method_id'],
                    'amount' => (int) $payment['amount'],
                ],
                $validated['payments'] ?? [],
            ),
        ];
    }

    private function routeSaleDocument(): ?SaleDocument
    {
        $document = $this->route('sale_document');

        return $document instanceof SaleDocument ? $document : null;
    }
}
