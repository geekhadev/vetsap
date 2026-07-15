import { Head, usePage } from '@inertiajs/react';
import {
    SplitSettingsAside,
    SplitSettingsHeading,
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
import { COMPANY_OFFICES_PAGE } from '@/pages/configuration/company-offices/config';
import { OfficesSettingsPanel } from '@/pages/configuration/company-offices/offices-settings-panel';
import type { CompanyOfficesIndexPageProps } from '@/pages/configuration/company-offices/types';

function CompanyOfficesIndex() {
    const { companyMissing, companyId, offices, can } =
        usePage<CompanyOfficesIndexPageProps>().props;

    if (companyMissing || companyId === null) {
        return (
            <>
                <Head title={COMPANY_OFFICES_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para gestionar sucursales.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={COMPANY_OFFICES_PAGE.title} />

            <SplitSettingsLayout>
                <SplitSettingsAside>
                    <SplitSettingsHeading
                        title={COMPANY_OFFICES_PAGE.title}
                        description={COMPANY_OFFICES_PAGE.description}
                    />
                </SplitSettingsAside>

                <SplitSettingsPanel>
                    <OfficesSettingsPanel
                        companyId={companyId}
                        offices={offices}
                        canCreate={can.create}
                    />
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}

CompanyOfficesIndex.layout = {
    breadcrumbs: COMPANY_OFFICES_PAGE.breadcrumbs(),
};

export default CompanyOfficesIndex;
