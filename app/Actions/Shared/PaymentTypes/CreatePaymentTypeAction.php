<?php

namespace App\Actions\Shared\PaymentTypes;

use App\Models\Shared\PaymentType;

class CreatePaymentTypeAction
{
    /**
     * @param  array{name: string, code: string}  $data
     */
    public function execute(array $data): PaymentType
    {
        return PaymentType::query()->create([
            'name' => $data['name'],
            'code' => $data['code'],
        ]);
    }
}
