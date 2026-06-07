import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { useCompanyForm } from '@/pages/configuration/companies/hooks/use-company-form';
import { CompanyDeleteTabPanel } from '@/pages/configuration/companies/tabs/company-delete-tab-panel';
import { CompanyFormSidebar } from '@/pages/configuration/companies/tabs/company-form-sidebar';
import { GeneralTabPanel } from '@/pages/configuration/companies/tabs/general-tab-panel';
import { buildEmptySiiIntegrationFormData } from '@/pages/configuration/companies/tabs/integrations/sii-integration-keys';
import { IntegrationsTabPanel } from '@/pages/configuration/companies/tabs/integrations-tab-panel';
import { PlaceholderTabPanel } from '@/pages/configuration/companies/tabs/placeholder-tab-panel';
import { WebSiteTabPanel } from '@/pages/configuration/companies/tabs/web-site-tab-panel';
import type { CompaniesFormPageProps } from '@/pages/configuration/companies/types';

function CompanyForm(props: CompaniesFormPageProps) {
    const { tab, setTab, form, submit, headTitle, isEdit } =
        useCompanyForm(props);

    const siiIntegration = useMemo(
        () => props.siiIntegration ?? buildEmptySiiIntegrationFormData(),
        [props.siiIntegration],
    );

    return (
        <>
            <Head title={headTitle} />

            <div className="flex min-w-0 flex-1 flex-row items-start gap-12 p-4 max-w-[1400px]">
                <CompanyFormSidebar
                    activeTab={tab}
                    onTabChange={setTab}
                    isEdit={isEdit}
                />

                <div className="min-w-0 flex-1 space-y-6">
                    {tab === 'general' ? (
                        <form onSubmit={submit} className="space-y-6">
                            <GeneralTabPanel form={form} isEdit={isEdit} />
                        </form>
                    ) : null}

                    {tab === 'integraciones' ? (
                        <IntegrationsTabPanel
                            companyId={props.company?.id ?? null}
                            siiCertificateDownloadUrl={
                                props.siiCertificateDownloadUrl ?? null
                            }
                            siiIntegration={siiIntegration}
                            siiEconomicActivities={
                                props.siiEconomicActivities ?? []
                            }
                        />
                    ) : null}

                    {tab === 'facturacion' ? (
                        <PlaceholderTabPanel message="Los datos de facturación se definirán más adelante." />
                    ) : null}

                    {tab === 'web' && props.company ? (
                        <WebSiteTabPanel company={props.company} />
                    ) : null}

                    {tab === 'eliminar' && props.company ? (
                        <CompanyDeleteTabPanel
                            company={props.company}
                            canDelete={props.can.delete}
                        />
                    ) : null}
                </div>
            </div>
        </>
    );
}

export default CompanyForm;
