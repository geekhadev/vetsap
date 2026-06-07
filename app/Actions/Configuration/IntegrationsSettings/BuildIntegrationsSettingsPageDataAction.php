<?php

namespace App\Actions\Configuration\IntegrationsSettings;

use App\Actions\Configuration\Companies\ResolveManagedCompanySiiCertificateDiskPathAction;
use App\Models\Company;
use App\Models\Shared\SiiEconomicActivity;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;

final class BuildIntegrationsSettingsPageDataAction
{
    public function __construct(
        private ResolveManagedCompanySiiCertificateDiskPathAction $resolveCertificatePath,
    ) {}

    /**
     * @return array{
     *     companyId: string,
     *     siiIntegration: array<string, string>,
     *     siiEconomicActivities: list<array{id: int, code: string, description: string}>,
     *     siiCertificateDownloadUrl: string|null,
     * }
     */
    public function execute(Company $company): array
    {
        return [
            'companyId' => $company->id,
            'siiIntegration' => $this->siiIntegrationFormProps($company),
            'siiEconomicActivities' => SiiEconomicActivity::query()
                ->orderBy('code')
                ->get(['id', 'code', 'description'])
                ->map(static fn (SiiEconomicActivity $activity): array => [
                    'id' => $activity->id,
                    'code' => $activity->code,
                    'description' => $activity->description,
                ])
                ->values()
                ->all(),
            'siiCertificateDownloadUrl' => $this->siiCertificateDownloadUrl($company),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function siiIntegrationFormProps(Company $company): array
    {
        $keys = CompanySiiIntegrationSettingKeys::all();
        $values = $company->integrationSettings()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $props = [];
        foreach ($keys as $key) {
            $props[$key] = (string) ($values[$key] ?? '');
        }

        return $props;
    }

    private function siiCertificateDownloadUrl(Company $company): ?string
    {
        if ($this->resolveCertificatePath->execute($company) === null) {
            return null;
        }

        return route('configuration.companies.integrations.sii.certificate.download', $company);
    }
}
