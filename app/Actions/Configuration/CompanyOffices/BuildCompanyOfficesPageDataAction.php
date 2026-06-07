<?php

namespace App\Actions\Configuration\CompanyOffices;

use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\User;

final class BuildCompanyOfficesPageDataAction
{
    public function __construct(
        private ListCompanyOfficesAction $listOffices,
    ) {}

    /**
     * @return array{
     *     offices: list<array{
     *         id: string,
     *         name: string,
     *         email: string|null,
     *         phone: string|null,
     *         address: string|null,
     *         can: array{update: bool, delete: bool},
     *     }>,
     *     can: array{create: bool},
     * }
     */
    public function execute(Company $company, User $user): array
    {
        $offices = $this->listOffices->execute($company)->map(function (CompanyOffice $office) use ($user): array {
            return [
                'id' => $office->id,
                'name' => $office->name,
                'email' => $office->email,
                'phone' => $office->phone,
                'address' => $office->address,
                'can' => [
                    'update' => $user->can('update', $office),
                    'delete' => $user->can('delete', $office),
                ],
            ];
        })->values()->all();

        return [
            'offices' => $offices,
            'can' => [
                'create' => $user->can('update', $company),
            ],
        ];
    }
}
