<?php

namespace App\Http\Requests\Shared;

use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiiTaxDocumentTypesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var SiiTaxDocumentType|null $siiTaxDocumentType */
        $siiTaxDocumentType = $this->route('sii_tax_document_type');

        return [
            'code' => [
                'required',
                'string',
                'max:16',
                Rule::unique('shared_sii_tax_document_types', 'code')->ignore($siiTaxDocumentType),
            ],
            'name' => ['required', 'string', 'max:512'],
            'abbreviation' => ['required', 'string', 'max:32'],
            'use_sale' => ['required', 'boolean'],
            'use_purchase' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{code: string, name: string, abbreviation: string, use_sale: bool, use_purchase: bool}
     */
    public function siiTaxDocumentTypePayload(): array
    {
        /** @var array{code: string, name: string, abbreviation: string, use_sale: bool, use_purchase: bool} */
        return $this->safe()->only([
            'code',
            'name',
            'abbreviation',
            'use_sale',
            'use_purchase',
        ]);
    }
}
