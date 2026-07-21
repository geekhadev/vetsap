<?php

namespace App\Actions\Configuration\CalendarSettings;

use App\Actions\Configuration\CompanySettings\GetCompanySettingsAction;
use App\Models\Company;
use App\Models\Medic\Service;
use App\Support\Configuration\CalendarSettingKeys;

final class BuildCalendarSettingsPageDataAction
{
    public function __construct(
        private GetCompanySettingsAction $getCompanySettings,
    ) {}

    /**
     * @return array{
     *     settings: array{
     *         starts_at: string,
     *         ends_at: string,
     *         time_block_minutes: string,
     *         default_service_id: string,
     *         doctor_notifications: array{
     *             on_create: bool,
     *             on_confirm: bool,
     *             on_cancel: bool,
     *             on_reschedule: bool,
     *         },
     *         client_notifications: array{
     *             on_create: bool,
     *             on_confirm: bool,
     *             on_cancel: bool,
     *             on_reschedule: bool,
     *             on_payment_issued: bool,
     *             on_invoice_issued: bool,
     *             on_medical_record_after_visit: bool,
     *             on_prescription_after_visit: bool,
     *         },
     *     },
     *     services: list<array{id: string, label: string}>,
     * }
     */
    public function execute(Company $company): array
    {
        $defaults = CalendarSettingKeys::defaults();
        $stored = $this->getCompanySettings->execute($company, CalendarSettingKeys::all());

        $value = static function (string $key) use ($defaults, $stored): string {
            return $stored[$key] ?? $defaults[$key];
        };

        $bool = static function (string $key) use ($value): bool {
            return $value($key) === '1';
        };

        $services = Service::query()
            ->forCompany($company->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'is_default']);

        $defaultServiceId = $services
            ->first(static fn (Service $service): bool => $service->is_default)
            ?->id
            ?? $value(CalendarSettingKeys::DEFAULT_SERVICE_ID);

        $serviceOptions = $services
            ->map(static fn (Service $service): array => [
                'id' => $service->id,
                'label' => $service->name,
            ])
            ->values()
            ->all();

        return [
            'settings' => [
                'starts_at' => $value(CalendarSettingKeys::INIT_TIME),
                'ends_at' => $value(CalendarSettingKeys::END_TIME),
                'time_block_minutes' => $value(CalendarSettingKeys::TIME_BLOCK_MINUTES),
                'default_service_id' => (string) ($defaultServiceId ?? ''),
                'doctor_notifications' => [
                    'on_create' => $bool(CalendarSettingKeys::DOCTOR_NOTIFY_ON_CREATE),
                    'on_confirm' => $bool(CalendarSettingKeys::DOCTOR_NOTIFY_ON_CONFIRM),
                    'on_cancel' => $bool(CalendarSettingKeys::DOCTOR_NOTIFY_ON_CANCEL),
                    'on_reschedule' => $bool(CalendarSettingKeys::DOCTOR_NOTIFY_ON_RESCHEDULE),
                ],
                'client_notifications' => [
                    'on_create' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_CREATE),
                    'on_confirm' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_CONFIRM),
                    'on_cancel' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_CANCEL),
                    'on_reschedule' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_RESCHEDULE),
                    'on_payment_issued' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_PAYMENT_ISSUED),
                    'on_invoice_issued' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_INVOICE_ISSUED),
                    'on_medical_record_after_visit' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_MEDICAL_RECORD_AFTER_VISIT),
                    'on_prescription_after_visit' => $bool(CalendarSettingKeys::CLIENT_NOTIFY_ON_PRESCRIPTION_AFTER_VISIT),
                ],
            ],
            'services' => $serviceOptions,
        ];
    }
}
