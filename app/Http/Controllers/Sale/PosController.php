<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\Pos\DeletePosDraftDetailAction;
use App\Actions\Sale\Pos\LoadCustomerDraftAttentionsForPosAction;
use App\Actions\Sale\Pos\SearchPosCustomersWithDraftAttentionsAction;
use App\Actions\Sale\Pos\UpdatePosDraftDetailAction;
use App\Actions\Sale\Pos\UpdatePosDraftGlobalDiscountAction;
use App\Actions\Sale\Pos\UpsertPosDraftProductAction;
use App\Actions\Sale\SaleDocuments\ChargePosSaleAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\PosChargeRequest;
use App\Http\Requests\Sale\PosCustomerSearchRequest;
use App\Http\Requests\Sale\PosDraftDetailUpdateRequest;
use App\Http\Requests\Sale\PosDraftGlobalDiscountRequest;
use App\Http\Requests\Sale\PosDraftProductUpsertRequest;
use App\Models\Company;
use App\Models\Sale\CashRegister;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Models\Shared\PaymentMethod;
use App\Models\Shared\PaymentType;
use App\Models\Shared\SiiTaxDocumentType;
use App\Models\User;
use App\Support\Sale\ChileCashRounding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function searchCustomers(
        PosCustomerSearchRequest $request,
        SearchPosCustomersWithDraftAttentionsAction $search,
    ): JsonResponse {
        $this->authorizePos($request->user());

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['data' => []]);
        }

        $results = $search->execute(
            $company->id,
            (string) $request->validated('q'),
        );

        return response()->json(['data' => $results]);
    }

    public function customerDraftAttentions(
        Request $request,
        Customer $customer,
        LoadCustomerDraftAttentionsForPosAction $load,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('view', $customer);

        return response()->json([
            'data' => $load->execute($customer),
        ]);
    }

    public function options(Request $request): JsonResponse
    {
        $this->authorizePos($request->user());

        return response()->json([
            'data' => [
                'payment_methods' => PaymentMethod::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'code'])
                    ->map(static fn (PaymentMethod $method): array => [
                        'id' => $method->id,
                        'name' => $method->name,
                        'code' => $method->code,
                    ])
                    ->all(),
                'payment_types' => PaymentType::query()
                    ->orderBy('name')
                    ->get(['id', 'name', 'code', 'is_credit'])
                    ->map(static fn (PaymentType $type): array => [
                        'id' => $type->id,
                        'name' => $type->name,
                        'code' => $type->code,
                        'is_credit' => $type->is_credit,
                    ])
                    ->all(),
                'sii_tax_document_types' => SiiTaxDocumentType::query()
                    ->where('use_sale', true)
                    ->orderBy('code')
                    ->get(['id', 'code', 'name', 'abbreviation'])
                    ->map(static fn (SiiTaxDocumentType $type): array => [
                        'id' => $type->id,
                        'code' => $type->code,
                        'name' => $type->name,
                        'abbreviation' => $type->abbreviation,
                    ])
                    ->all(),
                'tax_percent' => (float) config('vetsap.sale.default_tax_percent', 19),
                'cash_round_to' => (int) config('vetsap.sale.cash_round_to', 10),
                'cash_round_threshold' => (int) config('vetsap.sale.cash_round_threshold', 5),
            ],
        ]);
    }

    public function charge(
        PosChargeRequest $request,
        ChargePosSaleAction $action,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('create', SaleDocument::class);

        $company = $request->selectedCompany();
        if (! $company instanceof Company) {
            return response()->json(['message' => 'Debes seleccionar una empresa.'], 422);
        }

        $document = $action->execute(
            $company->id,
            (string) $request->user()?->id,
            $request->chargePayload(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Cobro registrado correctamente.',
        ]);

        return response()->json([
            'data' => [
                'id' => $document->id,
                'total_amount' => (int) $document->total_amount,
                'paid_amount' => (int) $document->paid_amount,
                'cash_rounded_total' => ChileCashRounding::roundCashAmount((int) $document->total_amount),
            ],
        ]);
    }

    public function upsertDraftProduct(
        PosDraftProductUpsertRequest $request,
        Customer $customer,
        UpsertPosDraftProductAction $action,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('view', $customer);
        $this->authorize('create', SaleDocument::class);

        $payload = $action->execute(
            $customer,
            (string) $request->validated('product_id'),
            (string) $request->user()?->id,
            (int) ($request->validated('quantity_delta') ?? 1),
        );

        return response()->json(['data' => $payload]);
    }

    public function updateDraftDetailQuantity(
        PosDraftDetailUpdateRequest $request,
        Customer $customer,
        SaleDocumentDetail $detail,
        UpdatePosDraftDetailAction $action,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('view', $customer);
        $this->authorize('create', SaleDocument::class);

        $payload = $action->execute(
            $customer,
            $detail,
            $request->validated(),
            (string) $request->user()?->id,
        );

        return response()->json(['data' => $payload]);
    }

    public function updateDraftGlobalDiscount(
        PosDraftGlobalDiscountRequest $request,
        Customer $customer,
        UpdatePosDraftGlobalDiscountAction $action,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('view', $customer);
        $this->authorize('create', SaleDocument::class);

        $payload = $action->execute(
            $customer,
            (float) $request->validated('global_discount_percent'),
            (string) $request->user()?->id,
        );

        return response()->json(['data' => $payload]);
    }

    public function destroyDraftDetail(
        Request $request,
        Customer $customer,
        SaleDocumentDetail $detail,
        DeletePosDraftDetailAction $action,
    ): JsonResponse {
        $this->authorizePos($request->user());
        $this->authorize('view', $customer);
        $this->authorize('create', SaleDocument::class);

        $payload = $action->execute(
            $customer,
            $detail,
            (string) $request->user()?->id,
        );

        return response()->json(['data' => $payload]);
    }

    private function authorizePos(?User $user): void
    {
        abort_unless(
            $user instanceof User
            && (
                $user->can('create', CashRegister::class)
                || $user->can('viewAny', Customer::class)
            ),
            403,
        );
    }
}
