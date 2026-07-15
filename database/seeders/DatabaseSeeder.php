<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Database\Seeders\Administration\PermissionsSeeder;
use Database\Seeders\Agenda\AppointmentStatusesSeeder;
use Database\Seeders\Configuration\CompaniesSeeder;
use Database\Seeders\Configuration\RolesSeeder;
use Database\Seeders\Medic\DoctorsSeeder;
use Database\Seeders\Medic\ServicesSeeder;
use Database\Seeders\Medic\SpecialtiesSeeder;
use Database\Seeders\Medic\SpeciesSeeder;
use Database\Seeders\Sale\CustomersSeeder;
use Database\Seeders\Shared\CountriesSeeder;
use Database\Seeders\Shared\PaymentMethodsSeeder;
use Database\Seeders\Shared\PaymentTypesSeeder;
use Database\Seeders\Shared\SiiTaxDocumentTypesSeeder;
use Database\Seeders\Shared\StatesSeeder;
use Database\Seeders\Store\MovementCategoriesSeeder;
use Database\Seeders\Store\ProductCategoriesSeeder;
use Database\Seeders\Store\ProductsSeeder;
use Database\Seeders\Store\ProductTypesSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Irwing Naranjo',
            'email' => 'khalisser@gmail.com',
            'type' => UserType::Root,
            'password' => Hash::make('qwerty123'),
            'email_verified_at' => now(),
        ]);

        $this->call(PermissionsSeeder::class);
        $this->call(RolesSeeder::class);
        $this->call(AppointmentStatusesSeeder::class);
        $this->call(CompaniesSeeder::class);
        $this->call(CustomersSeeder::class);
        $this->call(SpecialtiesSeeder::class);
        $this->call(ServicesSeeder::class);
        $this->call(SpeciesSeeder::class);
        $this->call(DoctorsSeeder::class);
        $this->call(ProductTypesSeeder::class);
        $this->call(ProductCategoriesSeeder::class);
        $this->call(MovementCategoriesSeeder::class);
        $this->call(ProductsSeeder::class);
        $this->call(CountriesSeeder::class);
        $this->call(StatesSeeder::class);
        $this->call(PaymentTypesSeeder::class);
        $this->call(PaymentMethodsSeeder::class);
        $this->call(SiiTaxDocumentTypesSeeder::class);
    }
}
