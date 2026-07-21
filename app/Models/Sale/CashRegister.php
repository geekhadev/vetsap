<?php

namespace App\Models\Sale;

use App\Enums\Sale\CashRegisterStatus;
use App\Models\Company;
use App\Models\CompanyOffice;
use App\Models\Medic\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\User;
use Database\Factories\Sale\CashRegisterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable([
    'company_id',
    'office_id',
    'opened_by_user_id',
    'opened_at',
    'opening_amount',
    'status',
    'closed_by_user_id',
    'closed_at',
    'notes',
])]
class CashRegister extends Model
{
    /** @use HasFactory<CashRegisterFactory> */
    use HasFactory;

    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'sale_cash_registers';

    public const SORTABLE_COLUMNS = [
        'opened_at',
        'closed_at',
        'opening_amount',
        'status',
        'created_at',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * @return BelongsTo<CompanyOffice, $this>
     */
    public function office(): BelongsTo
    {
        return $this->belongsTo(CompanyOffice::class, 'office_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function openedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by_user_id');
    }

    /**
     * @return HasMany<CashRegisterLine, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(CashRegisterLine::class, 'cash_register_id');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', CashRegisterStatus::Open);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeForUser(Builder $query, string $userId): Builder
    {
        return $query->where('opened_by_user_id', $userId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if ($search === null || $search === '') {
            return $query;
        }

        $term = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $search).'%';

        return $query->where(function (Builder $inner) use ($term): void {
            $inner->whereHas('office', function (Builder $officeQuery) use ($term): void {
                $officeQuery->where('name', 'like', $term);
            })->orWhereHas('openedBy', function (Builder $userQuery) use ($term): void {
                $userQuery->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        });
    }

    public function isOpen(): bool
    {
        return $this->status === CashRegisterStatus::Open;
    }

    /**
     * Una caja solo puede cubrir un día calendario (timezone de la app).
     * Si quedó abierta y ya cambió el día, debe cerrarse antes de abrir otra.
     */
    public function isFromPreviousDay(?Carbon $at = null): bool
    {
        if ($this->opened_at === null) {
            return false;
        }

        $timezone = (string) config('app.timezone');
        $reference = ($at ?? now())->timezone($timezone);
        $openedDate = $this->opened_at->timezone($timezone)->toDateString();

        return $openedDate < $reference->toDateString();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'opening_amount' => 'integer',
            'status' => CashRegisterStatus::class,
        ];
    }

    protected static function newFactory(): CashRegisterFactory
    {
        return CashRegisterFactory::new();
    }
}
