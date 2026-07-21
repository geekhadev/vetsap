<?php

namespace App\Enums\Sale;

enum CashRegisterStatus: string
{
    case Open = 'open';
    case Closed = 'closed';
}
