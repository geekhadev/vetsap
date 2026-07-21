<?php

namespace App\Http\Requests\Sale;

use App\Models\Shared\PaymentMethod;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CashRegisterCloseRequest extends FormRequest
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
        return [
            'notes' => ['nullable', 'string', 'max:2000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.payment_method_id' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists(PaymentMethod::class, 'id'),
            ],
            'lines.*.declared_amount' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array{notes: ?string, lines: list<array{payment_method_id: string, declared_amount: int}>}
     */
    public function closePayload(): array
    {
        /** @var array{notes?: string|null, lines: list<array{payment_method_id: string, declared_amount: int|string}>} $validated */
        $validated = $this->validated();

        return [
            'notes' => isset($validated['notes']) && $validated['notes'] !== ''
                ? $validated['notes']
                : null,
            'lines' => array_map(
                static fn (array $line): array => [
                    'payment_method_id' => $line['payment_method_id'],
                    'declared_amount' => (int) $line['declared_amount'],
                ],
                $validated['lines'],
            ),
        ];
    }
}
