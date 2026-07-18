<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\DocumentTemplatePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DocumentTemplateStoreRequest extends FormRequest
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
        return DocumentTemplatePayloadValidationRules::rules();
    }

    /**
     * @return array{company_id: string, title: string, content: string}
     */
    public function templatePayload(): array
    {
        /** @var array{title: string, content: string} $validated */
        $validated = $this->validated();

        return [
            'company_id' => (string) $this->selectedCompanyId(),
            'title' => $validated['title'],
            'content' => $validated['content'],
        ];
    }
}
