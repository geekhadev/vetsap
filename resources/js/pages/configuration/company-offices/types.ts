export type CompanyOfficeListItem = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    can: {
        update: boolean;
        delete: boolean;
    };
};

export type CompanyOfficesIndexPageProps = {
    companyMissing: boolean;
    companyId: string | null;
    offices: CompanyOfficeListItem[];
    can: {
        create: boolean;
    };
};
