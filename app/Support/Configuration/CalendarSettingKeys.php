<?php

namespace App\Support\Configuration;

final class CalendarSettingKeys
{
    public const INIT_TIME = 'calendar_init_time';

    public const END_TIME = 'calendar_end_time';

    public const TIME_BLOCK_MINUTES = 'calendar_time_block_minutes';

    public const DEFAULT_SERVICE_ID = 'calendar_default_service_id';

    public const DOCTOR_NOTIFY_ON_CREATE = 'calendar_doctor_notify_on_create';

    public const DOCTOR_NOTIFY_ON_CONFIRM = 'calendar_doctor_notify_on_confirm';

    public const DOCTOR_NOTIFY_ON_CANCEL = 'calendar_doctor_notify_on_cancel';

    public const DOCTOR_NOTIFY_ON_RESCHEDULE = 'calendar_doctor_notify_on_reschedule';

    public const CLIENT_NOTIFY_ON_CREATE = 'calendar_client_notify_on_create';

    public const CLIENT_NOTIFY_ON_CONFIRM = 'calendar_client_notify_on_confirm';

    public const CLIENT_NOTIFY_ON_CANCEL = 'calendar_client_notify_on_cancel';

    public const CLIENT_NOTIFY_ON_RESCHEDULE = 'calendar_client_notify_on_reschedule';

    public const CLIENT_NOTIFY_ON_PAYMENT_ISSUED = 'calendar_client_notify_on_payment_issued';

    public const CLIENT_NOTIFY_ON_INVOICE_ISSUED = 'calendar_client_notify_on_invoice_issued';

    public const CLIENT_NOTIFY_ON_MEDICAL_RECORD_AFTER_VISIT = 'calendar_client_notify_on_medical_record_after_visit';

    public const CLIENT_NOTIFY_ON_PRESCRIPTION_AFTER_VISIT = 'calendar_client_notify_on_prescription_after_visit';

    /**
     * @return list<int>
     */
    public static function allowedTimeBlockMinutes(): array
    {
        return [15, 30, 45, 60];
    }

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::INIT_TIME,
            self::END_TIME,
            self::TIME_BLOCK_MINUTES,
            self::DEFAULT_SERVICE_ID,
            self::DOCTOR_NOTIFY_ON_CREATE,
            self::DOCTOR_NOTIFY_ON_CONFIRM,
            self::DOCTOR_NOTIFY_ON_CANCEL,
            self::DOCTOR_NOTIFY_ON_RESCHEDULE,
            self::CLIENT_NOTIFY_ON_CREATE,
            self::CLIENT_NOTIFY_ON_CONFIRM,
            self::CLIENT_NOTIFY_ON_CANCEL,
            self::CLIENT_NOTIFY_ON_RESCHEDULE,
            self::CLIENT_NOTIFY_ON_PAYMENT_ISSUED,
            self::CLIENT_NOTIFY_ON_INVOICE_ISSUED,
            self::CLIENT_NOTIFY_ON_MEDICAL_RECORD_AFTER_VISIT,
            self::CLIENT_NOTIFY_ON_PRESCRIPTION_AFTER_VISIT,
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function defaults(): array
    {
        return [
            self::INIT_TIME => '09:00',
            self::END_TIME => '19:00',
            self::TIME_BLOCK_MINUTES => '30',
            self::DEFAULT_SERVICE_ID => '',
            self::DOCTOR_NOTIFY_ON_CREATE => '0',
            self::DOCTOR_NOTIFY_ON_CONFIRM => '0',
            self::DOCTOR_NOTIFY_ON_CANCEL => '1',
            self::DOCTOR_NOTIFY_ON_RESCHEDULE => '1',
            self::CLIENT_NOTIFY_ON_CREATE => '1',
            self::CLIENT_NOTIFY_ON_CONFIRM => '1',
            self::CLIENT_NOTIFY_ON_CANCEL => '1',
            self::CLIENT_NOTIFY_ON_RESCHEDULE => '1',
            self::CLIENT_NOTIFY_ON_PAYMENT_ISSUED => '1',
            self::CLIENT_NOTIFY_ON_INVOICE_ISSUED => '1',
            self::CLIENT_NOTIFY_ON_MEDICAL_RECORD_AFTER_VISIT => '1',
            self::CLIENT_NOTIFY_ON_PRESCRIPTION_AFTER_VISIT => '1',
        ];
    }
}
