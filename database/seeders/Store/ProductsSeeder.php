<?php

namespace Database\Seeders\Store;

use App\Models\Company;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $general = ProductCategory::query()->whereNull('company_id')->where('name', 'General')->first();

        if ($general === null) {
            return;
        }

        Company::query()->each(function (Company $company) use ($general): void {
            $alimentos = ProductCategory::query()
                ->where('company_id', $company->id)
                ->where('name', 'Alimentos')
                ->first();

            $samples = [
                [
                    'name' => 'Antiparasitario oral 10 kg',
                    'product_category_id' => $general->id,
                    'price' => 15990,
                    'barcode' => '77001001001',
                ],
                [
                    'name' => 'Consulta nutricional',
                    'product_category_id' => $general->id,
                    'price' => 25000,
                    'barcode' => '2000000000001',
                ],
            ];

            if ($alimentos !== null) {
                $samples[] = [
                    'name' => 'Alimento premium perro 15 kg',
                    'product_category_id' => $alimentos->id,
                    'price' => 45990,
                    'barcode' => '77001002002',
                ];
            }

            foreach ($samples as $sample) {
                Product::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'name' => $sample['name'],
                    ],
                    [
                        'product_category_id' => $sample['product_category_id'],
                        'barcode' => $sample['barcode'],
                        'description' => null,
                        'price' => $sample['price'],
                        'is_active' => true,
                    ],
                );
            }
        });
    }
}
