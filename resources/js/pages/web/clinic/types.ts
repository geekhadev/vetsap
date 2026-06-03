export type ClinicCompany = {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
};

export type ClinicSettings = Record<string, string | null>;

export type ClinicShowProps = {
    company: ClinicCompany;
    settings: ClinicSettings;
    canEdit: boolean;
};
