<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->dropUnique('configuration_companies_document_unique');
        });

        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->renameColumn('tipo_documento', 'document_type');
            $table->renameColumn('numero_documento', 'document_number');
            $table->renameColumn('telefono', 'phone');
            $table->renameColumn('direccion', 'address');
        });

        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->unique(['document_type', 'document_number'], 'configuration_companies_document_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->dropUnique('configuration_companies_document_unique');
        });

        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->renameColumn('document_type', 'tipo_documento');
            $table->renameColumn('document_number', 'numero_documento');
            $table->renameColumn('phone', 'telefono');
            $table->renameColumn('address', 'direccion');
        });

        Schema::table('configuration_companies', function (Blueprint $table) {
            $table->unique(['tipo_documento', 'numero_documento'], 'configuration_companies_document_unique');
        });
    }
};
