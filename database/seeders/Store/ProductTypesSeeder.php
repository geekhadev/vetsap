<?php

namespace Database\Seeders\Store;

use App\Models\Company;
use App\Models\Store\ProductType;
use Illuminate\Database\Seeder;

class ProductTypesSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Medicamentos', 'Servicios', 'Vacunas'] as $name) {
            ProductType::query()->firstOrCreate(
                [
                    'company_id' => null,
                    'name' => $name,
                ],
                [
                    'is_active' => true,
                ],
            );
        }

        $companyTypes = ['Kit', 'Perecedero'];

        Company::query()->each(function (Company $company) use ($companyTypes): void {
            foreach ($companyTypes as $name) {
                ProductType::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => $name,
                    ],
                    [
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}
