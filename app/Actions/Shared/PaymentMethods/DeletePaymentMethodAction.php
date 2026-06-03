<?php

namespace App\Actions\Shared\PaymentMethods;

use App\Models\Shared\PaymentMethod;

class DeletePaymentMethodAction
{
    public function execute(PaymentMethod $paymentMethod): void
    {
        $paymentMethod->delete();
    }
}
