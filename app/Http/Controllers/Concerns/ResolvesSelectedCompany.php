<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Company;
use Illuminate\Http\Request;

trait ResolvesSelectedCompany
{
    protected function resolveCompany(Request $request): ?Company
    {
        $id = data_get($request->session()->get('company_selected'), 'id');

        if (! is_string($id) || $id === '') {
            return null;
        }

        return Company::query()->find($id);
    }
}
