<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_clinical_template_fields', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('template_id')
                ->constrained('medic_clinical_templates')
                ->cascadeOnDelete();
            $table->string('field_key', 64);
            $table->string('label');
            $table->unsignedSmallInteger('field_order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();

            $table->unique(
                ['template_id', 'field_key'],
                'medic_clinical_template_fields_template_key_unique'
            );
            $table->index('template_id', 'medic_clinical_template_fields_template_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_template_fields');
    }
};
