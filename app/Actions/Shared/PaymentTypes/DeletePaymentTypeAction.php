<?php

namespace App\Actions\Shared\PaymentTypes;

use App\Models\Shared\PaymentType;

class DeletePaymentTypeAction
{
    public function execute(PaymentType $paymentType): void
    {
        $paymentType->delete();
    }
}
