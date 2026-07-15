import {
    Cake,
    CircuitBoard,
    Droplets,
    IdCard,
    Mail,
    MapPin,
    Palette,
    PawPrint,
    Pencil,
    Phone,
    Scale,
    Scissors,
    UserRound,
} from 'lucide-react';
import { DocumentBadge } from '@/components/custom/document-badge';
import { InfoItem } from '@/components/custom/info-item';
import { SplitSettingsAside } from '@/components/custom/split-settings-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APPOINTMENT_STATUS_COLOR_BADGE_CLASS } from '@/lib/appointment-status-colors';
import {
    DISPLAY_EMPTY,
    formatBirthDate,
    formatOptionalText,
    formatOptionalWithSuffix,
} from '@/lib/format-display';
import { cn } from '@/lib/utils';
import { formatSex, formatSterilized } from '@/pages/medic/patients/types';
import type { Patient, PatientSexValue } from '@/pages/medic/patients/types';

type PatientEditSidebarProps = {
    patient: Patient;
    onEdit: () => void;
};

type PatientPhotoPillProps = {
    label: string;
    value: string;
    colorClassName: string;
};

const PHOTO_PILL_SEX_CLASS: Record<'male' | 'female', string> = {
    male: APPOINTMENT_STATUS_COLOR_BADGE_CLASS.green,
    female: APPOINTMENT_STATUS_COLOR_BADGE_CLASS.pink,
};

function PatientPhotoPill({ label, value, colorClassName }: PatientPhotoPillProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'max-w-full rounded-full px-2.5 py-0.5 text-xs font-normal shadow-xs',
                colorClassName,
            )}
        >
            <span className="truncate">
                <span className="font-medium">{label}:</span> {value}
            </span>
        </Badge>
    );
}

function isKnownPatientSex(sex: PatientSexValue): sex is 'male' | 'female' {
    return sex === 'male' || sex === 'female';
}

export function PatientEditSidebar({ patient, onEdit }: PatientEditSidebarProps) {
    const customer = patient.customer;
    const speciesName = patient.species?.name?.trim() ?? '';
    const recordNumber = patient.record_number?.trim() ?? '';
    const hasKnownSex = isKnownPatientSex(patient.sex);

    return (
        <SplitSettingsAside>
            <Card className="gap-0 overflow-hidden py-0 shadow-xs">
                <div className="relative">
                    <div
                        className={cn(
                            'bg-muted flex aspect-4/3 w-full items-center justify-center',
                            'dark:bg-muted/80',
                        )}
                        aria-hidden
                    >
                        <div className="text-muted-foreground/70 flex flex-col items-center gap-2">
                            <PawPrint className="size-12" strokeWidth={1.25} />
                            <span className="text-xs font-medium tracking-wide uppercase">
                                Foto del paciente
                            </span>
                        </div>
                    </div>

                    <h1
                        className={cn(
                            'absolute top-2.5 left-2.5 max-w-[calc(100%-3.5rem)] truncate',
                            'rounded-md bg-background/95 px-2.5 py-1 text-base font-semibold tracking-tight shadow-xs',
                        )}
                    >
                        {patient.name}
                    </h1>

                    <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className={cn(
                            'absolute top-2.5 right-2.5 size-8 rounded-full shadow-sm',
                            'bg-background/95 hover:bg-background',
                        )}
                        title="Editar paciente"
                        onClick={onEdit}
                    >
                        <Pencil className="size-4" aria-hidden />
                        <span className="sr-only">Editar paciente</span>
                    </Button>

                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-2.5">
                        {speciesName !== '' ? (
                            <PatientPhotoPill
                                label="Especie"
                                value={speciesName}
                                colorClassName={APPOINTMENT_STATUS_COLOR_BADGE_CLASS.blue}
                            />
                        ) : null}
                        {hasKnownSex ? (
                            <PatientPhotoPill
                                label="Sexo"
                                value={formatSex(patient.sex)}
                                colorClassName={PHOTO_PILL_SEX_CLASS[patient.sex]}
                            />
                        ) : null}
                        {recordNumber !== '' ? (
                            <PatientPhotoPill
                                label="Ficha"
                                value={recordNumber}
                                colorClassName={APPOINTMENT_STATUS_COLOR_BADGE_CLASS.slate}
                            />
                        ) : null}
                    </div>
                </div>

                <CardContent className="p-0">
                    <Tabs defaultValue="medicos" className="gap-0">
                        <TabsList
                            className={cn(
                                'h-auto w-full rounded-none border-b bg-transparent p-0',
                            )}
                        >
                            <TabsTrigger
                                value="medicos"
                                className={cn(
                                    'flex-1 rounded-none border-0 border-b-2 border-transparent',
                                    'bg-transparent px-3 py-3 text-sm shadow-none',
                                    'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                                    'data-[state=active]:text-primary data-[state=active]:shadow-none',
                                    'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent',
                                )}
                            >
                                Datos médicos
                            </TabsTrigger>
                            <TabsTrigger
                                value="tutor"
                                className={cn(
                                    'flex-1 rounded-none border-0 border-b-2 border-transparent',
                                    'bg-transparent px-3 py-3 text-sm shadow-none',
                                    'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                                    'data-[state=active]:text-primary data-[state=active]:shadow-none',
                                    'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent',
                                )}
                            >
                                Tutor
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="medicos" className="mt-0 p-4 outline-none">
                            <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
                                <InfoItem icon={PawPrint} label="Raza">
                                    {formatOptionalText(patient.breed)}
                                </InfoItem>
                                <InfoItem icon={Cake} label="Nacimiento">
                                    {formatBirthDate(patient.birth_date)}
                                </InfoItem>
                                <InfoItem icon={Scale} label="Peso">
                                    {formatOptionalWithSuffix(patient.weight_kg, 'kg')}
                                </InfoItem>
                                <InfoItem icon={Palette} label="Colores">
                                    {formatOptionalText(patient.colors)}
                                </InfoItem>
                                <InfoItem icon={Droplets} label="Tipo sanguíneo">
                                    {formatOptionalText(patient.blood_type)}
                                </InfoItem>
                                <InfoItem icon={CircuitBoard} label="Chip">
                                    {formatOptionalText(patient.microchip_number)}
                                </InfoItem>
                                <InfoItem icon={Scissors} label="Esterilizado">
                                    {formatSterilized(patient.is_sterilized)}
                                </InfoItem>
                            </dl>
                        </TabsContent>

                        <TabsContent value="tutor" className="mt-0 p-4 outline-none">
                            <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
                                <InfoItem icon={UserRound} label="Nombre">
                                    {formatOptionalText(customer?.name)}
                                </InfoItem>
                                <InfoItem icon={IdCard} label="Documento">
                                    {customer ? (
                                        <DocumentBadge
                                            documentType={customer.document_type}
                                            documentNumber={customer.document_number}
                                        />
                                    ) : (
                                        DISPLAY_EMPTY
                                    )}
                                </InfoItem>
                                <InfoItem icon={Phone} label="Teléfono">
                                    {formatOptionalText(customer?.phone)}
                                </InfoItem>
                                <InfoItem
                                    icon={Mail}
                                    label="Correo"
                                    className="col-span-2"
                                >
                                    {formatOptionalText(customer?.email)}
                                </InfoItem>
                                <InfoItem
                                    icon={MapPin}
                                    label="Dirección"
                                    className="col-span-2"
                                >
                                    {formatOptionalText(customer?.address)}
                                </InfoItem>
                            </dl>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </SplitSettingsAside>
    );
}
