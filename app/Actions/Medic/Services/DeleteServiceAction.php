<?php

namespace App\Actions\Medic\Services;

use App\Models\Company;
use App\Models\Medic\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DeleteServiceAction
{
    public function __construct(
        private SyncDefaultServiceSettingAction $syncDefaultServiceSetting,
    ) {}

    public function execute(Service $service): void
    {
        if ($service->appointments()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar este servicio porque tiene citas asociadas. Desactívalo en su lugar.',
            ]);
        }

        DB::transaction(function () use ($service): void {
            $companyId = $service->company_id;
            $wasDefault = $service->is_default;

            $service->delete();

            if (! $wasDefault) {
                return;
            }

            $company = Company::query()->find($companyId);
            if ($company instanceof Company) {
                $this->syncDefaultServiceSetting->syncFromServiceFlags($company);
            }
        });
    }
}
