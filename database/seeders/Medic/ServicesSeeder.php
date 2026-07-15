<?php

namespace Database\Seeders\Medic;

use App\Models\Company;
use App\Models\Medic\Service;
use App\Models\Medic\Specialty;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'Medicina General' => [
                ['name' => 'Consulta general', 'duration_minutes' => 30, 'price' => '15000'],
                ['name' => 'Control de vacunas', 'duration_minutes' => 20, 'price' => '12000'],
                ['name' => 'Desparasitación', 'duration_minutes' => 15, 'price' => '8000'],
            ],
            'Cirugía' => [
                ['name' => 'Esterilización hembra', 'duration_minutes' => null, 'price' => null],
                ['name' => 'Esterilización macho', 'duration_minutes' => null, 'price' => null],
            ],
            'Odontología' => [
                ['name' => 'Limpieza dental', 'duration_minutes' => 45, 'price' => '35000'],
            ],
            'Exámenes' => [
                ['name' => 'Hemograma completo', 'duration_minutes' => 15, 'price' => '18000'],
                ['name' => 'Perfil bioquímico', 'duration_minutes' => 15, 'price' => '22000'],
                ['name' => 'Radiografía simple', 'duration_minutes' => 20, 'price' => '25000'],
                ['name' => 'Ecografía abdominal', 'duration_minutes' => 30, 'price' => '35000'],
            ],
        ];

        Company::query()->each(function (Company $company) use ($catalog): void {
            foreach ($catalog as $specialtyName => $services) {
                $specialty = Specialty::query()
                    ->where('company_id', $company->id)
                    ->where('name', $specialtyName)
                    ->first();

                if (! $specialty instanceof Specialty) {
                    continue;
                }

                foreach ($services as $row) {
                    Service::query()->firstOrCreate(
                        [
                            'company_id' => $company->id,
                            'name' => $row['name'],
                        ],
                        [
                            'specialty_id' => $specialty->id,
                            'description' => null,
                            'price' => $row['price'],
                            'duration_minutes' => $row['duration_minutes'],
                            'is_active' => true,
                            'use_web' => false,
                        ],
                    );
                }
            }
        });
    }
}
