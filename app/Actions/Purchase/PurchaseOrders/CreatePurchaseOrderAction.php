<?php

namespace App\Actions\Purchase\PurchaseOrders;

use App\Models\Purchase\PurchaseOrder;
use App\Models\Purchase\PurchaseOrderDetail;
use Illuminate\Support\Facades\DB;

final class CreatePurchaseOrderAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     ordered_at: string,
     *     supplier_id: string,
     *     purchase_order_status_id: string,
     *     user_id: string,
     *     details: list<array{product_id: string, quantity: int, unit_price: string, total: string}>,
     *     total: string
     * }  $data
     */
    public function execute(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data): PurchaseOrder {
            $order = PurchaseOrder::query()->create([
                'company_id' => $data['company_id'],
                'ordered_at' => $data['ordered_at'],
                'supplier_id' => $data['supplier_id'],
                'purchase_order_status_id' => $data['purchase_order_status_id'],
                'user_id' => $data['user_id'],
                'total' => $data['total'],
            ]);

            foreach ($data['details'] as $detail) {
                PurchaseOrderDetail::query()->create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_price' => $detail['unit_price'],
                    'total' => $detail['total'],
                ]);
            }

            return $order->load([
                'supplier:id,name,document_number',
                'purchaseOrderStatus:id,name,color',
                'user:id,name',
                'details.product:id,name,barcode',
            ]);
        });
    }
}
