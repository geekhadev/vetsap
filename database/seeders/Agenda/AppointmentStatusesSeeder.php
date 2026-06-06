<?php

namespace Database\Seeders\Agenda;

use App\Enums\Agenda\AppointmentStatusColor;
use App\Models\Agenda\AppointmentStatus;
use Illuminate\Database\Seeder;

class AppointmentStatusesSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'name' => 'Atendido',
                'color' => AppointmentStatusColor::Green,
                'blocks_schedule' => false,
                'is_terminal' => true,
            ],
            [
                'name' => 'Cancelado',
                'color' => AppointmentStatusColor::Red,
                'blocks_schedule' => false,
                'is_terminal' => true,
            ],
            [
                'name' => 'Confirmado',
                'color' => AppointmentStatusColor::Blue,
                'blocks_schedule' => true,
                'is_terminal' => false,
            ],
            [
                'name' => 'En consulta',
                'color' => AppointmentStatusColor::Purple,
                'blocks_schedule' => true,
                'is_terminal' => false,
            ],
            [
                'name' => 'En sala de espera',
                'color' => AppointmentStatusColor::Amber,
                'blocks_schedule' => true,
                'is_terminal' => false,
            ],
            [
                'name' => 'Pendiente',
                'color' => AppointmentStatusColor::Slate,
                'blocks_schedule' => true,
                'is_terminal' => false,
            ],
        ];

        foreach ($defaults as $row) {
            AppointmentStatus::query()->firstOrCreate(
                [
                    'company_id' => null,
                    'name' => $row['name'],
                ],
                [
                    'color' => $row['color'],
                    'is_active' => true,
                    'is_global' => true,
                    'blocks_schedule' => $row['blocks_schedule'],
                    'is_terminal' => $row['is_terminal'],
                ],
            );
        }
    }
}
