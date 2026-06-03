<?php

namespace App\Actions\Shared\PaymentTypes;

use App\Models\Shared\PaymentType;

class UpdatePaymentTypeAction
{
    /**
     * @param  array{name: string, code: string}  $data
     */
    public function execute(PaymentType $paymentType, array $data): PaymentType
    {
        $paymentType->fill([
            'name' => $data['name'],
            'code' => $data['code'],
        ]);
        $paymentType->save();

        return $paymentType;
    }
}
