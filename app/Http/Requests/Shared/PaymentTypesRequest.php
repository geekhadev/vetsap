<?php

namespace App\Http\Requests\Shared;

use App\Models\Shared\PaymentType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentTypesRequest extends FormRequest
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
        /** @var PaymentType|null $paymentType */
        $paymentType = $this->route('payment_type');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shared_payment_types', 'name')->ignore($paymentType),
            ],
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shared_payment_types', 'code')->ignore($paymentType),
            ],
        ];
    }

    /**
     * @return array{name: string, code: string}
     */
    public function paymentTypePayload(): array
    {
        /** @var array{name: string, code: string} */
        return $this->safe()->only(['name', 'code']);
    }
}
