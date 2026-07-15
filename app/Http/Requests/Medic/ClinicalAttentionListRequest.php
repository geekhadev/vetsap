<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithPaginatedListQuery;
use App\Models\Medic\ClinicalAttention;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClinicalAttentionListRequest extends FormRequest
{
    use InteractsWithPaginatedListQuery;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', Rule::in(ClinicalAttention::SORTABLE_COLUMNS)],
            'direction' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', Rule::in([20, 50, 100])],
            'patient_id' => ['nullable', 'uuid'],
            'doctor_id' => ['nullable', 'uuid'],
            'template_id' => ['nullable', 'uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort' => $this->input('sort', 'created_at'),
            'direction' => $this->input('direction', 'desc'),
        ]);

        $this->prepareStandardListQuery();
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForAction(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return [
            ...$this->standardListFiltersForAction($validated),
            'patient_id' => $validated['patient_id'] ?? null,
            'doctor_id' => $validated['doctor_id'] ?? null,
            'template_id' => $validated['template_id'] ?? null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filtersForFrontend(): array
    {
        return [
            ...$this->standardListFiltersForFrontend(),
            'patient_id' => (string) ($this->input('patient_id') ?? ''),
            'doctor_id' => (string) ($this->input('doctor_id') ?? ''),
            'template_id' => (string) ($this->input('template_id') ?? ''),
        ];
    }
}
