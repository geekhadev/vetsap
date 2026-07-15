import { router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import DoctorsController from '@/actions/App/Http/Controllers/Medic/DoctorsController';
import { formatDoctorName } from '../types';
import type { Doctor } from '../types';

export function useDoctorScheduleForm(
    doctor: Doctor | null,
    onCleared?: () => void,
) {
    const [isClearing, setIsClearing] = useState(false);
    const [confirmClearOpen, setConfirmClearOpen] = useState(false);

    const formProps = useMemo(() => {
        if (doctor === null) {
            return DoctorsController.syncSchedule.form({ doctor: '' });
        }

        return DoctorsController.syncSchedule.form({ doctor: doctor.id });
    }, [doctor]);

    const headTitle = doctor
        ? `Horarios de ${formatDoctorName(doctor)}`
        : 'Configurar horarios';

    const description =
        'Configura rangos horarios y selecciona a qué días de la semana aplica cada uno.';

    const requestClearSchedule = useCallback(() => {
        if (doctor === null) {
            return;
        }

        setConfirmClearOpen(true);
    }, [doctor]);

    const confirmClearSchedule = useCallback(() => {
        if (doctor === null) {
            return;
        }

        router.put(
            DoctorsController.syncSchedule.url({ doctor: doctor.id }),
            {
                blocks_present: '1',
                blocks: [],
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
        requestClearSchedule,
        confirmClearSchedule,
        confirmClearOpen,
        setConfirmClearOpen,
        isClearing,
    };
}
