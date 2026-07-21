<?php

namespace App\Enums\Medic;

enum VaccinationDoseStatus: string
{
    case Scheduled = 'scheduled';
    case Due = 'due';
    case Overdue = 'overdue';
    case Administered = 'administered';
    case Omitted = 'omitted';
}
