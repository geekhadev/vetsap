import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
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

            <div className="flex min-w-0 flex-1 flex-col gap-8 p-4 lg:max-w-[1400px] lg:flex-row lg:items-start lg:gap-12">
                <div className="flex max-w-xs flex-col gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {COMPANY_OFFICES_PAGE.title}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {COMPANY_OFFICES_PAGE.description}
                    </p>
                </div>

                <Card className="min-w-0 flex-1 gap-0 py-0 shadow-xs">
                    <CardContent className="px-0">
                        <div className="p-6">
                            <OfficesSettingsPanel
                                companyId={companyId}
                                offices={offices}
                                canCreate={can.create}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default CompanyOfficesIndex;
