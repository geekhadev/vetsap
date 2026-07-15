<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class TeamController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('landing/team', [
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
