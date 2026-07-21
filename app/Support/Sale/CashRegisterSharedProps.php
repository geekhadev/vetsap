<?php

namespace App\Support\Sale;

use App\Actions\Sale\CashRegisters\BuildCashRegisterClosePreviewAction;
use App\Actions\Sale\CashRegisters\ResolveOpenCashRegisterForUserAction;
use App\Models\CompanyOffice;
use App\Models\Sale\CashRegister;
use App\Models\User;
use App\Support\SelectedCompanySession;
use Illuminate\Http\Request;

final class CashRegisterSharedProps
{
    /**
     * @return array{
     *     open: array{
     *         id: string,
     *         opened_at: string|null,
     *         opening_amount: int,
     *         is_from_previous_day: bool,
     *         office: array{id: string, name: string}|null,
     *         lines: list<array{payment_method_id: string, payment_method_name: string, payment_method_code: string, system_amount: int}>
     *     }|null,
     *     offices: list<array{id: string, name: string, is_main: bool}>,
     *     can_open: bool,
     *     can_close: bool
     * }
     */
    public static function forRequest(Request $request): array
    {
        $empty = [
            'open' => null,
            'offices' => [],
            'can_open' => false,
            'can_close' => false,
        ];

        $user = $request->user();
        if (! $user instanceof User) {
            return $empty;
        }

        $companyId = SelectedCompanySession::selectedCompanyId($request);
        if ($companyId === null) {
            return $empty;
        }

        $canOpen = $user->can('create', CashRegister::class);
        $open = app(ResolveOpenCashRegisterForUserAction::class)->execute($companyId, $user->id);
        $canClose = $open instanceof CashRegister && $user->can('close', $open);

        $lines = $open instanceof CashRegister
            ? app(BuildCashRegisterClosePreviewAction::class)->execute($open)
            : [];

        $isFromPreviousDay = $open instanceof CashRegister && $open->isFromPreviousDay();

        return [
            'open' => $open instanceof CashRegister
                ? [
                    'id' => $open->id,
                    'opened_at' => $open->opened_at?->toIso8601String(),
                    'opening_amount' => (int) $open->opening_amount,
                    'is_from_previous_day' => $isFromPreviousDay,
                    'office' => $open->office
                        ? [
                            'id' => $open->office->id,
                            'name' => $open->office->name,
                        ]
                        : null,
                    'lines' => $lines,
                ]
                : null,
            'offices' => $canOpen ? self::officeOptions($companyId) : [],
            'can_open' => $canOpen,
            'can_close' => $canClose,
        ];
    }

    /**
     * @return list<array{id: string, name: string, is_main: bool}>
     */
    private static function officeOptions(string $companyId): array
    {
        return CompanyOffice::query()
            ->where('company_id', $companyId)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'is_main'])
            ->map(fn (CompanyOffice $office): array => [
                'id' => $office->id,
                'name' => $office->name,
                'is_main' => (bool) $office->is_main,
            ])
            ->all();
    }
}
