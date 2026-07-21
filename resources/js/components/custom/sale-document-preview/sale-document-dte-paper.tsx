import {
    formatChileanRut,
    formatClpAmount,
    formatDteDate,
    resolveDocumentTypeTitle,
} from '@/components/custom/sale-document-preview/format';
import type { SaleDocumentPreview } from '@/components/custom/sale-document-preview/types';
import { cn } from '@/lib/utils';

/** Hoja carta (US Letter): 8.5 × 11 in */
const LETTER_PAGE_CLASS =
    'mx-auto box-border flex w-[min(100%,8.5in)] min-h-[11in] flex-col bg-white text-black shadow-md';

type SaleDocumentDtePaperProps = {
    document: SaleDocumentPreview;
    className?: string;
};

export function SaleDocumentDtePaper({
    document,
    className,
}: SaleDocumentDtePaperProps) {
    const typeTitle = resolveDocumentTypeTitle(
        document.sii_tax_document_type,
        document.is_boleta,
    );
    const folio =
        document.document_number?.trim() ||
        (document.status === 'draft' ? 'BORRADOR' : 'S/N');
    const typeCode = document.sii_tax_document_type?.code ?? '—';
    const city = document.emisor.city?.trim() || 'SANTIAGO';

    return (
        <article
            className={cn(
                LETTER_PAGE_CLASS,
                'border border-neutral-800 font-sans text-[11px] leading-snug',
                className,
            )}
        >
            <div className="grid gap-4 border-b border-neutral-800 px-[0.5in] py-4 sm:grid-cols-[1fr_13.5rem] sm:gap-6">
                <div className="space-y-1">
                    <p className="text-sm font-bold tracking-wide uppercase">
                        {document.emisor.name || 'Emisor'}
                    </p>
                    <p>
                        <span className="font-semibold">R.U.T.:</span>{' '}
                        {formatChileanRut(document.emisor.document_number)}
                    </p>
                    {document.emisor.giro ? (
                        <p>
                            <span className="font-semibold">Giro:</span>{' '}
                            {document.emisor.giro}
                        </p>
                    ) : null}
                    {document.emisor.address ? (
                        <p>
                            <span className="font-semibold">Dirección:</span>{' '}
                            {document.emisor.address}
                        </p>
                    ) : null}
                    {document.emisor.city ? (
                        <p>
                            <span className="font-semibold">Comuna:</span>{' '}
                            {document.emisor.city}
                        </p>
                    ) : null}
                    {document.emisor.acteco ? (
                        <p>
                            <span className="font-semibold">Acteco:</span>{' '}
                            {document.emisor.acteco}
                            {document.emisor.acteco_description
                                ? ` · ${document.emisor.acteco_description}`
                                : null}
                        </p>
                    ) : null}
                </div>

                <div className="border-2 border-neutral-900 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold tracking-wide">
                        R.U.T.: {formatChileanRut(document.emisor.document_number)}
                    </p>
                    <p className="mt-2 text-[11px] font-bold tracking-wide uppercase">
                        {typeTitle}
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-600">
                        Tipo DTE {typeCode}
                    </p>
                    <p className="mt-2 text-base font-bold tracking-wider">
                        N° {folio}
                    </p>
                </div>
            </div>

            <div className="space-y-1 border-b border-neutral-800 px-[0.5in] py-3">
                <p className="text-center text-[10px] font-semibold tracking-wide uppercase">
                    S.I.I. — {city}
                </p>
                {document.emisor.resolution_number ? (
                    <p className="text-center text-[10px] text-neutral-700">
                        Resolución Ex. SII N° {document.emisor.resolution_number}
                        {document.emisor.resolution_date
                            ? ` del ${document.emisor.resolution_date}`
                            : null}
                    </p>
                ) : (
                    <p className="text-center text-[10px] text-neutral-500 italic">
                        Vista previa — sin resolución SII configurada
                    </p>
                )}
                <p>
                    <span className="font-semibold">Fecha de emisión:</span>{' '}
                    {formatDteDate(document.issued_at)}
                </p>
            </div>

            <div className="space-y-1 border-b border-neutral-800 px-[0.5in] py-3">
                <p>
                    <span className="font-semibold">Señor(es):</span>{' '}
                    {document.receptor.name}
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                    <p>
                        <span className="font-semibold">R.U.T.:</span>{' '}
                        {formatChileanRut(document.receptor.document_number)}
                    </p>
                    {document.receptor.address ? (
                        <p>
                            <span className="font-semibold">Dirección:</span>{' '}
                            {document.receptor.address}
                        </p>
                    ) : null}
                </div>
                {!document.is_boleta && document.receptor.email ? (
                    <p>
                        <span className="font-semibold">Email:</span>{' '}
                        {document.receptor.email}
                    </p>
                ) : null}
            </div>

            <div className="flex-1 border-b border-neutral-800">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-neutral-800 bg-neutral-100">
                            <th className="w-14 py-2 pr-2 pl-[0.5in] font-semibold">
                                Cant.
                            </th>
                            <th className="px-2 py-2 font-semibold">
                                Descripción
                            </th>
                            <th className="w-16 px-2 py-2 font-semibold">
                                Afecto
                            </th>
                            <th className="w-24 px-2 py-2 text-right font-semibold">
                                P. unit.
                            </th>
                            <th className="w-24 py-2 pr-[0.5in] pl-2 text-right font-semibold">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {document.details.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-[0.5in] py-6 text-center text-neutral-500"
                                >
                                    Sin detalles
                                </td>
                            </tr>
                        ) : (
                            document.details.map((detail, index) => (
                                <tr
                                    key={`${detail.description}-${index}`}
                                    className="border-b border-neutral-200 align-top"
                                >
                                    <td className="py-1.5 pr-2 pl-[0.5in] tabular-nums">
                                        {detail.quantity}
                                    </td>
                                    <td className="px-2 py-1.5">
                                        {detail.description}
                                        {detail.discount_percent > 0 ? (
                                            <span className="mt-0.5 block text-[10px] text-neutral-500">
                                                Desc. {detail.discount_percent}%
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-2 py-1.5">
                                        {detail.tax_treatment === 'taxable'
                                            ? 'Sí'
                                            : 'No'}
                                    </td>
                                    <td className="px-2 py-1.5 text-right tabular-nums">
                                        {formatClpAmount(detail.unit_price)}
                                    </td>
                                    <td className="py-1.5 pr-[0.5in] pl-2 text-right tabular-nums">
                                        {formatClpAmount(detail.detail_total)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="grid gap-4 border-b border-neutral-800 px-[0.5in] py-4 sm:grid-cols-[1fr_14rem]">
                <div className="space-y-2 text-[10px] text-neutral-600">
                    {document.payments.length > 0 ? (
                        <div>
                            <p className="font-semibold text-neutral-800">
                                Formas de pago
                            </p>
                            <ul className="mt-1 space-y-0.5">
                                {document.payments.map((payment, index) => (
                                    <li
                                        key={`${payment.method_name}-${index}`}
                                    >
                                        {payment.method_name}:{' '}
                                        {formatClpAmount(payment.amount)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {document.notes ? (
                        <p>
                            <span className="font-semibold text-neutral-800">
                                Observaciones:
                            </span>{' '}
                            {document.notes}
                        </p>
                    ) : null}
                    <p className="pt-2">
                        Verifique documento en www.sii.cl
                    </p>
                </div>

                <div className="space-y-1 border border-neutral-800 bg-neutral-50 p-3">
                    {document.global_discount_amount > 0 ? (
                        <TotalRow
                            label={`Descuento (${document.global_discount_percent}%)`}
                            value={-document.global_discount_amount}
                        />
                    ) : null}
                    <TotalRow
                        label="Monto neto"
                        value={document.net_amount}
                    />
                    <TotalRow
                        label="Monto exento"
                        value={document.exempt_amount}
                    />
                    <TotalRow
                        label={`IVA (${document.tax_percent}%)`}
                        value={document.tax_amount}
                    />
                    <div className="mt-1 border-t border-neutral-800 pt-1">
                        <TotalRow
                            label="Total"
                            value={document.total_amount}
                            emphasize
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-2 px-[0.5in] py-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full max-w-[14rem] border-2 border-dashed border-neutral-400 bg-neutral-50 px-3 py-4 text-center">
                    <div
                        aria-hidden
                        className="mx-auto mb-2 grid h-16 w-28 grid-cols-8 gap-px opacity-70"
                    >
                        {Array.from({ length: 64 }, (_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'bg-neutral-900',
                                    i % 3 === 0 || i % 7 === 0
                                        ? 'opacity-100'
                                        : 'opacity-30',
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-[9px] font-semibold tracking-wide uppercase">
                        Timbre electrónico SII
                    </p>
                    <p className="mt-0.5 text-[9px] text-neutral-500">
                        Vista previa (sin TED real)
                    </p>
                </div>
                <p className="max-w-xs text-center text-[9px] text-neutral-500 sm:text-right">
                    Documento tributario electrónico — representación impresa
                    de vista previa. No constituye DTE firmado ante el SII.
                </p>
            </div>
        </article>
    );
}

function TotalRow({
    label,
    value,
    emphasize = false,
}: {
    label: string;
    value: number;
    emphasize?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-baseline justify-between gap-3',
                emphasize && 'text-sm font-bold',
            )}
        >
            <span>{label}</span>
            <span className="tabular-nums">{formatClpAmount(value)}</span>
        </div>
    );
}
