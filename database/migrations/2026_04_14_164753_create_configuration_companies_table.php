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
        Schema::create('configuration_companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('tipo_documento');
            $table->string('numero_documento');
            $table->string('name');
            $table->string('alias')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->string('slug')->nullable()->unique();
            $table->timestamps();

            $table->unique(['tipo_documento', 'numero_documento'], 'configuration_companies_document_unique');
            $table->unique(['owner_id', 'name'], 'configuration_companies_owner_name_unique');
            $table->unique(['owner_id', 'alias'], 'configuration_companies_owner_alias_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_companies');
    }
};
