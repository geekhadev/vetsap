<?php

namespace Database\Factories\Sale;

use App\Models\Company;
use App\Models\Sale\CertificationSiiTicket;
use App\Models\User;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CertificationSiiTicket>
 */
class CertificationSiiTicketFactory extends Factory
{
    /**
     * @var class-string<CertificationSiiTicket>
     */
    protected $model = CertificationSiiTicket::class;

    public function configure(): static
    {
        return $this->afterCreating(function (CertificationSiiTicket $ticket): void {
            $base = CompanyPrivateStorageLayout::siiCertificationTicketDirectory(
                (string) $ticket->company_id,
                (string) $ticket->id,
            );

            $ticket->forceFill([
                'file_caf' => $base.'/caf.xml',
                'file_envio_dte' => $base.'/EnvioDTE.xml',
                'file_consumo_folios' => $base.'/ConsumoFolios.xml',
            ])->saveQuietly();
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'number' => 1,
            'dte_init' => '1',
            'dte_end' => '1',
            'file_caf' => '',
            'file_envio_dte' => '',
            'file_consumo_folios' => '',
        ];
    }
}
