<?php

namespace App\Actions\Web\Clinic;

use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use App\Support\Phone\ChilePhone;
use Illuminate\Support\Collection;

final class LookupCustomerByPhoneForWebBookingAction
{
    /**
     * @return array{
     *     id: string,
     *     name: string,
     *     email: string|null,
     *     phone: string|null,
     *     pets: list<array{
     *         id: string,
     *         customer_id: string,
     *         name: string,
     *         species: string,
     *         breed: string|null,
     *     }>,
     * }|null
     */
    public function execute(string $companyId, string $phone): ?array
    {
        $normalizedPhone = ChilePhone::normalize($phone);

        if (! ChilePhone::isValid($phone)) {
            return null;
        }

        /** @var Collection<int, Customer> $customers */
        $customers = Customer::query()
            ->forCompany($companyId)
            ->whereNotNull('phone')
            ->with([
                'patients' => fn ($query) => $query
                    ->where('is_active', true)
                    ->with('species:id,name')
                    ->orderBy('name'),
            ])
            ->get(['id', 'name', 'email', 'phone'])
            ->filter(
                static fn (Customer $row): bool => ChilePhone::normalize($row->phone) === $normalizedPhone,
            )
            ->values();

        if ($customers->isEmpty()) {
            return null;
        }

        $primaryCustomer = $customers
            ->sortByDesc(static fn (Customer $customer): int => $customer->patients->count())
            ->first();

        if (! $primaryCustomer instanceof Customer) {
            return null;
        }

        $pets = $customers
            ->flatMap(
                static fn (Customer $customer): Collection => $customer->patients->map(
                    static fn (Patient $patient): array => [
                        'id' => $patient->id,
                        'customer_id' => $customer->id,
                        'name' => $patient->name,
                        'species' => $patient->species?->name ?? 'Sin especie',
                        'breed' => $patient->breed,
                    ],
                ),
            )
            ->unique('id')
            ->sortBy('name')
            ->values()
            ->all();

        return [
            'id' => $primaryCustomer->id,
            'name' => $primaryCustomer->name,
            'email' => $primaryCustomer->email,
            'phone' => $primaryCustomer->phone,
            'pets' => $pets,
        ];
    }
}
