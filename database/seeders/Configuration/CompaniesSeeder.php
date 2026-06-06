<?php

namespace Database\Seeders\Configuration;

use App\Actions\Configuration\CompanyOffices\UpsertCompanyMainOfficeFromCompanyAction;
use App\Enums\CompanyDocumentType;
use App\Models\Company;
use App\Models\CompanyIntegrationSetting;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use Illuminate\Database\Seeder;

class CompaniesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $upsertMainOffice = app(UpsertCompanyMainOfficeFromCompanyAction::class);

        $companies = [
            [
                'document_type' => CompanyDocumentType::Rut,
                'document_number' => '98765432-1',
                'name' => 'CATCARE SPA',
                'alias' => 'CATCARE',
                'email' => 'catcare@vetsap.app',
                'phone' => '+56987654321',
                'address' => 'AV. DE LOS CONQUISTADORES 2134',
            ],
            [
                'document_type' => CompanyDocumentType::Rut,
                'document_number' => '12345678-9',
                'name' => 'DOGCARE SPA',
                'alias' => 'DOGCARE',
                'email' => 'dogcare@vetsap.app',
                'phone' => '+56987654321',
                'address' => 'AV. DE LOS CONQUISTADORES 2134',
            ],
        ];

        foreach ($companies as $company) {
            $model = Company::query()->firstOrCreate(
                [
                    'document_type' => $company['document_type'],
                    'document_number' => $company['document_number'],
                ],
                [
                    ...$company,
                    'slug' => Company::uniqueSlugFromName($company['name']),
                ],
            );

            if ($model->slug === null) {
                $model->update([
                    'slug' => Company::uniqueSlugFromName($model->name, $model->id),
                ]);
            }

            // TODO: *** activar esto luego
            if ($model->document_number === '78954213-9' && 1 === 2) {
                $siiSettings = [
                    CompanySiiIntegrationSettingKeys::CITY => 'San Pedro de La Paz',
                    CompanySiiIntegrationSettingKeys::DIRECTION => 'Las Industrias 3755',
                    CompanySiiIntegrationSettingKeys::GIRO => 'Servicios Informaticos',
                    CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_RUT => '27136871-2',
                    CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_NAME => 'Irwing Naranjo',
                    CompanySiiIntegrationSettingKeys::ACTECO => '620100',
                    CompanySiiIntegrationSettingKeys::CERTIFICATE_URL => 'certificates/sii/somos-naranja-cert.pfx',
                    CompanySiiIntegrationSettingKeys::CERTIFICATE_PASSWORD => 'qwerty123',
                    CompanySiiIntegrationSettingKeys::EXCHANGE_EMAIL => 'sii@mail.com',
                    CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS => '0',
                    CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS => '2024-01-15',
                    CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_TICKETS => 'sii@mail.com',
                    CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_INVOICES => '0',
                    CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_INVOICES => '2024-01-15',
                    CompanySiiIntegrationSettingKeys::CERTIFICATION_EMAIL_INVOICES => 'sii@mail.com',
                ];

                foreach ($siiSettings as $key => $value) {
                    CompanyIntegrationSetting::query()->updateOrCreate(
                        [
                            'company_id' => $model->id,
                            'key' => $key,
                        ],
                        [
                            'value' => $value,
                        ],
                    );
                }
            }

            $upsertMainOffice->execute($model);
        }
    }
}
