<?php

namespace Database\Seeders\Medic;

use App\Models\Company;
use App\Models\Medic\Species;
use Illuminate\Database\Seeder;

class SpeciesSeeder extends Seeder
{
    public function run(): void
    {
        $globals = [
            'Canino',
            'Felino',
        ];

        foreach ($globals as $name) {
            Species::query()->firstOrCreate(
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

        $companySpecies = [
            'Ave',
            'Conejo',
            'Hámster',
            'Reptil',
            'Pez',
            'Otro',
        ];

        Company::query()->each(function (Company $company) use ($companySpecies): void {
            foreach ($companySpecies as $name) {
                Species::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => $name,
                    ],
                    [
                        'is_global' => false,
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}
