import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { DoctorScheduleEditor } from '@/pages/medic/doctors/doctor-schedule-editor';
import { useDoctorScheduleForm } from '@/pages/medic/doctors/hooks/use-doctor-schedule-form';
import type { Doctor } from '@/pages/medic/doctors/types';

type DoctorScheduleFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: Doctor | null;
};

export function DoctorScheduleForm({
    open,
    onOpenChange,
    doctor,
}: DoctorScheduleFormProps) {
    const {
        formProps,
        headTitle,
        description,
        requestClearSchedule,
        confirmClearSchedule,
        confirmClearOpen,
        setConfirmClearOpen,
        isClearing,
    } = useDoctorScheduleForm(doctor, () => onOpenChange(false));

    if (doctor === null) {
        return null;
    }

    return (
        <>
            <InertiaFormDialog
                open={open}
                onOpenChange={onOpenChange}
                title={headTitle}
                description={description}
                formKey={`${doctor.id}-schedule`}
                inertiaForm={{ ...formProps }}
                contentClassName="sm:max-w-2xl"
            >
                {({ processing }) => (
                    <>
                        <DoctorScheduleEditor blocks={doctor.schedule_blocks} />

                        <FormDialogFooter
                            onCancel={() => onOpenChange(false)}
                            onClear={requestClearSchedule}
                            processing={processing || isClearing}
                            clearDisabled={processing || isClearing}
                            submitDisabled={processing || isClearing}
                            isEdit
                            submitLabel="Guardar horarios"
                        />
                    </>
                )}
            </InertiaFormDialog>

            <ConfirmDialog
                open={confirmClearOpen}
                onOpenChange={(nextOpen) => {
                    if (!isClearing) {
                        setConfirmClearOpen(nextOpen);
                    }
                }}
                title="¿Quitar todos los horarios?"
                description="Se quitarán todos los horarios de este doctor. Esta acción no se puede deshacer."
                confirmLabel={isClearing ? 'Quitando…' : 'Quitar horarios'}
                confirmVariant="destructive"
                confirming={isClearing}
                onConfirm={confirmClearSchedule}
            />
        </>
    );
}
