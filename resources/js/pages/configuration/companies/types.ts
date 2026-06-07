export type CompanyOwnerSummary = {
    id: string;
    name: string;
    email: string;
};

export type CompanyListItem = {
    id: string;
    document_type: string;
    document_number: string;
    name: string;
    alias: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    owner: CompanyOwnerSummary | null;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type CompanyFormRecord = {
    id: string;
    document_type: string;
    document_number: string;
    name: string;
    alias: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
};

export type CompaniesFormPageProps = {
    company: CompanyFormRecord | null;
    companyMissing?: boolean;
    can: {
        delete: boolean;
    };
};

/** Campos enviados con `useForm` en el formulario de empresa. */
export type CompanyFormData = Record<string, string | number>;
