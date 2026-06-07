import { useMemo } from 'react';
import { store } from '@/routes/configuration/companies';

export type CompanyCreateFormFields = {
    document_type: string;
    document_number: string;
    name: string;
    alias: string;
    email: string;
    phone: string;
    address: string;
    select_after_create: boolean;
};

export function useCompanyCreateForm() {
    const formProps = useMemo(() => store.form(), []);

    return {
        formProps,
        headTitle: 'Nueva empresa',
        description:
            'Registra una nueva empresa. Al guardar, el contexto cambiará automáticamente a ella.',
    };
}
