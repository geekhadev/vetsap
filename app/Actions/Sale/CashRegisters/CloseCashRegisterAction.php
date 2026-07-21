<?php

namespace App\Actions\Sale\CashRegisters;

use App\Enums\Sale\CashRegisterStatus;
use App\Models\Sale\CashRegister;
use App\Models\Sale\CashRegisterLine;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CloseCashRegisterAction
{
    public function __construct(
        private BuildCashRegisterClosePreviewAction $buildClosePreview,
    ) {}

    /**
     * @param  array{notes: ?string, lines: list<array{payment_method_id: string, declared_amount: int}>}  $data
     */
    public function execute(CashRegister $cashRegister, string $closedByUserId, array $data): CashRegister
    {
        if (! $cashRegister->isOpen()) {
            throw ValidationException::withMessages([
                'cash_register' => 'Esta caja ya está cerrada.',
            ]);
        }

        if ($cashRegister->opened_by_user_id !== $closedByUserId) {
            throw ValidationException::withMessages([
                'cash_register' => 'Solo puedes cerrar la caja que abriste.',
            ]);
        }

        $preview = $this->buildClosePreview->execute($cashRegister);
        $declaredByMethod = collect($data['lines'])
            ->keyBy('payment_method_id');

        $hasDiscrepancy = false;

        foreach ($preview as $row) {
            $declared = (int) data_get(
                $declaredByMethod->get($row['payment_method_id']),
                'declared_amount',
                0,
            );
            $system = (int) $row['system_amount'];

            if ($declared !== $system) {
                $hasDiscrepancy = true;
                break;
            }
        }

        if ($hasDiscrepancy && ($data['notes'] === null || trim($data['notes']) === '')) {
            throw ValidationException::withMessages([
                'notes' => 'Indica observaciones cuando haya descuadre de caja.',
            ]);
        }

        return DB::transaction(function () use ($cashRegister, $closedByUserId, $data, $preview, $declaredByMethod): CashRegister {
            foreach ($preview as $row) {
                $declared = (int) data_get(
                    $declaredByMethod->get($row['payment_method_id']),
                    'declared_amount',
                    0,
                );
                $system = (int) $row['system_amount'];

                CashRegisterLine::query()->create([
                    'cash_register_id' => $cashRegister->id,
                    'payment_method_id' => $row['payment_method_id'],
                    'system_amount' => $system,
                    'declared_amount' => $declared,
                    'difference' => $declared - $system,
                ]);
            }

            $cashRegister->update([
                'status' => CashRegisterStatus::Closed,
                'closed_by_user_id' => $closedByUserId,
                'closed_at' => Carbon::now(),
                'notes' => $data['notes'],
            ]);

            return $cashRegister->refresh();
        });
    }
}
