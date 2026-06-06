<?php

namespace App\Models\Agenda\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

trait InteractsWithAgendaAppointment
{
    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForCompany(Builder $query, string $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeInPeriod(Builder $query, Carbon|string $startsAt, Carbon|string $endsAt): Builder
    {
        return $query
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeBlockingSchedule(Builder $query): Builder
    {
        return $query->whereHas('appointmentStatus', function (Builder $statusQuery): void {
            $statusQuery->where('blocks_schedule', true);
        });
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOverlappingForDoctor(
        Builder $query,
        string $doctorId,
        Carbon|string $startsAt,
        Carbon|string $endsAt,
        ?string $exceptAppointmentId = null,
    ): Builder {
        return $query
            ->where('doctor_id', $doctorId)
            ->blockingSchedule()
            ->inPeriod($startsAt, $endsAt)
            ->when(
                $exceptAppointmentId !== null && $exceptAppointmentId !== '',
                fn (Builder $inner): Builder => $inner->whereKeyNot($exceptAppointmentId),
            );
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOrderByStartsAt(Builder $query, string $direction = 'asc'): Builder
    {
        return $query->orderBy('starts_at', $direction);
    }

    public function resolveRouteBinding($value, $field = null): static
    {
        $field ??= $this->getRouteKeyName();

        $companyId = data_get(request()->session()->get('company_selected'), 'id');
        if (! is_string($companyId) || $companyId === '') {
            abort(404);
        }

        /** @var static */
        return static::query()
            ->where('company_id', $companyId)
            ->where($field, $value)
            ->firstOrFail();
    }
}
