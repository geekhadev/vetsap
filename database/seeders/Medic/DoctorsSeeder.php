<?php

namespace Database\Seeders\Medic;

use App\Enums\Medic\DoctorDocumentType;
use App\Models\Company;
use App\Models\Medic\Doctor;
use App\Models\Medic\Service;
use Illuminate\Database\Seeder;

class DoctorsSeeder extends Seeder
{
    public function run(): void
    {
        $doctors = [
            ['first_name' => 'Anibal Julian', 'last_name' => 'Martin', 'document_number' => '76123456-7', 'phone' => '+56912345678', 'email' => 'anibal.martin@gmail.com'],
            ['first_name' => 'Ignacia Sanhueza', 'last_name' => 'Martin', 'document_number' => '76123451-7', 'phone' => '+56912345678', 'email' => 'ignacia.sanhueza@gmail.com'],
        ];

        $defaultServiceNames = [
            'Consulta general',
            'Control de vacunas',
            'Desparasitación',
        ];

        Company::query()->each(function (Company $company) use ($doctors, $defaultServiceNames): void {
            $serviceIds = Service::query()
                ->where('company_id', $company->id)
                ->whereIn('name', $defaultServiceNames)
                ->pluck('id')
                ->all();

            foreach ($doctors as $row) {
                $doctor = Doctor::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'document_type' => DoctorDocumentType::Rut,
                        'document_number' => $row['document_number'],
                    ],
                    [
                        'first_name' => $row['first_name'],
                        'last_name' => $row['last_name'],
                        'phone' => $row['phone'],
                        'email' => $row['email'],
                        'is_active' => true,
                        'use_web' => false,
                    ],
                );

                $doctor->services()->sync($serviceIds);

                foreach ([1, 2, 3, 4, 5] as $day) {
                    $doctor->scheduleBlocks()->create([
                        'day_of_week' => $day,
                        'starts_at' => '09:00',
                        'ends_at' => '18:00',
                    ]);
                }
            }
        });
    }
}
