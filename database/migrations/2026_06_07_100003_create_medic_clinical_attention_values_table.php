<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_clinical_attention_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attention_id')
                ->constrained('medic_clinical_attentions')
                ->cascadeOnDelete();
            $table->string('field_key', 64);
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(
                ['attention_id', 'field_key'],
                'medic_clinical_attention_values_attention_key_unique'
            );
            $table->index('attention_id', 'medic_clinical_attention_values_attention_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_attention_values');
    }
};
