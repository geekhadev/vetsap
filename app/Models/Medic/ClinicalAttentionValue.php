<?php

namespace App\Models\Medic;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'attention_id',
    'field_key',
    'value',
])]
class ClinicalAttentionValue extends Model
{
    use HasUuids;

    protected $table = 'medic_clinical_attention_values';

    /**
     * @return BelongsTo<ClinicalAttention, $this>
     */
    public function attention(): BelongsTo
    {
        return $this->belongsTo(ClinicalAttention::class, 'attention_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }
}
