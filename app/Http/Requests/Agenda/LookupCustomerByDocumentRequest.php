<?php

namespace App\Http\Requests\Agenda;

use App\Enums\Sale\CustomerDocumentType;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LookupCustomerByDocumentRequest extends FormRequest
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
        return [
            'document_type' => ['required', Rule::enum(CustomerDocumentType::class)],
            'document_number' => ['required', 'string', 'min:3', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $documentNumber = $this->input('document_number');

        $this->merge([
            'document_number' => is_string($documentNumber)
                ? trim($documentNumber)
                : $documentNumber,
        ]);
    }

    public function documentType(): CustomerDocumentType
    {
        $value = $this->validated('document_type');

        return $value instanceof CustomerDocumentType
            ? $value
            : CustomerDocumentType::from((string) $value);
    }

    public function documentNumber(): string
    {
        return (string) $this->validated('document_number');
    }
}
