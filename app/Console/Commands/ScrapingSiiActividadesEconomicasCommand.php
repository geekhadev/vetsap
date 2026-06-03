<?php

namespace App\Console\Commands;

use App\Models\Shared\SiiEconomicActivity;
use App\Support\Sii\SiiEconomicActivitiesHtmlParser;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

#[Signature('vetsap:sii_scraping-actividades-economicas')]
#[Description('Descarga el listado de actividades económicas del SII y los sincroniza en la base de datos')]
class ScrapingSiiActividadesEconomicasCommand extends Command
{
    public const SOURCE_URL = 'https://www.sii.cl/ayudas/ayudas_por_servicios/1956-codigos-1959.html';

    private const HTTP_TIMEOUT_SECONDS = 300;

    private const UPSERT_CHUNK_SIZE = 150;

    public function __construct(
        private readonly SiiEconomicActivitiesHtmlParser $parser,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Descargando actividades económicas desde el SII…');

        $response = Http::timeout(self::HTTP_TIMEOUT_SECONDS)
            ->withHeaders([
                'User-Agent' => sprintf('%s SII-actividades-economicas-scraper/1.0', config('app.name')),
            ])
            ->get(self::SOURCE_URL);

        if (! $response->successful()) {
            $this->error(sprintf('La petición HTTP falló con estado %s.', $response->status()));

            return self::FAILURE;
        }

        $activities = $this->parser->parse($response->body());

        if ($activities === []) {
            $this->error('No se encontraron actividades en el HTML recibido.');

            return self::FAILURE;
        }

        $timestamp = now();

        $rows = array_map(function (array $row) use ($timestamp): array {
            return [
                'code' => $row['code'],
                'description' => $row['description'],
                'use_iva' => $row['use_iva'],
                'tax_category' => $row['tax_category'],
                'use_internet' => $row['use_internet'],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }, $activities);

        DB::transaction(function () use ($rows): void {
            foreach (array_chunk($rows, self::UPSERT_CHUNK_SIZE) as $chunk) {
                SiiEconomicActivity::query()->upsert(
                    $chunk,
                    ['code'],
                    ['description', 'use_iva', 'tax_category', 'use_internet', 'updated_at'],
                );
            }
        });

        $this->info(sprintf('Se sincronizaron %d actividades económicas en la base de datos.', count($activities)));

        return self::SUCCESS;
    }
}
