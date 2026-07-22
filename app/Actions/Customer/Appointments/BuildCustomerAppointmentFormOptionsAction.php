<?php

namespace App\Actions\Customer\Appointments;

use App\Actions\Customer\Pets\ListPetsForCustomerUserAction;
use App\Actions\Web\Clinic\BuildPublicBookingScheduleAction;
use App\Models\User;

final class BuildCustomerAppointmentFormOptionsAction
{
    public function __construct(
        private ListPetsForCustomerUserAction $listPets,
        private BuildPublicBookingScheduleAction $buildPublicBookingSchedule,
    ) {}

    /**
     * @return array{
     *     pets: list<array{
     *         id: string,
     *         name: string,
     *         photo_url: string|null,
     *         species: string|null
     *     }>,
     *     schedule: array<string, mixed>
     * }
     */
    public function execute(User $user, string $companyId): array
    {
        $pets = $this->listPets
            ->execute($user, $companyId)
            ->filter(static fn (array $pet): bool => $pet['is_active'] === true)
            ->map(static fn (array $pet): array => [
                'id' => $pet['id'],
                'name' => $pet['name'],
                'photo_url' => $pet['photo_url'],
                'species' => $pet['species']['name'] ?? null,
            ])
            ->values()
            ->all();

        $schedule = $this->buildPublicBookingSchedule->execute($companyId);
        $schedule['species'] = [];

        return [
            'pets' => $pets,
            'schedule' => $schedule,
        ];
    }
}
