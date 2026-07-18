<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductBarcodeLookupRequest extends FormRequest
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
            'barcode' => ['required', 'string', 'min:1', 'max:64'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $barcode = $this->input('barcode');

        $this->merge([
            'barcode' => is_string($barcode) ? trim($barcode) : $barcode,
        ]);
    }
}
