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
    const { formProps, headTitle, description, clearSchedule, isClearing } =
        useDoctorScheduleForm(doctor, () => onOpenChange(false));

    if (doctor === null) {
        return null;
    }

    return (
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
                        onClear={clearSchedule}
                        processing={processing || isClearing}
                        clearDisabled={processing || isClearing}
                        submitDisabled={processing || isClearing}
                        isEdit
                        submitLabel="Guardar horarios"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
