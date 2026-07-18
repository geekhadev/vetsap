<?php

namespace App\Http\Requests\Store;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductAutocompleteSearchRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'exclude_ids' => ['nullable', 'array'],
            'exclude_ids.*' => ['uuid'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $excludeIds = $this->input('exclude_ids', []);

        if (is_string($excludeIds)) {
            $excludeIds = array_values(array_filter(array_map(
                static fn (string $id): string => trim($id),
                explode(',', $excludeIds),
            )));
        }

        if (! is_array($excludeIds)) {
            $excludeIds = [];
        }

        $this->merge([
            'q' => is_string($this->input('q')) ? trim($this->input('q')) : $this->input('q'),
            'exclude_ids' => array_values(array_unique(array_filter($excludeIds))),
        ]);
    }

    /**
     * @return list<string>
     */
    public function excludeIds(): array
    {
        /** @var list<string> $ids */
        $ids = $this->validated('exclude_ids') ?? [];

        return $ids;
    }
}
