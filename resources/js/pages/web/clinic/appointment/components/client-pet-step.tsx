import { Loader2, PawPrint, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    CLINIC_BOOKING_ACCENT_ICON,
    CLINIC_BOOKING_HOVER,
    CLINIC_BOOKING_INPUT,
    CLINIC_BOOKING_OUTLINE_BUTTON,
    CLINIC_BOOKING_SELECTION_ROUNDED,
    CLINIC_BOOKING_SELECT_TRIGGER,
    CLINIC_BOOKING_SELECTED_ACCENT_ICON,
    CLINIC_BOOKING_SELECTED_RING,
    CLINIC_BOOKING_UNSELECTED,
} from '../clinic-booking-theme';
import type { BookingClient, BookingSpecies, PetSelection } from '../types';

type ClientPetStepProps = {
    phone: string;
    client: BookingClient | null;
    clientLookupDone: boolean;
    petSelection: PetSelection;
    clientName: string;
    clientEmail: string;
    species: BookingSpecies[];
    isLookingUp: boolean;
    lookupError: string | null;
    submitError: string | null;
    onPhoneChange: (phone: string) => void;
    onLookup: () => void;
    onSelectExistingPet: (petId: string) => void;
    onSelectNewPet: () => void;
    onPetSelectionChange: (updates: Partial<PetSelection>) => void;
    onClientFieldsChange: (fields: { clientName?: string; clientEmail?: string }) => void;
};

export function ClientPetStep({
    phone,
    client,
    clientLookupDone,
    petSelection,
    clientName,
    clientEmail,
    species,
    isLookingUp,
    lookupError,
    submitError,
    onPhoneChange,
    onLookup,
    onSelectExistingPet,
    onSelectNewPet,
    onPetSelectionChange,
    onClientFieldsChange,
}: ClientPetStepProps) {
    const showNewPetFields = !client || petSelection.mode === 'new';
    const showClientFields = clientLookupDone && !client;

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="booking-phone">Teléfono (identifica si ya eres cliente)</Label>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Phone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            id="booking-phone"
                            type="tel"
                            placeholder="+56 9 1234 5678"
                            value={phone}
                            onChange={(event) => onPhoneChange(event.target.value)}
                            className={cn(CLINIC_BOOKING_INPUT, 'pl-9')}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className={CLINIC_BOOKING_OUTLINE_BUTTON}
                        onClick={onLookup}
                        disabled={isLookingUp}
                    >
                        {isLookingUp ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Search className="size-4" />
                        )}
                        Buscar
                    </Button>
                </div>
                {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
            </div>

            {clientLookupDone && client && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
                    <p className="font-medium text-green-800">
                        ¡Hola, {client.name}! Te reconocimos por tu teléfono.
                    </p>
                    <p className="text-xs text-green-700">Selecciona una mascota o agenda con otra.</p>
                </div>
            )}

            {clientLookupDone && !client && (
                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600">
                    No encontramos tu teléfono. Completa tus datos para agendar.
                </div>
            )}

            {client && client.pets.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">¿Con qué mascota?</p>
                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                        {client.pets.map((pet) => {
                            const isSelected =
                                petSelection.mode === 'existing' && petSelection.petId === pet.id;

                            return (
                                <button
                                    key={pet.id}
                                    type="button"
                                    onClick={() => onSelectExistingPet(pet.id)}
                                    className={cn(
                                        'flex w-[9.5rem] shrink-0 items-center gap-3 border p-3 text-left transition-all',
                                        CLINIC_BOOKING_SELECTION_ROUNDED,
                                        isSelected
                                            ? CLINIC_BOOKING_SELECTED_RING
                                            : cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER),
                                    )}
                                >
                                    <PawPrint
                                        className={cn(
                                            'size-5 shrink-0',
                                            isSelected
                                                ? CLINIC_BOOKING_SELECTED_ACCENT_ICON
                                                : CLINIC_BOOKING_ACCENT_ICON,
                                        )}
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-gray-900">{pet.name}</p>
                                        <p className="truncate text-xs text-gray-600">
                                            {pet.species}
                                            {pet.breed ? ` · ${pet.breed}` : ''}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={onSelectNewPet}
                            className={cn(
                                'flex w-[9.5rem] shrink-0 items-center gap-3 border p-3 text-left transition-all',
                                CLINIC_BOOKING_SELECTION_ROUNDED,
                                petSelection.mode === 'new'
                                    ? CLINIC_BOOKING_SELECTED_RING
                                    : cn(CLINIC_BOOKING_UNSELECTED, CLINIC_BOOKING_HOVER),
                            )}
                        >
                            <PawPrint
                                className={cn(
                                    'size-5 shrink-0',
                                    petSelection.mode === 'new'
                                        ? CLINIC_BOOKING_SELECTED_ACCENT_ICON
                                        : CLINIC_BOOKING_ACCENT_ICON,
                                )}
                            />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900">Otra mascota</p>
                                <p className="text-xs text-gray-600">Agregar nueva</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {showNewPetFields && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Label htmlFor="pet-species">Especie</Label>
                        <Select
                            value={petSelection.speciesId || undefined}
                            onValueChange={(value) => {
                                const selectedSpecies = species.find((item) => item.id === value);

                                onPetSelectionChange({
                                    speciesId: value,
                                    petSpecies: selectedSpecies?.name ?? '',
                                });
                            }}
                        >
                            <SelectTrigger id="pet-species" className={CLINIC_BOOKING_SELECT_TRIGGER}>
                                <SelectValue placeholder="Selecciona especie" />
                            </SelectTrigger>
                            <SelectContent>
                                {species.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <Label htmlFor="pet-name">Nombre de la mascota</Label>
                        <Input
                            id="pet-name"
                            value={petSelection.petName}
                            onChange={(event) => onPetSelectionChange({ petName: event.target.value })}
                            placeholder="Ej. Luna"
                            className={CLINIC_BOOKING_INPUT}
                        />
                    </div>
                </div>
            )}

            {showClientFields && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Tu nombre</Label>
                        <Input
                            id="client-name"
                            value={clientName}
                            onChange={(event) => onClientFieldsChange({ clientName: event.target.value })}
                            placeholder="Nombre y apellido"
                            className={CLINIC_BOOKING_INPUT}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email">Correo</Label>
                        <Input
                            id="client-email"
                            type="email"
                            value={clientEmail}
                            onChange={(event) => onClientFieldsChange({ clientEmail: event.target.value })}
                            placeholder="correo@ejemplo.cl"
                            className={CLINIC_BOOKING_INPUT}
                        />
                    </div>
                </div>
            )}

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
    );
}
