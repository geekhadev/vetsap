<?php

namespace App\Actions\Dashboard;

use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use App\Support\Dashboard\DashboardMonthRange;

final class BuildCustomersPatientsGrowthChartAction
{
    /**
     * @return array{
     *     data: list<array{month: string, customers: int, patients: int}>
     * }
     */
    public function execute(string $companyId): array
    {
        [$start, $end] = DashboardMonthRange::currentWindow();
        $months = DashboardMonthRange::monthKeys($start, $end);

        $customersBefore = Customer::query()
            ->forCompany($companyId)
            ->where('created_at', '<', $start)
            ->count();

        $patientsBefore = Patient::query()
            ->forCompany($companyId)
            ->where('created_at', '<', $start)
            ->count();

        $customersByMonth = Customer::query()
            ->forCompany($companyId)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->countBy(static fn (Customer $customer): string => DashboardMonthRange::monthKey($customer->created_at));

        $patientsByMonth = Patient::query()
            ->forCompany($companyId)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->countBy(static fn (Patient $patient): string => DashboardMonthRange::monthKey($patient->created_at));

        $customerTotal = $customersBefore;
        $patientTotal = $patientsBefore;
        $data = [];

        foreach ($months as $month) {
            $customerTotal += (int) ($customersByMonth[$month] ?? 0);
            $patientTotal += (int) ($patientsByMonth[$month] ?? 0);

            $data[] = [
                'month' => $month,
                'customers' => $customerTotal,
                'patients' => $patientTotal,
            ];
        }

        return [
            'data' => $data,
        ];
    }
}
