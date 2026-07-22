<?php

namespace App\Actions\Customer\Pets;

use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Support\Collection;

final class ListPetsForCustomerUserAction
{
    /**
     * Pacientes vinculados al usuario cliente vía `sale_customers.user_id`.
     *
     * @return Collection<int, array{
     *     id: string,
     *     name: string,
     *     record_number: string,
     *     breed: string|null,
     *     sex: string,
     *     birth_date: string|null,
     *     weight_kg: string|null,
     *     colors: string|null,
     *     blood_type: string|null,
     *     microchip_number: string|null,
     *     is_sterilized: bool,
     *     photo_url: string|null,
     *     is_active: bool,
     *     species: array{id: string, name: string}|null
     * }>
     */
    public function execute(User $user, ?string $companyId = null): Collection
    {
        $customerIds = Customer::query()
            ->where('user_id', $user->id)
            ->when(
                is_string($companyId) && $companyId !== '',
                fn ($query) => $query->where('company_id', $companyId),
            )
            ->pluck('id');

        if ($customerIds->isEmpty()) {
            return collect();
        }

        return Patient::query()
            ->whereIn('customer_id', $customerIds)
            ->with(['species:id,name'])
            ->orderBy('name')
            ->get()
            ->map(static fn (Patient $patient): array => [
                'id' => $patient->id,
                'name' => $patient->name,
                'record_number' => $patient->record_number,
                'breed' => $patient->breed,
                'sex' => $patient->sex->value,
                'birth_date' => $patient->birth_date?->toDateString(),
                'weight_kg' => $patient->weight_kg,
                'colors' => $patient->colors,
                'blood_type' => $patient->blood_type,
                'microchip_number' => $patient->microchip_number,
                'is_sterilized' => $patient->is_sterilized,
                'photo_url' => $patient->photo_url,
                'is_active' => $patient->is_active,
                'species' => $patient->species === null
                    ? null
                    : [
                        'id' => $patient->species->id,
                        'name' => $patient->species->name,
                    ],
            ])
            ->values();
    }
}
