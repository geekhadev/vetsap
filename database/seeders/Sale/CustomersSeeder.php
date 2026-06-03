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
            ['name' => 'PETLOVE SPA', 'document_number' => '76123456-7', 'email' => 'contacto@petlove.cl'],
            ['name' => 'VETERINARIA NORTE LTDA', 'document_number' => '77234567-8', 'email' => 'info@veterinarianorte.cl'],
            ['name' => 'ANIMAL CARE SPA', 'document_number' => '78345678-9', 'email' => 'hola@animalcare.cl'],
            ['name' => 'CLINICA PATITAS SPA', 'document_number' => '79456789-0', 'email' => 'admin@patitas.cl'],
            ['name' => 'MASCOTAS FELICES LTDA', 'document_number' => '80567890-1', 'email' => 'ventas@mascotasfelices.cl'],
            ['name' => 'CONSUMIDOR FINAL SPA', 'document_number' => '81678901-2', 'email' => 'consumidor@example.cl'],
        ];

        $pasaporteCustomers = [
            ['name' => 'JOHN SMITH', 'document_number' => 'AB1234567', 'email' => 'john.smith@example.com'],
            ['name' => 'MARIA GARCIA', 'document_number' => 'XY9876543', 'email' => 'maria.garcia@example.com'],
        ];

        Company::query()->each(function (Company $company) use ($rutCustomers, $pasaporteCustomers): void {
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

            foreach ($pasaporteCustomers as $row) {
                Customer::query()->firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'document_type' => CustomerDocumentType::Pasaporte,
                        'document_number' => $row['document_number'],
                    ],
                    [
                        'name' => $row['name'],
                        'email' => $row['email'],
                        'phone' => '+56987654321',
                        'address' => 'Calle Secundaria 200',
                    ],
                );
            }

        });
    }
}
