import { Head, useForm } from '@inertiajs/react';
import { Download, FileUp } from 'lucide-react';
import { DateDisplay } from '@/components/custom/date-display';
import { SiiIntegrationIncompleteAlert } from '@/components/custom/sii-integration-incomplete-alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { CertificationSiiTicketsIndexPageProps } from '@/pages/sale/certification-sii-tickets/types';
import { dashboard } from '@/routes';
import {
    download,
    index as certificationIndex,
    store as certificationStore,
} from '@/routes/sale/sii-certification-tickets';

export default function CertificationSiiTicketsIndex({
    sii_ready,
    tickets,
}: CertificationSiiTicketsIndexPageProps) {
    const form = useForm<{ caf: File | null }>({ caf: null });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.data.caf) {
            return;
        }

        form.post(certificationStore.url(), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="SII Certificación Boletas" />
            <div className="flex w-full max-w-8xl flex-col gap-6 p-4 text-left">
                {!sii_ready ? <SiiIntegrationIncompleteAlert /> : null}

                {sii_ready ? (
                    <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
                            <Card className="shadow-xs flex h-full min-h-0 flex-col text-left">
                                <CardHeader>
                                    <CardTitle>Paso 1 — Trámites en el portal SII</CardTitle>
                                    <CardDescription>
                                        Completa estos pasos en el sitio del SII.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <p className="font-medium">1.1 Cambiar el email de intercambio</p>
                                        <p className="text-muted-foreground">
                                            Actualiza el correo de intercambio asociado a tu empresa
                                            en el SII para recibir acuses y notificaciones.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">1.2 Solicitar un set de pruebas</p>
                                        <p className="text-muted-foreground">
                                            Solicita el set de pruebas de boleta electrónica en el
                                            módulo de certificación del SII.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">1.3 Solicitar postulación</p>
                                        <p className="text-muted-foreground">
                                            Envía la postulación a certificación de boletas según
                                            las indicaciones del SII.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xs flex h-full min-h-0 flex-col text-left">
                                <CardHeader>
                                    <CardTitle>Paso 2 — Cargar CAF y generar XML</CardTitle>
                                    <CardDescription>
                                        Sube el archivo XML del CAF autorizado por el SII.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4" onSubmit={submit}>
                                        <div className="space-y-2">
                                            <Label htmlFor="caf">Archivo CAF (XML)</Label>
                                            <Input
                                                id="caf"
                                                name="caf"
                                                type="file"
                                                accept=".xml,text/xml,application/xml"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    form.setData('caf', file);
                                                }}
                                            />
                                            {form.errors.caf ? (
                                                <p className="text-destructive text-sm">
                                                    {form.errors.caf}
                                                </p>
                                            ) : null}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={form.processing || !form.data.caf}
                                        >
                                            <FileUp className="mr-2 size-4" />
                                            Cargar y generar certificación
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="shadow-xs flex h-full min-h-0 flex-col text-left">
                                <CardHeader>
                                    <CardTitle>Paso 3 — Seguimiento en el SII</CardTitle>
                                    <CardDescription>
                                        Sigue estos pasos en el portal del SII.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <p className="font-medium">3.1 Consultar los Track ID en el SII</p>
                                        <p className="text-muted-foreground">
                                            Verifica en el portal que los envíos queden aceptados y
                                            anota los Track ID.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">3.2 Solicitar revisión al SII</p>
                                        <p className="text-muted-foreground">
                                            Solicita la revisión de la certificación cuando el SII
                                            lo indique.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">3.3 Declaración de cumplimiento</p>
                                        <p className="text-muted-foreground">
                                            Realiza la declaración de cumplimiento según el flujo del
                                            SII.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-lg font-medium">Historial</h2>
                            <div className="rounded-md border shadow-xs">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>N° certificación</TableHead>
                                            <TableHead>Fecha y hora</TableHead>
                                            <TableHead className="text-right">CAF</TableHead>
                                            <TableHead className="text-right">EnvioDTE</TableHead>
                                            <TableHead className="text-right">
                                                ConsumoFolios
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-muted-foreground text-left text-sm"
                                                >
                                                    Aún no hay certificaciones registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            tickets.map((t) => (
                                                <TableRow key={t.id}>
                                                    <TableCell className="font-medium">
                                                        {t.number}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        <DateDisplay
                                                            value={t.created_at}
                                                            mode="datetime"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={download.url({
                                                                    certificationSiiTicket: {
                                                                        id: t.id,
                                                                    },
                                                                    kind: 'caf',
                                                                })}
                                                            >
                                                                <Download className="size-4" />
                                                            </a>
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={download.url({
                                                                    certificationSiiTicket: {
                                                                        id: t.id,
                                                                    },
                                                                    kind: 'envio_dte',
                                                                })}
                                                            >
                                                                <Download className="size-4" />
                                                            </a>
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a
                                                                href={download.url({
                                                                    certificationSiiTicket: {
                                                                        id: t.id,
                                                                    },
                                                                    kind: 'consumo_folios',
                                                                })}
                                                            >
                                                                <Download className="size-4" />
                                                            </a>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </>
    );
}

CertificationSiiTicketsIndex.layout = {
    breadcrumbs: [
        { title: 'Panel', href: dashboard() },
        { title: 'SII Certificación Boletas', href: certificationIndex() },
    ],
};
