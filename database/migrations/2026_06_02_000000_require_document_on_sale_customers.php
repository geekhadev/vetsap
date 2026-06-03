<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('sale_customers')
            ->whereNull('document_type')
            ->orWhereNull('document_number')
            ->delete();

        DB::statement('ALTER TABLE sale_customers ALTER COLUMN document_type SET NOT NULL');
        DB::statement('ALTER TABLE sale_customers ALTER COLUMN document_number SET NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE sale_customers ALTER COLUMN document_type DROP NOT NULL');
        DB::statement('ALTER TABLE sale_customers ALTER COLUMN document_number DROP NOT NULL');
    }
};
