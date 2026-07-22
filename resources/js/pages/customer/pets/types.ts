import type { PatientSexValue } from '@/components/custom/patient-sex-badge';

export type CustomerPet = {
    id: string;
    name: string;
    record_number: string;
    breed: string | null;
    sex: PatientSexValue;
    birth_date: string | null;
    weight_kg: string | null;
    colors: string | null;
    blood_type: string | null;
    microchip_number: string | null;
    is_sterilized: boolean;
    photo_url: string | null;
    is_active: boolean;
    species: { id: string; name: string } | null;
};

export type CustomerPetsIndexPageProps = {
    pets: CustomerPet[];
};
