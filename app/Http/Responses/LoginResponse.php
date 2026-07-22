<?php

namespace App\Http\Responses;

use App\Actions\Configuration\Companies\ListSelectableCompaniesForUserAction;
use App\Actions\Configuration\Companies\SetSelectedCompanyAction;
use App\Enums\UserType;
use App\Models\Company;
use App\Models\User;
use App\Support\AuthenticatedHome;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function __construct(
        private ListSelectableCompaniesForUserAction $listSelectable,
        private SetSelectedCompanyAction $setSelected,
    ) {}

    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();

        if (! $user instanceof User) {
            return redirect()->intended(Fortify::redirects('login'));
        }

        $home = route(AuthenticatedHome::routeName($user));

        if ($user->type === UserType::Customer) {
            $companies = $this->listSelectable->execute($user);

            if ($companies->count() === 1) {
                $company = $companies->first();
                if ($company instanceof Company) {
                    $this->setSelected->execute($request, $user, $company);
                }

                return redirect()->intended($home);
            }

            if ($companies->count() > 1) {
                return redirect()->intended(route('company-selection.index'));
            }

            return redirect()->intended($home);
        }

        $companies = $this->listSelectable->execute($user);

        if ($companies->isEmpty()) {
            return redirect()->intended(Fortify::redirects('login'));
        }

        if ($companies->count() === 1) {
            $company = $companies->first();
            if (! $company instanceof Company) {
                return redirect()->intended(Fortify::redirects('login'));
            }
            $this->setSelected->execute($request, $user, $company);

            return redirect()->intended($home);
        }

        return redirect()->intended(route('company-selection.index'));
    }
}
