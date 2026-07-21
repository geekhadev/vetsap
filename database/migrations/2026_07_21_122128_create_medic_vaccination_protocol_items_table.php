<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medic_vaccination_protocol_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('protocol_id')
                ->constrained('medic_vaccination_protocols')
                ->cascadeOnDelete();
            $table->foreignUuid('product_id')
                ->constrained('store_products')
                ->restrictOnDelete();
            $table->string('schedule_type', 32);
            $table->unsignedSmallInteger('week_number')->nullable();
            $table->unsignedSmallInteger('min_age_weeks')->nullable();
            $table->unsignedSmallInteger('interval_months')->nullable();
            $table->string('series_key', 64)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('protocol_id', 'medic_vaccination_protocol_items_protocol_id_idx');
            $table->index('product_id', 'medic_vaccination_protocol_items_product_id_idx');
            $table->index(['protocol_id', 'sort_order'], 'medic_vaccination_protocol_items_order_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medic_vaccination_protocol_items');
    }
};
