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
        Schema::create('medic_clinical_attention_document_templates', function (Blueprint $table) {
            $table->foreignUuid('attention_id')
                ->constrained('medic_clinical_attentions')
                ->cascadeOnDelete();
            $table->foreignUuid('document_template_id')
                ->constrained('medic_document_templates')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->primary(
                ['attention_id', 'document_template_id'],
                'medic_attention_document_templates_pk',
            );
            $table->index(
                'document_template_id',
                'medic_attention_document_templates_template_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medic_clinical_attention_document_templates');
    }
};
