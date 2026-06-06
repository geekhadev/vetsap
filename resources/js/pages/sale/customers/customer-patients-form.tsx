import { router } from '@inertiajs/react';
import { CirclePlus, PencilIcon, TrashIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { PatientRecordBadge } from '@/components/custom/patient-record-badge';
import { PatientSexBadge } from '@/components/custom/patient-sex-badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PatientForm } from '@/pages/medic/patients/form';
import {
    formatSpeciesAndBreed
    
    
} from '@/pages/medic/patients/types';
import type {Patient, SpeciesOption} from '@/pages/medic/patients/types';
import type { Customer } from '@/pages/sale/customers/types';
import { destroy } from '@/routes/medic/patients';

type CustomerPatientsCan = {
    create: boolean;
    update: boolean;
    delete: boolean;
};

type CustomerPatientsFormProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
    speciesOptions: SpeciesOption[];
    can: CustomerPatientsCan;
};

export function CustomerPatientsForm({
    open,
    onOpenChange,
    customer,
    speciesOptions,
    can,
}: CustomerPatientsFormProps) {
    const [patientFormOpen, setPatientFormOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    const patients = customer?.patients ?? [];

    const openCreate = useCallback(() => {
        setEditingPatient(null);
        setPatientFormOpen(true);
    }, []);

    const openEdit = useCallback((patient: Patient) => {
        setEditingPatient(patient);
        setPatientFormOpen(true);
    }, []);

    const handlePatientFormOpenChange = useCallback((nextOpen: boolean) => {
        setPatientFormOpen(nextOpen);

        if (!nextOpen) {
            setEditingPatient(null);
        }
    }, []);

    const deletePatient = useCallback(
        (patient: Patient) => {
            if (!window.confirm(`¿Eliminar al paciente «${patient.name}»?`)) {
                return;
            }

            router.delete(
                destroy.url(patient.id, {
                    query: { redirect_to: 'customers' },
                }),
                { preserveScroll: true },
            );
        },
        [],
    );

    if (customer === null) {
        return null;
    }

    return (
        <>
            <PatientForm
                open={patientFormOpen}
                onOpenChange={handlePatientFormOpenChange}
                entity={editingPatient}
                speciesOptions={speciesOptions}
                fixedCustomerId={customer.id}
                redirectTo="customers"
            />

            <Dialog open={open && !patientFormOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Pacientes de {customer.name}</DialogTitle>
                        <DialogDescription>
                            Gestiona las fichas clínicas asociadas a este cliente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {can.create ? (
                            <div className="flex justify-end">
                                <Button type="button" onClick={openCreate}>
                                    <CirclePlus />
                                    Nuevo paciente
                                </Button>
                            </div>
                        ) : null}

                        {patients.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Este cliente aún no tiene pacientes registrados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-left">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Ficha</th>
                                            <th className="px-3 py-2 font-medium">Nombre</th>
                                            <th className="px-3 py-2 font-medium">Especie / Raza</th>
                                            <th className="px-3 py-2 font-medium">Sexo</th>
                                            <th className="px-3 py-2 font-medium text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((patient) => (
                                            <tr key={patient.id} className="border-t">
                                                <td className="px-3 py-2">
                                                    <PatientRecordBadge
                                                        recordNumber={patient.record_number}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">{patient.name}</td>
                                                <td className="px-3 py-2">
                                                    {formatSpeciesAndBreed(
                                                        patient.species,
                                                        patient.breed,
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <PatientSexBadge sex={patient.sex} />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex justify-end gap-1">
                                                        {can.update ? (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                type="button"
                                                                title="Editar paciente"
                                                                onClick={() => openEdit(patient)}
                                                            >
                                                                <PencilIcon className="size-3" />
                                                            </Button>
                                                        ) : null}
                                                        {can.delete ? (
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                type="button"
                                                                title="Eliminar paciente"
                                                                onClick={() => deletePatient(patient)}
                                                            >
                                                                <TrashIcon className="size-3" />
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
