<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SalesOnboardingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('landing/sales-onboarding');
    }
}
