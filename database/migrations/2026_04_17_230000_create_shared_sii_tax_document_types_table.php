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
        Schema::create('shared_sii_tax_document_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 16)->unique();
            $table->string('name', 512);
            $table->string('abbreviation', 32);
            $table->boolean('use_sale')->default(false);
            $table->boolean('use_purchase')->default(false);
            $table->timestamps();

            $table->index(['use_sale', 'use_purchase']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_sii_tax_document_types');
    }
};
