<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Canonical global specialty names, keyed by legacy local names to remap.
     *
     * @var array<string, string>
     */
    private const LEGACY_NAME_TO_GLOBAL = [
        'Medicina General' => 'Medicina General',
        'Exámenes' => 'Exámenes',
        'Vacunación' => 'Vacunación',
        'Laboratorio' => 'Laboratorio',
        'Laboratorio Clínico' => 'Laboratorio',
        'Cirugía' => 'Cirugía',
        'Urgencia' => 'Urgencia',
        'Urgencias y Emergencias' => 'Urgencia',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('medic_specialties', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
        });

        Schema::table('medic_specialties', function (Blueprint $table) {
            $table->uuid('company_id')->nullable()->change();
            $table->boolean('is_global')->default(false)->after('description');
            $table->index('is_global', 'medic_specialties_is_global_idx');
        });

        Schema::table('medic_specialties', function (Blueprint $table) {
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
        Schema::table('medic_specialties', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropIndex('medic_specialties_is_global_idx');
            $table->dropColumn('is_global');
        });

        DB::table('medic_specialties')
            ->whereNull('company_id')
            ->delete();

        Schema::table('medic_specialties', function (Blueprint $table) {
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
            $existing = DB::table('medic_specialties')
                ->whereNull('company_id')
                ->where('name', $name)
                ->first();

            if ($existing !== null) {
                DB::table('medic_specialties')
                    ->where('id', $existing->id)
                    ->update(['is_global' => true, 'is_active' => true]);

                $globalIdsByName[$name] = $existing->id;

                continue;
            }

            $id = (string) Str::uuid();
            DB::table('medic_specialties')->insert([
                'id' => $id,
                'company_id' => null,
                'name' => $name,
                'description' => null,
                'is_global' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $globalIdsByName[$name] = $id;
        }

        foreach (self::LEGACY_NAME_TO_GLOBAL as $legacyName => $globalName) {
            $globalId = $globalIdsByName[$globalName];

            $localIds = DB::table('medic_specialties')
                ->whereNotNull('company_id')
                ->where('name', $legacyName)
                ->pluck('id');

            if ($localIds->isEmpty()) {
                continue;
            }

            DB::table('medic_services')
                ->whereIn('specialty_id', $localIds)
                ->update(['specialty_id' => $globalId]);

            DB::table('medic_specialties')
                ->whereIn('id', $localIds)
                ->delete();
        }
    }
};
