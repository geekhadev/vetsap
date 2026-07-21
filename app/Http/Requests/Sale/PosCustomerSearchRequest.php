<?php

namespace App\Http\Requests\Sale;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PosCustomerSearchRequest extends FormRequest
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
            'q' => ['required', 'string', 'min:2', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'q' => is_string($this->input('q')) ? trim($this->input('q')) : $this->input('q'),
        ]);
    }
}
