<?php

namespace App\Http\Controllers\Sale;

use App\Actions\Sale\ReceivedPayments\ListReceivedPaymentsForCompanyAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sale\ReceivedPaymentListRequest;
use App\Models\Company;
use App\Models\Sale\SaleDocumentPayment;
use App\Models\Shared\PaymentMethod;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ReceivedPaymentsController extends Controller
{
    public function index(
        ReceivedPaymentListRequest $request,
        ListReceivedPaymentsForCompanyAction $list,
    ): Response {
        $this->authorize('viewAny', SaleDocumentPayment::class);

        $company = $this->resolveCompany($request);
        $filters = $request->filtersForAction();
        $perPage = (int) ($filters['per_page'] ?? 20);

        $data = $company instanceof Company
            ? $list->execute($company->id, $filters)
            : new LengthAwarePaginator([], 0, max(1, $perPage), 1, [
                'path' => $request->url(),
                'query' => $request->query(),
            ]);

        return Inertia::render('sale/received-payments/index', [
            'data' => $data,
            'filters' => $request->filtersForFrontend(),
            'paymentMethods' => $this->paymentMethodOptions(),
        ]);
    }

    /**
     * @return list<array{id: string, name: string, code: string}>
     */
    private function paymentMethodOptions(): array
    {
        return PaymentMethod::query()
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (PaymentMethod $row): array => [
                'id' => $row->id,
                'name' => $row->name,
                'code' => $row->code,
            ])
            ->all();
    }
}
