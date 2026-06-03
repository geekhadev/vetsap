<?php

namespace App\Models\Web;

use App\Models\Company;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'company_id',
    'key',
    'type',
    'value',
])]
class ClinicWebSetting extends Model
{
    use HasUuids;

    protected $table = 'clinic_web_settings';

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
            'type' => \App\Enums\ClinicWebSettingType::class,
        ];
    }
}
