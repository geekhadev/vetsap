<?php

namespace App\Http\Requests\Medic;

use App\Support\Validation\DocumentTemplatePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DocumentTemplateUpdateRequest extends FormRequest
{
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
     * @return array{title: string, content: string}
     */
    public function templatePayload(): array
    {
        /** @var array{title: string, content: string} $validated */
        $validated = $this->validated();

        return [
            'title' => $validated['title'],
            'content' => $validated['content'],
        ];
    }
}
