<?php

namespace App\Actions\Shared\PaymentMethods;

use App\Models\Shared\PaymentMethod;

class UpdatePaymentMethodAction
{
    /**
     * @param  array{name: string, code: string}  $data
     */
    public function execute(PaymentMethod $paymentMethod, array $data): PaymentMethod
    {
        $paymentMethod->name = $data['name'];
        $paymentMethod->code = $data['code'];
        $paymentMethod->save();

        return $paymentMethod->fresh() ?? $paymentMethod;
    }
}
