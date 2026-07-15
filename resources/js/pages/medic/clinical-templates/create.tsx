import { Head, router, usePage } from '@inertiajs/react';
import { CONFIG_TABLEDATA } from '@/pages/medic/clinical-templates/config';
import { TemplateFormPage } from '@/pages/medic/clinical-templates/template-form-page';
import type { SpeciesOption } from '@/pages/medic/clinical-templates/types';
import { index as clinicalTemplatesIndex, store as clinicalTemplatesStore } from '@/routes/medic/clinical-templates';

type CreatePageProps = {
    species: SpeciesOption[];
};

function ClinicalTemplatesCreate() {
    const { species } = usePage<CreatePageProps>().props;

    return (
        <>
            <Head title="Nueva plantilla de ficha" />
            <TemplateFormPage
                species={species}
                submitUrl={clinicalTemplatesStore.url()}
                method="post"
                onCancel={() => router.visit(clinicalTemplatesIndex.url())}
            />
        </>
    );
}

ClinicalTemplatesCreate.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.create(),
};

export default ClinicalTemplatesCreate;
