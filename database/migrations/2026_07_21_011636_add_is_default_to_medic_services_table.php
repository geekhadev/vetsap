<?php

use App\Support\Configuration\CalendarSettingKeys;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medic_services', function (Blueprint $table): void {
            $table->boolean('is_default')->default(false)->after('use_web');
            $table->index(['company_id', 'is_default'], 'medic_services_company_default_idx');
        });

        $this->backfillFromCalendarSettings();
    }

    public function down(): void
    {
        Schema::table('medic_services', function (Blueprint $table): void {
            $table->dropIndex('medic_services_company_default_idx');
            $table->dropColumn('is_default');
        });
    }

    private function backfillFromCalendarSettings(): void
    {
        $rows = DB::table('configuration_company_settings')
            ->where('key', CalendarSettingKeys::DEFAULT_SERVICE_ID)
            ->whereNotNull('value')
            ->where('value', '!=', '')
            ->get(['company_id', 'value']);

        foreach ($rows as $row) {
            $updated = DB::table('medic_services')
                ->where('company_id', $row->company_id)
                ->where('id', $row->value)
                ->update(['is_default' => true]);

            if ($updated === 0) {
                continue;
            }

            DB::table('medic_services')
                ->where('company_id', $row->company_id)
                ->where('id', '!=', $row->value)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
    }
};
