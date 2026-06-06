<?php

namespace Database\Seeders\Store;

use App\Models\Company;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use App\Models\Store\ProductType;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $general = ProductCategory::query()->whereNull('company_id')->where('name', 'General')->first();
        $medicamentos = ProductType::query()->whereNull('company_id')->where('name', 'Medicamentos')->first();
        $servicios = ProductType::query()->whereNull('company_id')->where('name', 'Servicios')->first();

        if ($general === null || $medicamentos === null || $servicios === null) {
            return;
        }

        Company::query()->each(function (Company $company) use ($general, $medicamentos, $servicios): void {
            $alimentos = ProductCategory::query()
                ->where('company_id', $company->id)
                ->where('name', 'Alimentos')
                ->first();

            $samples = [
                [
                    'name' => 'Antiparasitario oral 10 kg',
                    'product_category_id' => $general->id,
                    'product_type_id' => $medicamentos->id,
                    'price' => 15990,
                    'barcode' => '77001001001',
                ],
                [
                    'name' => 'Consulta nutricional',
                    'product_category_id' => $general->id,
                    'product_type_id' => $servicios->id,
                    'price' => 25000,
                    'barcode' => null,
                ],
            ];

            if ($alimentos !== null) {
                $samples[] = [
                    'name' => 'Alimento premium perro 15 kg',
                    'product_category_id' => $alimentos->id,
                    'product_type_id' => $medicamentos->id,
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
                        'product_type_id' => $sample['product_type_id'],
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
