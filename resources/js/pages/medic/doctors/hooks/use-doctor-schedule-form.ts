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

    const clearSchedule = useCallback(() => {
        if (doctor === null) {
            return;
        }

        if (
            !window.confirm(
                '¿Quitar todos los horarios de este doctor? Esta acción no se puede deshacer.',
            )
        ) {
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
                onSuccess: () => onCleared?.(),
            },
        );
    }, [doctor, onCleared]);

    return {
        formProps,
        headTitle,
        description,
        clearSchedule,
        isClearing,
    };
}
