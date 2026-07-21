<?php

namespace App\Enums\Medic;

enum VaccinationAdministeredOrigin: string
{
    case Clinic = 'clinic';
    case External = 'external';
}
