<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesSelectedCompany;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;
    use ResolvesSelectedCompany;
}
