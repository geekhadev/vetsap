export type SaleDocumentBadgeProps = {
    /** Abreviatura del tipo SII (p. ej. CVE, FAE). */
    abbreviation?: string | null;
    /** Folio / número interno del documento de venta. */
    documentNumber?: string | null;
    /** Si se define, el badge es clicable (mismo aspecto, con cursor pointer). */
    onClick?: () => void;
    /** Título accesible cuando es clicable. */
    title?: string;
    className?: string;
};
