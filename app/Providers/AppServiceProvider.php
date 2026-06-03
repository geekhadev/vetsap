<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Http\Responses\RegisterResponse;
use App\Models\Administration\Module;
use App\Models\Administration\Permission;
use App\Models\Administration\System;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Configuration\Role;
use App\Models\Sale\CertificationSiiTicket;
use App\Models\Sale\SiiCaf;
use App\Models\Shared\Country;
use App\Models\Shared\State;
use App\Models\Shared\PaymentMethod;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiEconomicActivity;
use App\Models\Shared\SiiTaxDocumentType;
use App\Policies\Administration\ModulesPolicy;
use App\Policies\Administration\PermissionsPolicy;
use App\Policies\Administration\SystemPolicy;
use App\Policies\Configuration\CompaniesPolicy;
use App\Policies\Configuration\CompanyOfficesPolicy;
use App\Policies\Configuration\RolesPolicy;
use App\Policies\Sale\CertificationSiiTicketsPolicy;
use App\Policies\Sale\SiiCafPolicy;
use App\Policies\Shared\CountriesPolicy;
use App\Policies\Shared\PaymentMethodsPolicy;
use App\Policies\Shared\StatesPolicy;
use App\Policies\Shared\PaymentTypesPolicy;
use App\Policies\Shared\SiiEconomicActivitiesPolicy;
use App\Policies\Shared\SiiTaxDocumentTypesPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->singleton(RegisterResponseContract::class, RegisterResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Route::bind('office', function (string $value, \Illuminate\Routing\Route $route): CompanyOffice {
            $routeName = (string) ($route->getName() ?? '');
            if (! str_starts_with($routeName, 'configuration.companies.offices.')) {
                return CompanyOffice::query()->whereKey($value)->firstOrFail();
            }

            $company = $route->parameter('company');
            if (! $company instanceof Company) {
                $company = Company::query()->findOrFail($company);
            }

            return CompanyOffice::query()
                ->where('company_id', $company->getKey())
                ->whereKey($value)
                ->firstOrFail();
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user !== null) {
                request()->session()->forget('company_selected');
            }
        });

        Gate::policy(Company::class, CompaniesPolicy::class);
        Gate::policy(CompanyOffice::class, CompanyOfficesPolicy::class);
        Gate::policy(Module::class, ModulesPolicy::class);
        Gate::policy(Permission::class, PermissionsPolicy::class);
        Gate::policy(Role::class, RolesPolicy::class);
        Gate::policy(System::class, SystemPolicy::class);
        Gate::policy(PaymentType::class, PaymentTypesPolicy::class);
        Gate::policy(CertificationSiiTicket::class, CertificationSiiTicketsPolicy::class);
        Gate::policy(SiiCaf::class, SiiCafPolicy::class);
        Gate::policy(Country::class, CountriesPolicy::class);
        Gate::policy(State::class, StatesPolicy::class);
        Gate::policy(PaymentMethod::class, PaymentMethodsPolicy::class);
        Gate::policy(SiiEconomicActivity::class, SiiEconomicActivitiesPolicy::class);
        Gate::policy(SiiTaxDocumentType::class, SiiTaxDocumentTypesPolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
