import { useCallback, useState } from 'react';
import {
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import { PatientForm } from '@/pages/medic/patients/form';
import { usePatientEditWorkspace } from '@/pages/medic/patients/hooks/use-patient-edit-workspace';
import { PatientEditSidebar } from '@/pages/medic/patients/patient-edit-sidebar';
import { PatientEditTabPanel } from '@/pages/medic/patients/patient-edit-tab-panel';
import type {
    AttentionSummary,
    CustomerOption,
    Patient,
    PatientDoctorOption,
    PatientEditTabId,
    PatientTemplateOption,
    PatientsEditCan,
    SpeciesOption,
} from '@/pages/medic/patients/types';

type PatientFormPageProps = {
    patient: Patient;
    species: SpeciesOption[];
    customers: CustomerOption[];
    redirectTo: 'patients' | 'customers';
    activeTab: PatientEditTabId;
    draftAttention: ClinicalAttention | null;
    templates: PatientTemplateOption[];
    doctors: PatientDoctorOption[];
    attentions: AttentionSummary[];
    can: PatientsEditCan;
};

export function PatientFormPage({
    patient,
    species,
    customers,
    redirectTo,
    activeTab,
    draftAttention,
    templates,
    doctors,
    attentions,
    can,
}: PatientFormPageProps) {
    const [formOpen, setFormOpen] = useState(false);

    const { changeTab } = usePatientEditWorkspace({ patient, redirectTo });

    const handleEdit = useCallback(() => {
        setFormOpen(true);
    }, []);

    const handleFormOpenChange = useCallback((open: boolean) => {
        setFormOpen(open);
    }, []);

    return (
        <>
            <PatientForm
                open={formOpen}
                onOpenChange={handleFormOpenChange}
                entity={patient}
                speciesOptions={species}
                customerOptions={customers}
                redirectTo={redirectTo}
            />

            <SplitSettingsLayout>
                <PatientEditSidebar patient={patient} onEdit={handleEdit} />

                <SplitSettingsPanel>
                    <PatientEditTabPanel
                        patient={patient}
                        activeTab={activeTab}
                        onTabChange={changeTab}
                        draftAttention={draftAttention}
                        templates={templates}
                        doctors={doctors}
                        attentions={attentions}
                        can={can}
                    />
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}
