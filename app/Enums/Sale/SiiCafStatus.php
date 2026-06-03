<?php

namespace App\Enums\Sale;

enum SiiCafStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Cancelled = 'cancelled';
}
