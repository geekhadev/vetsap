<?php

namespace App\Models;

use App\Enums\CompanyDocumentType;
use App\Models\Configuration\Role;
use App\Models\Sale\CertificationSiiTicket;
use App\Models\Sale\SiiCaf;
use App\Models\Web\ClinicWebSetting;
use Database\Factories\CompanyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Empresa de configuración. En base de datos, `document_type`, `document_number` y `name` son NOT NULL.
 */
#[Fillable([
    'document_type',
    'document_number',
    'name',
    'alias',
    'email',
    'phone',
    'address',
    'slug',
])]
class Company extends Model
{
    /** @use HasFactory<CompanyFactory> */
    use HasFactory, HasUuids;

    protected $table = 'configuration_companies';

    /**
     * Empresas donde el usuario tiene rol Owner en `user_company_roles`.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        $ownerRoleId = Role::query()->systemOwner()->value('id');

        if ($ownerRoleId === null) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas('userRoles', fn (Builder $roleQuery) => $roleQuery
            ->where('user_id', $user->id)
            ->where('role_id', $ownerRoleId));
    }

    /**
     * @return HasMany<UserCompanyRole, $this>
     */
    public function userRoles(): HasMany
    {
        return $this->hasMany(UserCompanyRole::class, 'company_id');
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_company_roles', 'company_id', 'user_id')
            ->withPivot('role_id')
            ->withTimestamps();
    }

    public static function uniqueSlugFromName(string $name, ?string $exceptCompanyId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (static::query()
            ->when($exceptCompanyId !== null, fn ($query) => $query->where('id', '!=', $exceptCompanyId))
            ->where('slug', $slug)
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    public function owner(): ?User
    {
        $ownerRole = Role::query()->systemOwner()->first();

        if (! $ownerRole) {
            return null;
        }

        $pivot = UserCompanyRole::query()
            ->where('company_id', $this->id)
            ->where('role_id', $ownerRole->id)
            ->first();

        return $pivot?->user;
    }

    /**
     * @return HasMany<Role, $this>
     */
    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    /**
     * @return HasMany<CompanyIntegrationSetting, $this>
     */
    public function integrationSettings(): HasMany
    {
        return $this->hasMany(CompanyIntegrationSetting::class, 'company_id');
    }

    /**
     * @return HasMany<CompanySetting, $this>
     */
    public function settings(): HasMany
    {
        return $this->hasMany(CompanySetting::class, 'company_id');
    }

    /**
     * @return HasMany<CertificationSiiTicket, $this>
     */
    public function certificationSiiTickets(): HasMany
    {
        return $this->hasMany(CertificationSiiTicket::class, 'company_id');
    }

    /**
     * @return HasMany<SiiCaf, $this>
     */
    public function siiCafs(): HasMany
    {
        return $this->hasMany(SiiCaf::class, 'company_id');
    }

    /**
     * @return HasMany<CompanyOffice, $this>
     */
    public function offices(): HasMany
    {
        return $this->hasMany(CompanyOffice::class, 'company_id');
    }

    /**
     * @return HasMany<ClinicWebSetting, $this>
     */
    public function webSettings(): HasMany
    {
        return $this->hasMany(ClinicWebSetting::class, 'company_id');
    }

    protected static function newFactory(): CompanyFactory
    {
        return CompanyFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'document_type' => CompanyDocumentType::class,
        ];
    }
}
