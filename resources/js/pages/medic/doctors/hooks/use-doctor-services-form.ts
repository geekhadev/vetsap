import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import DoctorsController from '@/actions/App/Http/Controllers/Medic/DoctorsController';
import { formatDoctorName } from '../types';
import type { Doctor } from '../types';

export function useDoctorServicesForm(
    doctor: Doctor | null,
    onCleared?: () => void,
) {
    const [isClearing, setIsClearing] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    const formProps = useMemo(() => {
        if (doctor === null) {
            return DoctorsController.syncServices.form({ doctor: '' });
        }

        return DoctorsController.syncServices.form({ doctor: doctor.id });
    }, [doctor]);

    const headTitle = doctor
        ? `Servicios de ${formatDoctorName(doctor)}`
        : 'Gestionar servicios';

    const description =
        'Marca los servicios que presta este profesional y, si aplica, define una duración distinta a la del catálogo.';

    const requestClearServices = useCallback(() => {
        if (doctor === null) {
            return;
        }

        setConfirmClearOpen(true);
    }, [doctor]);

    const confirmClearServices = useCallback(() => {
        if (doctor === null) {
            return;
        }

        router.put(
            DoctorsController.syncServices.url({ doctor: doctor.id }),
            {
                services_present: '1',
                services: [],
            },
            {
                preserveScroll: true,
                onStart: () => setIsClearing(true),
                onFinish: () => setIsClearing(false),
                onSuccess: () => {
                    setConfirmClearOpen(false);
                    onCleared?.();
                },
            },
        );
    }, [doctor, onCleared]);

    return {
        formProps,
        headTitle,
        description,
        requestClearServices,
        confirmClearServices,
        confirmClearOpen,
        setConfirmClearOpen,
        isClearing,
    };
}
