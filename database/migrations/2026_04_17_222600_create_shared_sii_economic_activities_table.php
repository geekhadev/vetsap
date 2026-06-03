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
        Schema::create('shared_sii_economic_activities', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6);
            $table->text('description');
            $table->boolean('use_iva');
            $table->string('tax_category', 32);
            $table->boolean('use_internet');
            $table->timestamps();

            $table->unique('code');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_sii_economic_activities');
    }
};
