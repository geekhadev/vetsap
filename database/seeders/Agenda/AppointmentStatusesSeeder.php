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
            ['name' => 'Atendido', 'color' => AppointmentStatusColor::Green],
            ['name' => 'Cancelado', 'color' => AppointmentStatusColor::Red],
            ['name' => 'Confirmado', 'color' => AppointmentStatusColor::Blue],
            ['name' => 'En consulta', 'color' => AppointmentStatusColor::Purple],
            ['name' => 'En sala de espera', 'color' => AppointmentStatusColor::Amber],
            ['name' => 'Pendiente', 'color' => AppointmentStatusColor::Slate],
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
                ],
            );
        }
    }
}
