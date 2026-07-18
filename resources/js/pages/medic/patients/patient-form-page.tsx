import { useCallback, useState } from 'react';
import type { CalendarHoliday } from '@/components/custom/full-calendar/types';
import {
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
import type {
    AppointmentFormOptions,
    AppointmentStatusOption,
} from '@/pages/agenda/calendar/types';
import type { ClinicalAttention } from '@/pages/medic/clinical-attentions/types';
import { PatientForm } from '@/pages/medic/patients/form';
import { usePatientEditWorkspace } from '@/pages/medic/patients/hooks/use-patient-edit-workspace';
import { PatientEditSidebar } from '@/pages/medic/patients/patient-edit-sidebar';
import { PatientEditTabPanel } from '@/pages/medic/patients/patient-edit-tab-panel';
import type {
    AttentionSummary,
    CustomerOption,
    DocumentTemplateOption,
    ExamServiceOption,
    Patient,
    PatientAppointmentSummary,
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
    examServices: ExamServiceOption[];
    documentTemplates: DocumentTemplateOption[];
    attentions: AttentionSummary[];
    appointments: PatientAppointmentSummary[];
    appointmentFormOptions: AppointmentFormOptions;
    appointmentHolidays: CalendarHoliday[];
    appointmentStatuses: AppointmentStatusOption[];
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
    examServices,
    documentTemplates,
    attentions,
    appointments,
    appointmentFormOptions,
    appointmentHolidays,
    appointmentStatuses,
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

            <SplitSettingsLayout className="lg:max-w-none lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:items-stretch lg:gap-x-4 lg:overflow-hidden">
                <PatientEditSidebar patient={patient} onEdit={handleEdit} />

                <SplitSettingsPanel
                    className="flex max-h-[calc(100svh-7.5rem)] min-h-0 flex-col overflow-hidden"
                    contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                    <PatientEditTabPanel
                        patient={patient}
                        activeTab={activeTab}
                        onTabChange={changeTab}
                        draftAttention={draftAttention}
                        templates={templates}
                        doctors={doctors}
                        examServices={examServices}
                        documentTemplates={documentTemplates}
                        attentions={attentions}
                        appointments={appointments}
                        appointmentFormOptions={appointmentFormOptions}
                        appointmentHolidays={appointmentHolidays}
                        appointmentStatuses={appointmentStatuses}
                        can={can}
                    />
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}
