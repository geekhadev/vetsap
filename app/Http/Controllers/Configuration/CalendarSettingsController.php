<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\CalendarSettings\BuildCalendarSettingsPageDataAction;
use App\Actions\Configuration\CalendarSettings\SyncCalendarSettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\UpdateCalendarSettingsRequest;
use App\Models\Company;
use App\Support\SelectedCompanySession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarSettingsController extends Controller
{
    public function index(
        Request $request,
        BuildCalendarSettingsPageDataAction $buildPageData,
    ): Response {
        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/calendar-settings/index', [
                'companyMissing' => true,
                'settings' => null,
                'services' => [],
            ]);
        }

        $pageData = $buildPageData->execute($company);

        return Inertia::render('configuration/calendar-settings/index', [
            'companyMissing' => false,
            'settings' => $pageData['settings'],
            'services' => $pageData['services'],
        ]);
    }

    public function update(
        UpdateCalendarSettingsRequest $request,
        SyncCalendarSettingsAction $action,
    ): RedirectResponse {
        $company = $request->selectedCompany();

        if (! $company instanceof Company) {
            return back()->withErrors([
                'starts_at' => 'Debes seleccionar una empresa para guardar la configuración.',
            ]);
        }

        $action->execute($company, $request->calendarSettingsPayload());

        return to_route('configuration.calendar-settings.index');
    }
}
