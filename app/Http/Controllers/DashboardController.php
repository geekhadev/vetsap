<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\BuildAttentionsGrowthChartAction;
use App\Actions\Dashboard\BuildCustomersPatientsGrowthChartAction;
use App\Actions\Dashboard\BuildDailyAppointmentsChartAction;
use App\Actions\Dashboard\BuildServicesGrowthChartAction;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request,
        BuildDailyAppointmentsChartAction $buildDailyAppointmentsChart,
        BuildCustomersPatientsGrowthChartAction $buildCustomersPatientsGrowthChart,
        BuildAttentionsGrowthChartAction $buildAttentionsGrowthChart,
        BuildServicesGrowthChartAction $buildServicesGrowthChart,
    ): Response {
        $company = $this->resolveCompany($request);

        if (! $company instanceof Company) {
            return Inertia::render('dashboard', [
                'appointmentsDailyChart' => [
                    'by_status' => ['series' => [], 'data' => []],
                    'by_source' => ['series' => [], 'data' => []],
                ],
                'customersPatientsGrowthChart' => ['data' => []],
                'attentionsGrowthChart' => ['data' => []],
                'servicesGrowthChart' => ['series' => [], 'data' => []],
            ]);
        }

        return Inertia::render('dashboard', [
            'appointmentsDailyChart' => $buildDailyAppointmentsChart->execute($company->id),
            'customersPatientsGrowthChart' => $buildCustomersPatientsGrowthChart->execute($company->id),
            'attentionsGrowthChart' => $buildAttentionsGrowthChart->execute($company->id),
            'servicesGrowthChart' => $buildServicesGrowthChart->execute($company->id),
        ]);
    }
}
