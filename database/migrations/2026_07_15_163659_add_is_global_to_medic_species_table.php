<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Canonical global species names, keyed by legacy local names to remap.
     *
     * @var array<string, string>
     */
    private const LEGACY_NAME_TO_GLOBAL = [
        'Perro' => 'Canino',
        'Canino' => 'Canino',
        'Gato' => 'Felino',
        'Felino' => 'Felino',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('medic_species', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
        });

        Schema::table('medic_species', function (Blueprint $table) {
            $table->uuid('company_id')->nullable()->change();
            $table->boolean('is_global')->default(false)->after('name');
            $table->index('is_global', 'medic_species_is_global_idx');
        });

        Schema::table('medic_species', function (Blueprint $table) {
            $table->foreign('company_id')
                ->references('id')
                ->on('configuration_companies')
                ->cascadeOnDelete();
        });

        $this->seedGlobalsAndRemapCompanyCopies();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medic_species', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropIndex('medic_species_is_global_idx');
            $table->dropColumn('is_global');
        });

        DB::table('medic_species')
            ->whereNull('company_id')
            ->delete();

        Schema::table('medic_species', function (Blueprint $table) {
            $table->uuid('company_id')->nullable(false)->change();
            $table->foreign('company_id')
                ->references('id')
                ->on('configuration_companies')
                ->cascadeOnDelete();
        });
    }

    private function seedGlobalsAndRemapCompanyCopies(): void
    {
        $globalNames = array_values(array_unique(array_values(self::LEGACY_NAME_TO_GLOBAL)));
        $globalIdsByName = [];

        foreach ($globalNames as $name) {
            $existing = DB::table('medic_species')
                ->whereNull('company_id')
                ->where('name', $name)
                ->first();

            if ($existing !== null) {
                DB::table('medic_species')
                    ->where('id', $existing->id)
                    ->update(['is_global' => true, 'is_active' => true]);

                $globalIdsByName[$name] = $existing->id;

                continue;
            }

            $id = (string) Str::uuid();
            DB::table('medic_species')->insert([
                'id' => $id,
                'company_id' => null,
                'name' => $name,
                'is_global' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $globalIdsByName[$name] = $id;
        }

        foreach (self::LEGACY_NAME_TO_GLOBAL as $legacyName => $globalName) {
            $globalId = $globalIdsByName[$globalName];

            $localIds = DB::table('medic_species')
                ->whereNotNull('company_id')
                ->where('name', $legacyName)
                ->pluck('id');

            if ($localIds->isEmpty()) {
                continue;
            }

            DB::table('medic_patients')
                ->whereIn('species_id', $localIds)
                ->update(['species_id' => $globalId]);

            if (Schema::hasTable('medic_clinical_template_species')) {
                $this->remapClinicalTemplateSpecies($localIds->all(), $globalId);
            }

            DB::table('medic_species')
                ->whereIn('id', $localIds)
                ->delete();
        }
    }

    /**
     * @param  list<string>  $localIds
     */
    private function remapClinicalTemplateSpecies(array $localIds, string $globalId): void
    {
        $rows = DB::table('medic_clinical_template_species')
            ->whereIn('species_id', $localIds)
            ->get(['clinical_template_id', 'species_id']);

        foreach ($rows as $row) {
            $alreadyLinked = DB::table('medic_clinical_template_species')
                ->where('clinical_template_id', $row->clinical_template_id)
                ->where('species_id', $globalId)
                ->exists();

            if ($alreadyLinked) {
                DB::table('medic_clinical_template_species')
                    ->where('clinical_template_id', $row->clinical_template_id)
                    ->where('species_id', $row->species_id)
                    ->delete();

                continue;
            }

            DB::table('medic_clinical_template_species')
                ->where('clinical_template_id', $row->clinical_template_id)
                ->where('species_id', $row->species_id)
                ->update(['species_id' => $globalId]);
        }
    }
};
