<?php

namespace App\Support\Configuration;

use App\Models\Company;
use Illuminate\Http\RedirectResponse;

final class CompanyEditRedirect
{
    public static function back(Company $company): RedirectResponse
    {
        return redirect()->back(
            fallback: route('configuration.companies.index'),
        );
    }
}
