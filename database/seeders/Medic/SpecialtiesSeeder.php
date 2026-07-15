<?php

namespace Database\Seeders\Medic;

use App\Models\Medic\Specialty;
use Illuminate\Database\Seeder;

class SpecialtiesSeeder extends Seeder
{
    public function run(): void
    {
        $globals = [
            'Medicina General',
            'Exámenes',
            'Vacunación',
            'Laboratorio',
            'Cirugía',
            'Urgencia',
        ];

        foreach ($globals as $name) {
            Specialty::query()->firstOrCreate(
                [
                    'company_id' => null,
                    'name' => $name,
                ],
                [
                    'is_global' => true,
                    'is_active' => true,
                ],
            );
        }
    }
}
