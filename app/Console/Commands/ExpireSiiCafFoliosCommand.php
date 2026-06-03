<?php

namespace App\Console\Commands;

use App\Enums\Sale\SiiCafFolioStatus;
use App\Enums\Sale\SiiCafStatus;
use App\Models\Sale\SiiCaf;
use App\Models\Sale\SiiCafFolio;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireSiiCafFoliosCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'vetsap:sii_expirar-folios';

    /**
     * @var string
     */
    protected $description = 'Marca como vencidos los SII CAFs y sus folios disponibles o en borrador';

    public function handle(): int
    {
        $today = CarbonImmutable::now('America/Santiago')->toDateString();

        $cafIds = SiiCaf::query()
            ->where('status', SiiCafStatus::Active)
            ->whereDate('expires_at', '<', $today)
            ->pluck('id');

        if ($cafIds->isEmpty()) {
            return self::SUCCESS;
        }

        DB::transaction(function () use ($cafIds): void {
            SiiCaf::query()
                ->whereIn('id', $cafIds)
                ->update(['status' => SiiCafStatus::Expired]);

            SiiCafFolio::query()
                ->whereIn('sale_sii_caf_id', $cafIds)
                ->whereIn('status', [SiiCafFolioStatus::Available, SiiCafFolioStatus::Draft])
                ->update(['status' => SiiCafFolioStatus::Expired]);
        });

        return self::SUCCESS;
    }
}
