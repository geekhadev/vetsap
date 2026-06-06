<?php

namespace App\Models\Agenda;

use App\Models\Agenda\Concerns\InteractsWithCompanyMasterRecord;
use App\Models\Company;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'name',
    'date',
    'is_active',
])]
class Holiday extends Model
{
    use HasUuids;
    use InteractsWithCompanyMasterRecord;

    protected $table = 'agenda_holidays';

    public const SORTABLE_COLUMNS = [
        'name',
        'date',
        'is_active',
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
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'is_active' => 'boolean',
        ];
    }
}
