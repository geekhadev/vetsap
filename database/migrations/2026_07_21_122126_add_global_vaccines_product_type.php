<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('store_product_categories')
            ->whereNull('company_id')
            ->where('name', 'Vacunas')
            ->exists();

        if ($exists) {
            return;
        }

        DB::table('store_product_categories')->insert([
            'id' => (string) Str::uuid(),
            'company_id' => null,
            'name' => 'Vacunas',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('store_product_categories')
            ->whereNull('company_id')
            ->where('name', 'Vacunas')
            ->delete();
    }
};
