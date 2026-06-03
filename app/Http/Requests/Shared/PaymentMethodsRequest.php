<?php

namespace App\Http\Requests\Shared;

use App\Models\Shared\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PaymentMethodsRequest extends FormRequest
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
        /** @var PaymentMethod|null $paymentMethod */
        $paymentMethod = $this->route('payment_method');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('shared_payment_methods', 'name')->ignore($paymentMethod),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('shared_payment_methods', 'code')->ignore($paymentMethod),
            ],
        ];
    }

    /**
     * @return array{name: string, code: string}
     */
    public function paymentMethodPayload(): array
    {
        /** @var array{name: string, code: string} */
        return $this->safe()->only(['name', 'code']);
    }
}
