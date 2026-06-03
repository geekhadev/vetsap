<?php

namespace App\Actions\Configuration\Companies;

use App\Actions\Configuration\CompanyOffices\UpsertCompanyMainOfficeFromCompanyAction;
use App\Models\Company;
use App\Models\Configuration\Role;
use App\Models\User;
use App\Models\UserCompanyRole;

class CreateCompanyAction
{
    public function __construct(
        private UpsertCompanyMainOfficeFromCompanyAction $upsertMainOffice,
    ) {}

    /**
     * @param  array{document_type: string, document_number: string, name: string, alias: string|null, email: string|null, phone: string|null, address: string|null}  $payload
     */
    public function execute(User $actor, array $payload): Company
    {
        $company = Company::query()->create([
            'document_type' => $payload['document_type'],
            'document_number' => $payload['document_number'],
            'name' => $payload['name'],
            'alias' => $payload['alias'],
            'email' => $payload['email'],
            'phone' => $payload['phone'],
            'address' => $payload['address'],
            'slug' => Company::uniqueSlugFromName($payload['name']),
        ]);

        $this->upsertMainOffice->execute($company);

        $ownerRole = Role::query()->systemOwner()->firstOrFail();

        UserCompanyRole::query()->create([
            'user_id' => $actor->id,
            'company_id' => $company->id,
            'role_id' => $ownerRole->id,
        ]);

        return $company->fresh();
    }
}
