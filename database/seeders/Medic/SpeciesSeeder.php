<?php

namespace Database\Seeders\Medic;

use App\Models\Company;
use App\Models\Medic\Species;
use Illuminate\Database\Seeder;

class SpeciesSeeder extends Seeder
{
    public function run(): void
    {
        $species = [
            'Perro',
            'Gato',
            'Ave',
            'Conejo',
            'Hámster',
            'Reptil',
            'Pez',
            'Otro',
        ];

        Company::query()->each(function (Company $company) use ($species): void {
            foreach ($species as $index => $name) {
                Species::query()->firstOrCreate(
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
