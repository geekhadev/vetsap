<?php

namespace App\Enums\Sale;

enum SiiCafFolioStatus: string
{
    case Available = 'available';
    case Draft = 'draft';
    case Used = 'used';
    case Expired = 'expired';
}
