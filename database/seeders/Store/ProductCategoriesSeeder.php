<?php

namespace Database\Seeders\Store;

use App\Models\Company;
use App\Models\Store\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        ProductCategory::query()->firstOrCreate(
            [
                'company_id' => null,
                'name' => 'General',
            ],
            [
                'is_active' => true,
            ],
        );

        $companyCategories = ['Alimentos', 'Accesorios', 'Insumos clínicos'];

        Company::query()->each(function (Company $company) use ($companyCategories): void {
            foreach ($companyCategories as $name) {
                ProductCategory::query()->firstOrCreate(
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
