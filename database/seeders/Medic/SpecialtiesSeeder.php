<?php

namespace Database\Seeders\Medic;

use App\Models\Company;
use App\Models\Medic\Specialty;
use Illuminate\Database\Seeder;

class SpecialtiesSeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            'Medicina General',
            'Urgencias y Emergencias',
            'Cirugía',
            'Dermatología',
            'Odontología',
            'Nutrición y Dietética',
            'Radiología',
            'Laboratorio Clínico',
            'Rehabilitación',
        ];

        Company::query()->each(function (Company $company) use ($specialties): void {
            foreach ($specialties as $index => $name) {
                Specialty::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => $name,
                    ],
                    [
                        'is_active' => true,
                        'sort_order' => $index + 1,
                    ],
                );
            }
        });
    }
}
