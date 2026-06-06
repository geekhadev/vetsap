<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveClinicCompanyFromSlug
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('slug');

        if (! is_string($slug) || $slug === '') {
            abort(404);
        }

        $company = Company::query()->where('slug', $slug)->firstOrFail();

        $request->attributes->set('company_id', $company->id);

        return $next($request);
    }
}
