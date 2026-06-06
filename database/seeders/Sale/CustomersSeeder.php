<?php

namespace Database\Seeders\Sale;

use App\Enums\Sale\CustomerDocumentType;
use App\Models\Company;
use App\Models\Sale\Customer;
use Illuminate\Database\Seeder;

class CustomersSeeder extends Seeder
{
    public function run(): void
    {
        $rutCustomers = [
            ['name' => 'Juan Marcano Pinto', 'document_number' => '76123456-7', 'email' => 'juan.marcano@gmail.com'],
            ['name' => 'María Pinto Marcano', 'document_number' => '76123451-7', 'email' => 'maria.pinto@gmail.com'],
            ['name' => 'Pedro José Luna Pinto', 'document_number' => '76123426-7', 'email' => 'pedro.luna@gmail.com'],
            ['name' => 'Ana María González Pinto', 'document_number' => '76133456-7', 'email' => 'ana.gonzalez@gmail.com'],
        ];

        Company::query()->each(function (Company $company) use ($rutCustomers): void {
            foreach ($rutCustomers as $row) {
                Customer::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'document_type' => CustomerDocumentType::Rut,
                        'document_number' => $row['document_number'],
                    ],
                    [
                        'name' => $row['name'],
                        'email' => $row['email'],
                        'phone' => '+56912345678',
                        'address' => 'Av. Principal 100, Santiago',
                    ],
                );
            }
        });
    }
}
