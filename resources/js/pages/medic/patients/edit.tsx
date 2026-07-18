import { Head, usePage } from '@inertiajs/react';
import { CONFIG_TABLEDATA } from '@/pages/medic/patients/config';
import { PatientFormPage } from '@/pages/medic/patients/patient-form-page';
import type { PatientsEditPageProps } from '@/pages/medic/patients/types';

function PatientsEdit() {
    const {
        patient,
        species,
        customers,
        redirectTo,
        activeTab,
        draftAttention,
        templates,
        doctors,
        examServices,
        attentions,
        appointments,
        appointmentFormOptions,
        appointmentHolidays,
        appointmentStatuses,
        can,
    } = usePage<PatientsEditPageProps>().props;

    return (
        <>
            <Head title={`${patient.name} · ${patient.record_number}`} />

            <PatientFormPage
                patient={patient}
                species={species}
                customers={customers}
                redirectTo={redirectTo}
                activeTab={activeTab}
                draftAttention={draftAttention}
                templates={templates}
                doctors={doctors}
                examServices={examServices}
                attentions={attentions}
                appointments={appointments}
                appointmentFormOptions={appointmentFormOptions}
                appointmentHolidays={appointmentHolidays}
                appointmentStatuses={appointmentStatuses}
                can={can}
            />
        </>
    );
}

PatientsEdit.layout = {
    breadcrumbs: CONFIG_TABLEDATA.breadcrumbs.edit(),
};

export default PatientsEdit;
