import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { COMPANY_SETTINGS_PAGE } from '@/pages/configuration/companies/config';
import { useCompanyForm } from '@/pages/configuration/companies/hooks/use-company-form';
import { CompanyDeleteTabPanel } from '@/pages/configuration/companies/tabs/company-delete-tab-panel';
import { GeneralTabPanel } from '@/pages/configuration/companies/tabs/general-tab-panel';
import type { CompaniesFormPageProps } from '@/pages/configuration/companies/types';

function CompanyForm(props: CompaniesFormPageProps) {
    const { companyMissing = false, company, can } = props;
    const { form, submit, headTitle, isEdit } = useCompanyForm(props);

    if (companyMissing) {
        return (
            <>
                <Head title={COMPANY_SETTINGS_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para ver su configuración.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={headTitle} />

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:max-w-[1400px] lg:flex-row lg:items-start lg:gap-12">
                <div className="flex max-w-xs flex-col gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit
                            ? COMPANY_SETTINGS_PAGE.title
                            : 'Nueva empresa'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isEdit
                            ? COMPANY_SETTINGS_PAGE.description
                            : 'Registra una nueva empresa en el sistema.'}
                    </p>
                </div>

                <Card className="min-w-0 flex-1 gap-0 py-0 shadow-xs">
                    <CardContent className="space-y-8 p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <GeneralTabPanel
                                form={form}
                                isEdit={isEdit}
                                hideCancel={isEdit}
                            />
                        </form>

                        {isEdit && company ? (
                            <>
                                <Separator />
                                <CompanyDeleteTabPanel
                                    company={company}
                                    canDelete={can.delete}
                                />
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default CompanyForm;
