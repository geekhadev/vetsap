<?php

namespace App\Enums\Medic;

enum ClinicalAttentionStatus: string
{
    case Draft = 'draft';
    case Closed = 'closed';
}
