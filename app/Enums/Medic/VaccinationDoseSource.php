<?php

namespace App\Enums\Medic;

enum VaccinationDoseSource: string
{
    case Protocol = 'protocol';
    case Manual = 'manual';
}
