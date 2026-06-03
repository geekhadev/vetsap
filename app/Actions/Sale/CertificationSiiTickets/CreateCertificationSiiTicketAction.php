<?php

namespace App\Actions\Sale\CertificationSiiTickets;

use App\Models\Company;
use App\Models\Sale\CertificationSiiTicket;
use App\Models\User;
use App\Support\Storage\CompanyPrivateStorageLayout;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

final class CreateCertificationSiiTicketAction
{
    public function __construct(
        private readonly GenerateCertificationSiiBoletaXmlAction $generateXml,
    ) {}

    /**
     * @param  array<string, mixed>  $cafParsed
     */
    public function execute(User $user, Company $company, string $cafXml, array $cafParsed): CertificationSiiTicket
    {
        $xmls = $this->generateXml->execute($company, $cafParsed, $cafXml);

        try {
            return DB::transaction(function () use ($user, $company, $cafXml, $cafParsed, $xmls): CertificationSiiTicket {
                $nextNumber = $this->nextNumberForCompany($company->id);

                $ticket = new CertificationSiiTicket([
                    'company_id' => $company->id,
                    'user_id' => $user->id,
                    'number' => $nextNumber,
                    'dte_init' => $cafParsed['RNG']['D'],
                    'dte_end' => $cafParsed['RNG']['H'],
                    'file_caf' => '',
                    'file_envio_dte' => '',
                    'file_consumo_folios' => '',
                ]);
                $ticket->save();

                $base = CompanyPrivateStorageLayout::siiCertificationTicketDirectory((string) $company->id, (string) $ticket->id);
                Storage::disk('local')->makeDirectory($base);
                Storage::disk('local')->put($base.'/caf.xml', $cafXml);
                Storage::disk('local')->put($base.'/EnvioDTE.xml', $xmls['envio_xml']);
                Storage::disk('local')->put($base.'/ConsumoFolios.xml', $xmls['consumo_xml']);

                $ticket->update([
                    'file_caf' => $base.'/caf.xml',
                    'file_envio_dte' => $base.'/EnvioDTE.xml',
                    'file_consumo_folios' => $base.'/ConsumoFolios.xml',
                ]);

                $ticket->refresh();

                return $ticket;
            });
        } catch (Throwable $e) {
            throw new RuntimeException('No se pudo registrar la certificación: '.$e->getMessage(), 0, $e);
        }
    }

    private function nextNumberForCompany(string $companyId): int
    {
        /** @var CertificationSiiTicket|null $last */
        $last = CertificationSiiTicket::query()
            ->where('company_id', $companyId)
            ->lockForUpdate()
            ->orderByDesc('number')
            ->first();

        return ($last?->number ?? 0) + 1;
    }
}
