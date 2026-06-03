<?php

use App\Models\Company;
use App\Models\Shared\SiiEconomicActivity;
use App\Models\User;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, string>
 */
function validSiiIntegrationPayload(string $actecoCode): array
{
    return [
        CompanySiiIntegrationSettingKeys::CITY => 'Santiago',
        CompanySiiIntegrationSettingKeys::DIRECTION => 'Av. Test 123',
        CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_RUT => '12345678-9',
        CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_NAME => 'Test User',
        CompanySiiIntegrationSettingKeys::CERTIFICATE_URL => 'https://example.com/cert.pfx',
        CompanySiiIntegrationSettingKeys::CERTIFICATE_PASSWORD => 'secret',
        CompanySiiIntegrationSettingKeys::GIRO => 'Servicios informáticos',
        CompanySiiIntegrationSettingKeys::ACTECO => $actecoCode,
    ];
}

test('company edit exposes sii economic activities for acteco selector', function () {
    $user = User::factory()->root()->create();
    $company = Company::factory()->create();
    $activity = SiiEconomicActivity::factory()->create([
        'code' => '620100',
        'description' => 'Actividades de programación informática',
    ]);

    $this->actingAs($user)
        ->get(route('configuration.companies.edit', $company))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('configuration/companies/form')
            ->has('siiEconomicActivities', 1)
            ->where('siiEconomicActivities.0.id', $activity->id)
            ->where('siiEconomicActivities.0.code', '620100')
            ->where('siiEconomicActivities.0.description', 'Actividades de programación informática'));
});

test('sii integration update rejects acteco codes outside catalog', function () {
    $user = User::factory()->root()->create();
    $company = Company::factory()->create();
    SiiEconomicActivity::factory()->create(['code' => '620100']);

    $this->actingAs($user)
        ->patch(
            route('configuration.companies.integrations.sii.update', $company),
            validSiiIntegrationPayload('999999'),
        )
        ->assertSessionHasErrors(CompanySiiIntegrationSettingKeys::ACTECO);
});

test('sii integration update accepts acteco codes from catalog', function () {
    $user = User::factory()->root()->create();
    $company = Company::factory()->create();
    SiiEconomicActivity::factory()->create(['code' => '620100']);

    $this->actingAs($user)
        ->patch(
            route('configuration.companies.integrations.sii.update', $company),
            validSiiIntegrationPayload('620100'),
        )
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(
        $company->integrationSettings()
            ->where('key', CompanySiiIntegrationSettingKeys::ACTECO)
            ->value('value'),
    )->toBe('620100');
});
