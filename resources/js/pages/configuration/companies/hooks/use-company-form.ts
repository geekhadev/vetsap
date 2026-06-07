import { setLayoutProps, useForm } from '@inertiajs/react';
import { useLayoutEffect, useMemo } from 'react';
import { COMPANY_SETTINGS_PAGE } from '@/pages/configuration/companies/config';
import type {
    CompaniesFormPageProps,
    CompanyFormData,
    CompanyFormRecord,
} from '@/pages/configuration/companies/types';
import { store, update } from '@/routes/configuration/companies';

function buildFormDefaults(company: CompanyFormRecord | null): CompanyFormData {
    return {
        document_type: company?.document_type ?? 'RUT',
        document_number: company?.document_number ?? '',
        name: company?.name ?? '',
        alias: company?.alias ?? '',
        email: company?.email ?? '',
        phone: company?.phone ?? '',
        address: company?.address ?? '',
    };
}

export function useCompanyForm({ company }: CompaniesFormPageProps) {
    const isEdit = company != null;

    const formDefaults = useMemo(() => buildFormDefaults(company), [company]);

    const form = useForm<CompanyFormData>(formDefaults);

    useLayoutEffect(() => {
        if (company === null) {
            form.transform((data) => data);

            return;
        }

        form.transform((data) => {
            const rest = { ...data };
            delete rest.document_type;
            delete rest.document_number;

            return rest;
        });
    }, [company, form]);

    const breadcrumbs = useMemo(() => COMPANY_SETTINGS_PAGE.breadcrumbs(), []);

    useLayoutEffect(() => {
        setLayoutProps({ breadcrumbs });
    }, [breadcrumbs]);

    const headTitle = isEdit ? COMPANY_SETTINGS_PAGE.title : 'Nueva empresa';

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();

        if (isEdit && company) {
            form.patch(update.url(company.id), { preserveScroll: true });

            return;
        }

        form.post(store.url(), { preserveScroll: true });
    };

    return {
        form,
        submit,
        headTitle,
        isEdit,
    };
}
