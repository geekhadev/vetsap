<?php

namespace Database\Seeders\Purchase;

use App\Enums\Purchase\PurchaseOrderStatusColor;
use App\Models\Purchase\PurchaseOrderStatus;
use Illuminate\Database\Seeder;

class PurchaseOrderStatusesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Borrador',
                'color' => PurchaseOrderStatusColor::Slate,
            ],
            [
                'name' => 'Enviada',
                'color' => PurchaseOrderStatusColor::Blue,
            ],
            [
                'name' => 'Parcialmente recibida',
                'color' => PurchaseOrderStatusColor::Amber,
            ],
            [
                'name' => 'Recibida',
                'color' => PurchaseOrderStatusColor::Green,
            ],
            [
                'name' => 'Cancelada',
                'color' => PurchaseOrderStatusColor::Red,
            ],
        ];

        foreach ($defaults as $row) {
            PurchaseOrderStatus::query()->firstOrCreate(
                [
                    'company_id' => null,
                    'name' => $row['name'],
                ],
                [
                    'color' => $row['color'],
                    'is_global' => true,
                ],
            );
        }
    }
}
