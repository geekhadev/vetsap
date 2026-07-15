<?php

namespace App\Providers;

use App\Http\Responses\LoginResponse;
use App\Http\Responses\RegisterResponse;
use App\Models\Administration\Module;
use App\Models\Administration\Permission;
use App\Models\Administration\System;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\AppointmentStatus;
use App\Models\Agenda\Calendar;
use App\Models\Agenda\Holiday;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Configuration\Role;
use App\Models\Medic\ClinicalAttention;
use App\Models\Medic\ClinicalTemplate;
use App\Models\Medic\Doctor;
use App\Models\Medic\Patient;
use App\Models\Medic\Service;
use App\Models\Medic\Specialty;
use App\Models\Medic\Species;
use App\Models\Sale\CertificationSiiTicket;
use App\Models\Sale\Customer;
use App\Models\Sale\SiiCaf;
use App\Models\Shared\Country;
use App\Models\Shared\PaymentMethod;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiEconomicActivity;
use App\Models\Shared\SiiTaxDocumentType;
use App\Models\Shared\State;
use App\Models\Store\Product;
use App\Models\Store\ProductCategory;
use App\Models\Store\ProductType;
use App\Policies\Administration\ModulesPolicy;
use App\Policies\Administration\PermissionsPolicy;
use App\Policies\Administration\SystemPolicy;
use App\Policies\Agenda\AppointmentPolicy;
use App\Policies\Agenda\AppointmentStatusPolicy;
use App\Policies\Agenda\CalendarPolicy;
use App\Policies\Agenda\HolidayPolicy;
use App\Policies\Configuration\CompaniesPolicy;
use App\Policies\Configuration\CompanyOfficesPolicy;
use App\Policies\Configuration\RolesPolicy;
use App\Policies\Medic\ClinicalAttentionsPolicy;
use App\Policies\Medic\ClinicalTemplatesPolicy;
use App\Policies\Medic\DoctorsPolicy;
use App\Policies\Medic\PatientsPolicy;
use App\Policies\Medic\ServicesPolicy;
use App\Policies\Medic\SpecialtiesPolicy;
use App\Policies\Medic\SpeciesPolicy;
use App\Policies\Sale\CertificationSiiTicketsPolicy;
use App\Policies\Sale\CustomersPolicy;
use App\Policies\Sale\SiiCafPolicy;
use App\Policies\Shared\CountriesPolicy;
use App\Policies\Shared\PaymentMethodsPolicy;
use App\Policies\Shared\PaymentTypesPolicy;
use App\Policies\Shared\SiiEconomicActivitiesPolicy;
use App\Policies\Shared\SiiTaxDocumentTypesPolicy;
use App\Policies\Shared\StatesPolicy;
use App\Policies\Store\ProductCategoriesPolicy;
use App\Policies\Store\ProductsPolicy;
use App\Policies\Store\ProductTypesPolicy;
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

        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(AppointmentStatus::class, AppointmentStatusPolicy::class);
        Gate::policy(Calendar::class, CalendarPolicy::class);
        Gate::policy(Holiday::class, HolidayPolicy::class);
        Gate::policy(Company::class, CompaniesPolicy::class);
        Gate::policy(CompanyOffice::class, CompanyOfficesPolicy::class);
        Gate::policy(Module::class, ModulesPolicy::class);
        Gate::policy(Permission::class, PermissionsPolicy::class);
        Gate::policy(Role::class, RolesPolicy::class);
        Gate::policy(System::class, SystemPolicy::class);
        Gate::policy(PaymentType::class, PaymentTypesPolicy::class);
        Gate::policy(CertificationSiiTicket::class, CertificationSiiTicketsPolicy::class);
        Gate::policy(SiiCaf::class, SiiCafPolicy::class);
        Gate::policy(Customer::class, CustomersPolicy::class);
        Gate::policy(Specialty::class, SpecialtiesPolicy::class);
        Gate::policy(Service::class, ServicesPolicy::class);
        Gate::policy(Species::class, SpeciesPolicy::class);
        Gate::policy(Patient::class, PatientsPolicy::class);
        Gate::policy(Doctor::class, DoctorsPolicy::class);
        Gate::policy(ClinicalTemplate::class, ClinicalTemplatesPolicy::class);
        Gate::policy(ClinicalAttention::class, ClinicalAttentionsPolicy::class);
        Gate::policy(ProductType::class, ProductTypesPolicy::class);
        Gate::policy(ProductCategory::class, ProductCategoriesPolicy::class);
        Gate::policy(Product::class, ProductsPolicy::class);
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
