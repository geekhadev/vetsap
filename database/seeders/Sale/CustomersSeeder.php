<?php

namespace Database\Seeders\Sale;

use App\Enums\Sale\CustomerDocumentType;
use App\Enums\UserType;
use App\Models\Company;
use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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

        $portalUser = User::query()->firstOrCreate(
            ['email' => 'juan.marcano@gmail.com'],
            [
                'name' => 'Juan Marcano Pinto',
                'type' => UserType::Customer,
                'password' => Hash::make('qwerty123'),
                'email_verified_at' => now(),
            ],
        );

        Company::query()->each(function (Company $company) use ($rutCustomers, $portalUser): void {
            foreach ($rutCustomers as $index => $row) {
                Customer::query()->updateOrCreate(
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
                        'user_id' => $index === 0 ? $portalUser->id : null,
                    ],
                );
            }
        });
    }
}
