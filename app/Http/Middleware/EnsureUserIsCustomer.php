<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use App\Models\User;
use App\Support\AuthenticatedHome;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCustomer
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || $user->type !== UserType::Customer) {
            return redirect()->route(
                $user instanceof User ? AuthenticatedHome::routeName($user) : 'dashboard',
            );
        }

        return $next($request);
    }
}
