<?php

namespace Database\Seeders\Shared;

use App\Models\Shared\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodsSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            ['name' => 'Efectivo', 'code' => 'EF'],
            ['name' => 'Tarjeta de débito', 'code' => 'TDD'],
            ['name' => 'Tarjeta de crédito', 'code' => 'TDC'],
            ['name' => 'Transferencia', 'code' => 'TR'],
            ['name' => 'Depósito', 'code' => 'DP'],
            ['name' => 'Cheque', 'code' => 'CH'],
            ['name' => 'Otro', 'code' => 'OT'],
        ];

        foreach ($methods as $method) {
            PaymentMethod::query()->firstOrCreate(
                ['code' => $method['code']],
                ['name' => $method['name']],
            );
        }
    }
}
