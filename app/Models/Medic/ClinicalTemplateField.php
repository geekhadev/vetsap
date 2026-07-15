<?php

namespace App\Models\Medic;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'template_id',
    'field_key',
    'label',
    'field_order',
    'is_required',
])]
class ClinicalTemplateField extends Model
{
    use HasUuids;

    protected $table = 'medic_clinical_template_fields';

    /**
     * @return BelongsTo<ClinicalTemplate, $this>
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ClinicalTemplate::class, 'template_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'field_order' => 'integer',
            'is_required' => 'boolean',
        ];
    }
}
