<?php

namespace App\Actions\Shared\PaymentMethods;

use App\Models\Shared\PaymentMethod;

class CreatePaymentMethodAction
{
    /**
     * @param  array{name: string, code: string}  $data
     */
    public function execute(array $data): PaymentMethod
    {
        return PaymentMethod::query()->create([
            'name' => $data['name'],
            'code' => $data['code'],
        ]);
    }
}
