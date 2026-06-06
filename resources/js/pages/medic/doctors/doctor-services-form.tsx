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
};

export function DoctorServicesForm({
    open,
    onOpenChange,
    doctor,
    serviceOptions,
}: DoctorServicesFormProps) {
    const { formProps, headTitle, description, clearServices, isClearing } =
        useDoctorServicesForm(doctor, () => onOpenChange(false));

    if (doctor === null) {
        return null;
    }

    return (
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
                    />

                    <FormDialogFooter
                        onCancel={() => onOpenChange(false)}
                        onClear={clearServices}
                        processing={processing || isClearing}
                        clearDisabled={processing || isClearing}
                        submitDisabled={processing || isClearing}
                        isEdit
                        submitLabel="Guardar servicios"
                    />
                </>
            )}
        </InertiaFormDialog>
    );
}
