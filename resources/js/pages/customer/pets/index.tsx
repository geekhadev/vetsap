import { Head } from '@inertiajs/react';
import { PawPrint } from 'lucide-react';
import { buildAppRootBreadcrumbs } from '@/lib/module-breadcrumbs';
import { CustomerPetCard } from '@/pages/customer/pets/customer-pet-card';
import type { CustomerPetsIndexPageProps } from '@/pages/customer/pets/types';
import { index as petsIndex } from '@/routes/customer/pets';

export default function CustomerPetsIndex({ pets }: CustomerPetsIndexPageProps) {
    return (
        <>
            <Head title="Mis mascotas" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Mis mascotas
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Pacientes asociados a tu cuenta.
                    </p>
                </div>

                {pets.length === 0 ? (
                    <div className="border-border bg-muted/30 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
                        <PawPrint
                            className="text-muted-foreground size-10"
                            aria-hidden
                        />
                        <div className="space-y-1">
                            <p className="font-medium">Aún no hay mascotas</p>
                            <p className="text-muted-foreground text-sm">
                                Cuando la clínica vincule pacientes a tu cuenta,
                                aparecerán aquí.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="mx-auto grid w-full max-w-3xl gap-4">
                        {pets.map((pet) => (
                            <li key={pet.id}>
                                <CustomerPetCard pet={pet} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

CustomerPetsIndex.layout = {
    breadcrumbs: buildAppRootBreadcrumbs(petsIndex()),
};
