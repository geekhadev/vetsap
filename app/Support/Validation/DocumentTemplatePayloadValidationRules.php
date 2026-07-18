<?php

namespace App\Support\Validation;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class DocumentTemplatePayloadValidationRules
{
    /**
     * @return array<string, list<string|Closure|ValidationRule>>
     */
    public static function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => [
                'required',
                'string',
                'max:200000',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! is_string($value)) {
                        return;
                    }

                    $plain = trim(html_entity_decode(strip_tags($value)));

                    if ($plain === '') {
                        $fail('El contenido del documento es obligatorio.');
                    }
                },
            ],
        ];
    }
}
