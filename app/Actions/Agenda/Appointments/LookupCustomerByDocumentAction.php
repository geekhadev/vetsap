<?php

namespace App\Actions\Agenda\Appointments;

use App\Enums\Sale\CustomerDocumentType;
use App\Models\Sale\Customer;
use App\Support\Sale\ChileRut;

final class LookupCustomerByDocumentAction
{
    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     document_type: string,
     *     document_number: string,
     *     phone: string|null,
     *     email: string|null,
     * }|null
     */
    public function execute(
        string $companyId,
        CustomerDocumentType $documentType,
        string $documentNumber,
    ): ?array {
        $needle = $this->normalizeDocument($documentType, $documentNumber);

        if ($needle === '') {
            return null;
        }

        $customer = Customer::query()
            ->forCompany($companyId)
            ->where('document_type', $documentType)
            ->get(['id', 'name', 'document_type', 'document_number', 'phone', 'email'])
            ->first(
                fn (Customer $row): bool => $this->normalizeDocument(
                    $documentType,
                    (string) $row->document_number,
                ) === $needle,
            );

        if (! $customer instanceof Customer) {
            return null;
        }

        $documentTypeValue = $customer->document_type instanceof CustomerDocumentType
            ? $customer->document_type->value
            : (string) $customer->document_type;

        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'document_type' => $documentTypeValue,
            'document_number' => (string) $customer->document_number,
            'phone' => $customer->phone,
            'email' => $customer->email,
        ];
    }

    private function normalizeDocument(
        CustomerDocumentType $documentType,
        string $documentNumber,
    ): string {
        if ($documentType === CustomerDocumentType::Rut) {
            return ChileRut::normalize($documentNumber);
        }

        return mb_strtolower(trim($documentNumber));
    }
}
