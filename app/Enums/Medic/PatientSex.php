<?php

namespace App\Enums\Medic;

enum PatientSex: string
{
    case Male = 'male';
    case Female = 'female';
    case Unknown = 'unknown';
}
