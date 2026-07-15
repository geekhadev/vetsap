<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_clinical_template_species', function (Blueprint $table) {
            $table->foreignUuid('clinical_template_id')
                ->constrained('medic_clinical_templates')
                ->cascadeOnDelete();
            $table->foreignUuid('species_id')
                ->constrained('medic_species')
                ->cascadeOnDelete();

            $table->primary(['clinical_template_id', 'species_id']);
            $table->index('species_id', 'medic_clinical_template_species_species_idx');
        });

        if (Schema::hasColumn('medic_clinical_templates', 'species_id')) {
            $rows = DB::table('medic_clinical_templates')
                ->whereNotNull('species_id')
                ->get(['id', 'species_id']);

            foreach ($rows as $row) {
                DB::table('medic_clinical_template_species')->insert([
                    'clinical_template_id' => $row->id,
                    'species_id' => $row->species_id,
                ]);
            }

            Schema::table('medic_clinical_templates', function (Blueprint $table) {
                $table->dropConstrainedForeignId('species_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('medic_clinical_templates', function (Blueprint $table) {
            $table->foreignUuid('species_id')
                ->nullable()
                ->after('company_id')
                ->constrained('medic_species')
                ->nullOnDelete();
            $table->index('species_id', 'medic_clinical_templates_species_id_idx');
        });

        $rows = DB::table('medic_clinical_template_species')
            ->orderBy('clinical_template_id')
            ->get(['clinical_template_id', 'species_id']);

        $seen = [];

        foreach ($rows as $row) {
            if (isset($seen[$row->clinical_template_id])) {
                continue;
            }

            $seen[$row->clinical_template_id] = true;

            DB::table('medic_clinical_templates')
                ->where('id', $row->clinical_template_id)
                ->update(['species_id' => $row->species_id]);
        }

        Schema::dropIfExists('medic_clinical_template_species');
    }
};
