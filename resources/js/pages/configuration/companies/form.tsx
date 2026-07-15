import { Head } from '@inertiajs/react';
import {
    SplitSettingsAside,
    SplitSettingsHeading,
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
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

            <SplitSettingsLayout>
                <SplitSettingsAside>
                    <SplitSettingsHeading
                        title={
                            isEdit
                                ? COMPANY_SETTINGS_PAGE.title
                                : 'Nueva empresa'
                        }
                        description={
                            isEdit
                                ? COMPANY_SETTINGS_PAGE.description
                                : 'Registra una nueva empresa en el sistema.'
                        }
                    />
                </SplitSettingsAside>

                <SplitSettingsPanel unwrapped contentClassName="space-y-8">
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
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}

export default CompanyForm;
