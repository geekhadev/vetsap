<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\Medic\Doctor;
use App\Models\Medic\Service;

final class ResolveAppointmentServiceTermsAction
{
    /**
     * @return array{duration_minutes: int, price: string|null}
     */
    public function execute(string $doctorId, string $serviceId): array
    {
        /** @var Service|null $service */
        $service = Service::query()->whereKey($serviceId)->first();

        if (! $service instanceof Service) {
            throw new \InvalidArgumentException('Servicio no encontrado.');
        }

        /** @var Doctor|null $doctor */
        $doctor = Doctor::query()
            ->whereKey($doctorId)
            ->with(['services' => fn ($query) => $query->whereKey($serviceId)])
            ->first();

        if (! $doctor instanceof Doctor) {
            throw new \InvalidArgumentException('Doctor no encontrado.');
        }

        $pivot = $doctor->services->first()?->pivot;
        $duration = $pivot?->duration_override_minutes ?? $service->duration_minutes;
        $price = $pivot?->price_override ?? $service->price;

        if ($duration === null || (int) $duration <= 0) {
            throw new \InvalidArgumentException('El servicio no tiene una duración válida configurada.');
        }

        return [
            'duration_minutes' => (int) $duration,
            'price' => $price !== null ? (string) $price : null,
        ];
    }
}
