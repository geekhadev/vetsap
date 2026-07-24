<?php

namespace App\Http\Controllers\Configuration;

use App\Actions\Configuration\InventorySettings\BuildInventorySettingsPageDataAction;
use App\Actions\Configuration\InventorySettings\SyncInventorySettingsAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\UpdateInventorySettingsRequest;
use App\Models\Company;
use App\Support\SelectedCompanySession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventorySettingsController extends Controller
{
    public function index(
        Request $request,
        BuildInventorySettingsPageDataAction $buildPageData,
    ): Response {
        $companyId = SelectedCompanySession::selectedCompanyId($request);
        $company = $companyId !== null
            ? Company::query()->find($companyId)
            : null;

        if (! $company instanceof Company) {
            return Inertia::render('configuration/inventory-settings/index', [
                'companyMissing' => true,
                'settings' => null,
            ]);
        }

        $pageData = $buildPageData->execute($company);

        return Inertia::render('configuration/inventory-settings/index', [
            'companyMissing' => false,
            'settings' => $pageData['settings'],
        ]);
    }

    public function update(
        UpdateInventorySettingsRequest $request,
        SyncInventorySettingsAction $action,
    ): RedirectResponse {
        $company = $request->selectedCompany();

        if (! $company instanceof Company) {
            return back()->withErrors([
                'validate_stock_on_sales' => 'Debes seleccionar una empresa para guardar la configuración.',
            ]);
        }

        $action->execute($company, $request->inventorySettingsPayload());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Configuración de inventario actualizada.']);

        return to_route('configuration.inventory-settings.index');
    }
}
