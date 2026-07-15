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
        Schema::create('medic_clinical_attention_requested_services', function (Blueprint $table) {
            $table->foreignUuid('attention_id')
                ->constrained('medic_clinical_attentions')
                ->cascadeOnDelete();
            $table->foreignUuid('service_id')
                ->constrained('medic_services')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['attention_id', 'service_id'], 'medic_attention_requested_services_pk');
            $table->index('service_id', 'medic_attention_requested_services_service_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_attention_requested_services');
    }
};
