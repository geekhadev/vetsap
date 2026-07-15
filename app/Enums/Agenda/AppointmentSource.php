<?php

namespace App\Enums\Agenda;

enum AppointmentSource: string
{
    case Internal = 'internal';
    case Web = 'web';
    case Phone = 'phone';
    case WalkIn = 'walk_in';
    case System = 'system';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::Internal => 'Interno',
            self::Web => 'Web',
            self::Phone => 'Teléfono',
            self::WalkIn => 'Presencial',
            self::System => 'Sistema',
        };
    }
}
