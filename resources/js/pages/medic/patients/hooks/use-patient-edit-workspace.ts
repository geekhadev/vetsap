import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import type { Patient, PatientEditTabId } from '@/pages/medic/patients/types';
import { edit as patientsEdit } from '@/routes/medic/patients';

type UsePatientEditWorkspaceOptions = {
    patient: Patient;
    redirectTo: 'patients' | 'customers';
};

export function usePatientEditWorkspace({ patient, redirectTo }: UsePatientEditWorkspaceOptions) {
    const changeTab = useCallback(
        (tab: PatientEditTabId) => {
            const query: Record<string, string> = { tab };

            if (redirectTo === 'customers') {
                query.redirect_to = 'customers';
            }

            router.get(
                patientsEdit.url({ patient: patient.id }, { query }),
                {},
                { preserveScroll: true },
            );
        },
        [patient.id, redirectTo],
    );

    return { changeTab };
}
