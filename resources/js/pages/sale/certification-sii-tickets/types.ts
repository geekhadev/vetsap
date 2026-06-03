export type CertificationSiiTicketRow = {
    id: string;
    number: number;
    created_at: string | null;
    dte_init: string;
    dte_end: string;
};

export type CertificationSiiTicketsIndexPageProps = {
    sii_ready: boolean;
    tickets: CertificationSiiTicketRow[];
};
