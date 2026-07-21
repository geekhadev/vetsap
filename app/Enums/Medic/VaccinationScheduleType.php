<?php

namespace App\Enums\Medic;

enum VaccinationScheduleType: string
{
    case FromBirthWeeks = 'from_birth_weeks';
    case Unique = 'unique';
    case Periodic = 'periodic';
}
