<?php

namespace App\Console\Commands;

use App\Actions\Demo\SeedCompanySalesDemoAction;
use App\Models\Company;
use App\Models\User;
use Illuminate\Console\Command;
use RuntimeException;
use Throwable;

class SeedCompanySalesDemoCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'vetsap:seed-company-sales-demo
                            {company : Nombre de la empresa}
                            {--user= : UUID del usuario que registra la entrada (por defecto el Owner)}';

    /**
     * @var string
     */
    protected $description = 'Inserta data de ejemplo (servicios, ficha, doctor, productos y stock) para presentaciones de venta';

    public function handle(SeedCompanySalesDemoAction $action): int
    {
        $companyName = (string) $this->argument('company');

        $companies = Company::query()
            ->where('name', $companyName)
            ->get();

        if ($companies->isEmpty()) {
            $this->error("No se encontró la empresa con nombre «{$companyName}».");

            return self::FAILURE;
        }

        if ($companies->count() > 1) {
            $this->error("Hay {$companies->count()} empresas con el nombre «{$companyName}». Usa un nombre único.");

            foreach ($companies as $match) {
                $this->line("  - {$match->id}");
            }

            return self::FAILURE;
        }

        /** @var Company $company */
        $company = $companies->first();

        $user = null;
        $userId = $this->option('user');

        if (is_string($userId) && $userId !== '') {
            $user = User::query()->find($userId);

            if (! $user instanceof User) {
                $this->error("No se encontró el usuario con id «{$userId}».");

                return self::FAILURE;
            }
        }

        try {
            $result = $action->execute($company, $user);
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } catch (Throwable $exception) {
            $this->error('No se pudo insertar la data de demo: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Data de demo insertada para «{$result['company']}».");
        $this->line("  Servicios: {$result['services']}");
        $this->line("  Ficha médica: {$result['clinical_template']}");
        $this->line("  Doctor: {$result['doctor']}");
        $this->line("  Categorías de productos: {$result['product_categories']}");
        $this->line("  Productos: {$result['products']}");
        $this->line('  Entrada de inventario: '.($result['inventory_entry'] ? 'creada (100 u.)' : 'omitida (stock ya existente)'));

        return self::SUCCESS;
    }
}
