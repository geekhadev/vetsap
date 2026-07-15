import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { DoctorServicesEditor } from '@/pages/medic/doctors/doctor-services-editor';
import { useDoctorServicesForm } from '@/pages/medic/doctors/hooks/use-doctor-services-form';
import type { Doctor, ServiceOption } from '@/pages/medic/doctors/types';

type DoctorServicesFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctor: Doctor | null;
    serviceOptions: ServiceOption[];
    timeBlockMinutes: number;
};

export function DoctorServicesForm({
    open,
    onOpenChange,
    doctor,
    serviceOptions,
    timeBlockMinutes,
}: DoctorServicesFormProps) {
    const {
        formProps,
        headTitle,
        description,
        requestClearServices,
        confirmClearServices,
        confirmClearOpen,
        setConfirmClearOpen,
        isClearing,
    } = useDoctorServicesForm(doctor, () => onOpenChange(false));

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
                formKey={doctor.id}
                inertiaForm={{ ...formProps }}
                contentClassName="sm:max-w-2xl"
            >
                {({ processing }) => (
                    <>
                        <DoctorServicesEditor
                            serviceOptions={serviceOptions}
                            assigned={doctor.services}
                            timeBlockMinutes={timeBlockMinutes}
                        />

                        <FormDialogFooter
                            onCancel={() => onOpenChange(false)}
                            onClear={requestClearServices}
                            processing={processing || isClearing}
                            clearDisabled={processing || isClearing}
                            submitDisabled={processing || isClearing}
                            isEdit
                            submitLabel="Guardar servicios"
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
                title="¿Quitar todos los servicios?"
                description="Se quitarán todos los servicios asignados a este doctor. Esta acción no se puede deshacer."
                confirmLabel={isClearing ? 'Quitando…' : 'Quitar servicios'}
                confirmVariant="destructive"
                confirming={isClearing}
                onConfirm={confirmClearServices}
            />
        </>
    );
}
