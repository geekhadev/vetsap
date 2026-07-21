<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shared_sii_tax_document_types', function (Blueprint $table) {
            $table->boolean('is_global')->default(true)->after('use_purchase');
            $table->index('is_global');
        });

        // Tipos del catálogo oficial SII (seed) quedan globales.
        DB::table('shared_sii_tax_document_types')->update(['is_global' => true]);

        $internal = DB::table('shared_sii_tax_document_types')->where('code', '00')->first();

        if ($internal === null) {
            $now = now();
            DB::table('shared_sii_tax_document_types')->insert([
                'id' => (string) Str::uuid(),
                'code' => '00',
                'name' => 'Comprobante de venta',
                'abbreviation' => 'CVE',
                'use_sale' => true,
                'use_purchase' => false,
                'is_global' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            DB::table('shared_sii_tax_document_types')
                ->where('code', '00')
                ->update(['is_global' => false]);
        }
    }

    public function down(): void
    {
        Schema::table('shared_sii_tax_document_types', function (Blueprint $table) {
            $table->dropIndex(['is_global']);
            $table->dropColumn('is_global');
        });
    }
};
