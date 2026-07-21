<?php

namespace App\Actions\Configuration\CalendarSettings;

use App\Actions\Configuration\CompanySettings\SyncCompanySettingsAction;
use App\Models\Company;
use App\Models\Medic\Service;
use App\Support\Configuration\CalendarSettingKeys;
use Illuminate\Support\Facades\DB;

final class SyncCalendarSettingsAction
{
    public function __construct(
        private SyncCompanySettingsAction $syncCompanySettings,
    ) {}

    /**
     * @param  array{
     *     starts_at: string,
     *     ends_at: string,
     *     time_block_minutes: string,
     *     default_service_id?: string|null,
     *     doctor_notifications: array{
     *         on_create: bool,
     *         on_confirm: bool,
     *         on_cancel: bool,
     *         on_reschedule: bool,
     *     },
     *     client_notifications: array{
     *         on_create: bool,
     *         on_confirm: bool,
     *         on_cancel: bool,
     *         on_reschedule: bool,
     *         on_payment_issued: bool,
     *         on_invoice_issued: bool,
     *         on_medical_record_after_visit: bool,
     *         on_prescription_after_visit: bool,
     *     },
     * }  $payload
     */
    public function execute(Company $company, array $payload): void
    {
        DB::transaction(function () use ($company, $payload): void {
            $bool = static fn (bool $value): string => $value ? '1' : '0';

            $settings = [
                CalendarSettingKeys::INIT_TIME => $payload['starts_at'],
                CalendarSettingKeys::END_TIME => $payload['ends_at'],
                CalendarSettingKeys::TIME_BLOCK_MINUTES => $payload['time_block_minutes'],
                CalendarSettingKeys::DEFAULT_SERVICE_ID => $payload['default_service_id'] ?? '',
                CalendarSettingKeys::DOCTOR_NOTIFY_ON_CREATE => $bool($payload['doctor_notifications']['on_create']),
                CalendarSettingKeys::DOCTOR_NOTIFY_ON_CONFIRM => $bool($payload['doctor_notifications']['on_confirm']),
                CalendarSettingKeys::DOCTOR_NOTIFY_ON_CANCEL => $bool($payload['doctor_notifications']['on_cancel']),
                CalendarSettingKeys::DOCTOR_NOTIFY_ON_RESCHEDULE => $bool($payload['doctor_notifications']['on_reschedule']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_CREATE => $bool($payload['client_notifications']['on_create']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_CONFIRM => $bool($payload['client_notifications']['on_confirm']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_CANCEL => $bool($payload['client_notifications']['on_cancel']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_RESCHEDULE => $bool($payload['client_notifications']['on_reschedule']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_PAYMENT_ISSUED => $bool($payload['client_notifications']['on_payment_issued']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_INVOICE_ISSUED => $bool($payload['client_notifications']['on_invoice_issued']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_MEDICAL_RECORD_AFTER_VISIT => $bool($payload['client_notifications']['on_medical_record_after_visit']),
                CalendarSettingKeys::CLIENT_NOTIFY_ON_PRESCRIPTION_AFTER_VISIT => $bool($payload['client_notifications']['on_prescription_after_visit']),
            ];

            $this->syncCompanySettings->execute(
                $company,
                $settings,
                CalendarSettingKeys::all(),
            );

            $this->syncDefaultServiceFlag(
                $company,
                $payload['default_service_id'] ?? null,
            );
        });
    }

    private function syncDefaultServiceFlag(Company $company, ?string $defaultServiceId): void
    {
        if ($defaultServiceId === null || $defaultServiceId === '') {
            Service::clearOtherDefaults($company->id);

            return;
        }

        Service::clearOtherDefaults($company->id, $defaultServiceId);

        Service::query()
            ->forCompany($company->id)
            ->whereKey($defaultServiceId)
            ->update(['is_default' => true]);
    }
}
