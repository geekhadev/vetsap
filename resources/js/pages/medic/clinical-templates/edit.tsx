import { Head, router, usePage } from '@inertiajs/react';
import { CONFIG_TABLEDATA } from '@/pages/medic/clinical-templates/config';
import { TemplateFormPage } from '@/pages/medic/clinical-templates/template-form-page';
import type { ClinicalTemplate, SpeciesOption } from '@/pages/medic/clinical-templates/types';
import {
    index as clinicalTemplatesIndex,
    update as clinicalTemplatesUpdate,
} from '@/routes/medic/clinical-templates';

type EditPageProps = {
    template: ClinicalTemplate;
    species: SpeciesOption[];
};

function ClinicalTemplatesEdit() {
    const { template, species } = usePage<EditPageProps>().props;

    return (
        <>
            <Head title={`Editar: ${template.name}`} />
            <TemplateFormPage
                template={template}
                species={species}
                submitUrl={clinicalTemplatesUpdate.url({ clinical_template: template.id })}
                method="put"
                onCancel={() => router.visit(clinicalTemplatesIndex.url())}
            />
        </>
    );
}

ClinicalTemplatesEdit.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.edit(),
};

export default ClinicalTemplatesEdit;
