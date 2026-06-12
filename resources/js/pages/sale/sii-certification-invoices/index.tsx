/**
 * PROTOTYPE — SII Certificación Facturas
 * Datos hardcodeados. No conectado a backend.
 * Ruta: /sale/sii-certification-invoices/prototype
 */
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Download,
    FileText,
    FileUp,
    PackageOpen,
    RefreshCw,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { buildModuleBreadcrumbs } from '@/lib/module-breadcrumbs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FolioStatus = 'available' | 'assigned-debug' | 'sent';
type SetType = 'basico' | 'exento' | 'muestras';

interface Folio {
    number: number;
    status: FolioStatus;
    assignedSet: SetType | null;
    label: string | null;
    envioNumber: number | null;
}

interface CafRow {
    id: string;
    tipo: number;
    rangoInicio: number;
    rangoFin: number;
    folios: Folio[];
}

interface ChecklistRow {
    caso: string;
    tipo: number;
    tipoLabel: string;
    folio: number | null;
    cafOk: boolean;
    xmlOk: boolean;
    pdfOk: boolean;
    pdfCedibleOk: boolean;
}

interface EnvioHistorial {
    envioNumber: number;
    sentAt: string;
    trackIdEnvioDte: string | null;
    trackIdLibro: string | null;
}

// ---------------------------------------------------------------------------
// Hardcoded data
// ---------------------------------------------------------------------------

const NUMEROS_ATENCION = {
    basico: '4793025',
    compras: '4793027',
    exento: '4793028',
};

const TXT_TIENE_EXENTO = true;

const SET_TXT_SAMPLE = `SET BASICO
NUMERO DE ATENCION: 4793025
...contenido del set básico...

SET LIBRO DE COMPRAS
NUMERO DE ATENCION: 4793027
...contenido libro compras...

SET FACTURA EXENTA
NUMERO DE ATENCION: 4793028
...contenido factura exenta...`;

const INITIAL_CAFS: CafRow[] = [
    {
        id: 'caf-1',
        tipo: 33,
        rangoInicio: 101,
        rangoFin: 104,
        folios: [
            { number: 101, status: 'sent',           assignedSet: 'basico', label: 'caso-1', envioNumber: 1 },
            { number: 102, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-2', envioNumber: null },
            { number: 103, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-3', envioNumber: null },
            { number: 104, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-4', envioNumber: null },
        ],
    },
    {
        id: 'caf-2',
        tipo: 33,
        rangoInicio: 200,
        rangoFin: 215,
        folios: Array.from({ length: 16 }, (_, i) => ({
            number: 200 + i,
            status: 'available' as FolioStatus,
            assignedSet: 'muestras' as SetType,
            label: null,
            envioNumber: null,
        })),
    },
    {
        id: 'caf-3',
        tipo: 34,
        rangoInicio: 1,
        rangoFin: 3,
        folios: [
            { number: 1, status: 'available', assignedSet: 'exento', label: null, envioNumber: null },
            { number: 2, status: 'available', assignedSet: 'exento', label: null, envioNumber: null },
            { number: 3, status: 'available', assignedSet: 'exento', label: null, envioNumber: null },
        ],
    },
    {
        id: 'caf-4',
        tipo: 56,
        rangoInicio: 20,
        rangoFin: 21,
        folios: [
            { number: 20, status: 'available', assignedSet: 'muestras', label: null, envioNumber: null },
            { number: 21, status: 'available', assignedSet: 'muestras', label: null, envioNumber: null },
        ],
    },
    {
        id: 'caf-5',
        tipo: 61,
        rangoInicio: 51,
        rangoFin: 56,
        folios: [
            { number: 51, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-5', envioNumber: null },
            { number: 52, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-6', envioNumber: null },
            { number: 53, status: 'assigned-debug', assignedSet: 'basico', label: 'caso-7', envioNumber: null },
            { number: 54, status: 'available',      assignedSet: 'exento', label: null,     envioNumber: null },
            { number: 55, status: 'available',      assignedSet: 'exento', label: null,     envioNumber: null },
            { number: 56, status: 'available',      assignedSet: 'exento', label: null,     envioNumber: null },
        ],
    },
    {
        id: 'caf-6',
        tipo: 61,
        rangoInicio: 80,
        rangoFin: 82,
        folios: [
            { number: 80, status: 'available', assignedSet: 'muestras', label: null, envioNumber: null },
            { number: 81, status: 'available', assignedSet: 'muestras', label: null, envioNumber: null },
            { number: 82, status: 'available', assignedSet: 'muestras', label: null, envioNumber: null },
        ],
    },
];

const CHECKLIST_BASICO: ChecklistRow[] = [
    { caso: `${NUMEROS_ATENCION.basico}-1`, tipo: 33, tipoLabel: 'Factura Electrónica', folio: 101, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-2`, tipo: 33, tipoLabel: 'Factura Electrónica', folio: 102, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-3`, tipo: 33, tipoLabel: 'Factura Electrónica', folio: 103, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-4`, tipo: 33, tipoLabel: 'Factura Electrónica', folio: 104, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-5`, tipo: 61, tipoLabel: 'Nota de Crédito',     folio: 51,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-6`, tipo: 61, tipoLabel: 'Nota de Crédito',     folio: 52,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-7`, tipo: 61, tipoLabel: 'Nota de Crédito',     folio: 53,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: `${NUMEROS_ATENCION.basico}-8`, tipo: 56, tipoLabel: 'Nota de Débito',      folio: null, cafOk: false, xmlOk: false, pdfOk: false, pdfCedibleOk: false },
];

const CHECKLIST_EXENTO: ChecklistRow[] = [
    { caso: `${NUMEROS_ATENCION.exento}-1`, tipo: 34, tipoLabel: 'Factura Exenta',  folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-2`, tipo: 61, tipoLabel: 'Nota de Crédito', folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-3`, tipo: 34, tipoLabel: 'Factura Exenta',  folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-4`, tipo: 61, tipoLabel: 'Nota de Crédito', folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-5`, tipo: 56, tipoLabel: 'Nota de Débito',  folio: null, cafOk: false, xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-6`, tipo: 34, tipoLabel: 'Factura Exenta',  folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-7`, tipo: 61, tipoLabel: 'Nota de Crédito', folio: null, cafOk: true,  xmlOk: false, pdfOk: false, pdfCedibleOk: false },
    { caso: `${NUMEROS_ATENCION.exento}-8`, tipo: 56, tipoLabel: 'Nota de Débito',  folio: null, cafOk: false, xmlOk: false, pdfOk: false, pdfCedibleOk: false },
];

const CHECKLIST_MUESTRAS: ChecklistRow[] = [
    { caso: 'muestra-1',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 200, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-2',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 201, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-3',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 202, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-4',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 203, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-5',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 204, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-6',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 205, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-7',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 206, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-8',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 207, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-9',  tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 208, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-10', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 209, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-11', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 210, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-12', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 211, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-13', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 212, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-14', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 213, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-15', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 214, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-16', tipo: 33, tipoLabel: 'Factura Electrónica',    folio: 215, cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-17', tipo: 61, tipoLabel: 'Nota de Crédito',        folio: 80,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-18', tipo: 61, tipoLabel: 'Nota de Crédito',        folio: 81,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-19', tipo: 61, tipoLabel: 'Nota de Crédito',        folio: 82,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-20', tipo: 56, tipoLabel: 'Nota de Débito',         folio: 20,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
    { caso: 'muestra-21', tipo: 56, tipoLabel: 'Nota de Débito',         folio: 21,  cafOk: true,  xmlOk: true,  pdfOk: true,  pdfCedibleOk: true  },
];

const HISTORIAL_BASICO: EnvioHistorial[] = [
    { envioNumber: 1, sentAt: '2026-04-18 10:15', trackIdEnvioDte: '82934708', trackIdLibro: '82934709' },
    { envioNumber: 2, sentAt: '2026-04-20 14:32', trackIdEnvioDte: '82934710', trackIdLibro: '82934711' },
];

const HISTORIAL_COMPRAS: EnvioHistorial[] = [
    { envioNumber: 1, sentAt: '2026-04-20 15:04', trackIdEnvioDte: null, trackIdLibro: '82934715' },
];

const HISTORIAL_EXENTO: EnvioHistorial[] = [
    { envioNumber: 1, sentAt: '2026-04-21 09:47', trackIdEnvioDte: '82934720', trackIdLibro: null },
];

const HISTORIAL_MUESTRAS: EnvioHistorial[] = [
    { envioNumber: 1, sentAt: '2026-04-21 11:30', trackIdEnvioDte: '82934725', trackIdLibro: null },
];

const NECESARIOS: Record<string, Record<number, number>> = {
    basico:   { 33: 4, 61: 3, 56: 1 },
    exento:   { 34: 3, 61: 3, 56: 2 },
    muestras: { 33: 15, 61: 3, 56: 2, 34: 3 },
};

const TIPO_LABEL: Record<number, string> = {
    33: 'Factura Electrónica',
    34: 'Factura No Afecta/Exenta',
    56: 'Nota de Débito',
    61: 'Nota de Crédito',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countDisponiblesByTipo(cafs: CafRow[]): Record<number, number> {
    const counts: Record<number, number> = {};

    for (const caf of cafs) {
        counts[caf.tipo] = (counts[caf.tipo] ?? 0) + caf.folios.length;
    }

    return counts;
}

function StatusIcon({ ok }: { ok: boolean }) {
    if (ok) {
return <CheckCircle2 className="mx-auto size-4 text-emerald-600" />;
}

    return <span className="block text-center text-muted-foreground">—</span>;
}

function FolioStatusBadge({ status }: { status: FolioStatus }) {
    if (status === 'sent') {
        return (
            <Badge variant="outline" className="border-emerald-600/40 bg-emerald-600/10 text-emerald-800 dark:text-emerald-200">
                Enviado
            </Badge>
        );
    }

    if (status === 'assigned-debug') {
        return (
            <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200">
                Debug
            </Badge>
        );
    }

    return <Badge variant="outline" className="text-muted-foreground">Disponible</Badge>;
}

// ---------------------------------------------------------------------------
// CAF table (used inside the modal)
// ---------------------------------------------------------------------------

function CafTable({
    cafs,
    onDeleteCaf,
}: {
    cafs: CafRow[];
    onDeleteCaf: (id: string) => void;
}) {
    const [expandedCaf, setExpandedCaf] = useState<string | null>(null);

    if (cafs.length === 0) {
        return <p className="text-sm text-muted-foreground">Aún no hay CAFs cargados.</p>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-6" />
                        <TableHead>Tipo</TableHead>
                        <TableHead>Rango</TableHead>
                        <TableHead className="text-center">Folios</TableHead>
                        <TableHead>Asignación</TableHead>
                        <TableHead className="w-0" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cafs.map((caf) => {
                        const isExpanded = expandedCaf === caf.id;
                        const sentCount = caf.folios.filter((f) => f.status === 'sent').length;
                        const canDelete = sentCount === 0;

                        const bySet: Record<string, number> = {};

                        for (const f of caf.folios) {
                            if (f.assignedSet) {
bySet[f.assignedSet] = (bySet[f.assignedSet] ?? 0) + 1;
}
                        }

                        const assignmentSummary = Object.entries(bySet)
                            .map(([s, n]) => `${n} ${s}`)
                            .join(', ');

                        return (
                            <>
                                <TableRow
                                    key={caf.id}
                                    className="cursor-pointer"
                                    onClick={() => setExpandedCaf(isExpanded ? null : caf.id)}
                                >
                                    <TableCell>
                                        {isExpanded
                                            ? <ChevronUp className="size-3 text-muted-foreground" />
                                            : <ChevronDown className="size-3 text-muted-foreground" />}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {caf.tipo} — {TIPO_LABEL[caf.tipo]}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {caf.rangoInicio} – {caf.rangoFin}
                                    </TableCell>
                                    <TableCell className="text-center">{caf.folios.length}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {assignmentSummary || '— sin asignar'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            disabled={!canDelete}
                                            title={canDelete ? 'Eliminar CAF' : 'No se puede eliminar: tiene folios enviados'}
                                            onClick={(e) => {
 e.stopPropagation(); onDeleteCaf(caf.id); 
}}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                {isExpanded && (
                                    <TableRow key={`${caf.id}-detail`}>
                                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="pl-8">Folio</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                        <TableHead>Set</TableHead>
                                                        <TableHead>Caso</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {caf.folios.map((f) => (
                                                        <TableRow key={f.number}>
                                                            <TableCell className="pl-8 font-mono text-sm">{f.number}</TableCell>
                                                            <TableCell><FolioStatusBadge status={f.status} /></TableCell>
                                                            <TableCell className="text-sm capitalize text-muted-foreground">
                                                                {f.assignedSet ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {f.status === 'sent' && f.label ? (
                                                                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                                                        <CheckCircle2 className="size-3" />
                                                                        {f.label} (envío #{f.envioNumber})
                                                                    </span>
                                                                ) : f.label ? (
                                                                    <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400">
                                                                        <FileText className="size-3" />
                                                                        {f.label} (sin enviar)
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">— disponible</span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

function Checklist({ rows }: { rows: ChecklistRow[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Caso</TableHead>
                        <TableHead>Tipo DTE</TableHead>
                        <TableHead className="text-center">Folio</TableHead>
                        <TableHead className="text-center">CAF</TableHead>
                        <TableHead className="text-center">XML</TableHead>
                        <TableHead className="text-center">PDF</TableHead>
                        <TableHead className="text-center">PDF cedible</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.caso}>
                            <TableCell className="font-mono text-sm">{row.caso}</TableCell>
                            <TableCell className="text-sm">{row.tipo} — {row.tipoLabel}</TableCell>
                            <TableCell className="text-center font-mono text-sm">{row.folio ?? '—'}</TableCell>
                            <TableCell className="text-center">
                                {row.cafOk
                                    ? <CheckCircle2 className="mx-auto size-4 text-emerald-600" />
                                    : <XCircle className="mx-auto size-4 text-cyan-500" />}
                            </TableCell>
                            <TableCell className="text-center"><StatusIcon ok={row.xmlOk} /></TableCell>
                            <TableCell className="text-center"><StatusIcon ok={row.pdfOk} /></TableCell>
                            <TableCell className="text-center"><StatusIcon ok={row.pdfCedibleOk} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Historial de envíos
// ---------------------------------------------------------------------------

function HistorialEnvios({
    envios,
    showEnvioDte = true,
    showLibro = true,
    libroLabel = 'Libro',
}: {
    envios: EnvioHistorial[];
    showEnvioDte?: boolean;
    showLibro?: boolean;
    libroLabel?: string;
}) {
    if (envios.length === 0) {
return null;
}

    return (
        <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Historial de envíos en producción</p>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Envío #</TableHead>
                            <TableHead>Fecha</TableHead>
                            {showEnvioDte && <TableHead>Track ID EnvioDTE</TableHead>}
                            {showLibro    && <TableHead>Track ID Libro</TableHead>}
                            <TableHead className="text-right">Descargar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {envios.map((e) => (
                            <TableRow key={e.envioNumber}>
                                <TableCell className="font-medium">#{e.envioNumber}</TableCell>
                                <TableCell className="text-sm">{e.sentAt}</TableCell>
                                {showEnvioDte && <TableCell className="font-mono text-sm">{e.trackIdEnvioDte ?? '—'}</TableCell>}
                                {showLibro    && <TableCell className="font-mono text-sm">{e.trackIdLibro ?? '—'}</TableCell>}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {showEnvioDte && e.trackIdEnvioDte && (
                                            <Button variant="outline" size="sm" type="button">
                                                <Download className="size-3" /> EnvioDTE
                                            </Button>
                                        )}
                                        {showLibro && e.trackIdLibro && (
                                            <Button variant="outline" size="sm" type="button">
                                                <Download className="size-3" /> {libroLabel}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Set card — checklist + controls unified
// ---------------------------------------------------------------------------

function SetCard({
    setKey,
    title,
    description,
    checklistRows,
    debugMode,
    onToggleDebug,
    canGenerate,
    canSend,
    showSendButton = true,
    envios,
    showEnvioDte = true,
    showLibro = true,
    libroLabel = 'Libro',
    children,
}: {
    setKey: string;
    title: string;
    description?: string;
    checklistRows?: ChecklistRow[];
    debugMode: boolean;
    onToggleDebug: () => void;
    canGenerate: boolean;
    canSend: boolean;
    showSendButton?: boolean;
    envios: EnvioHistorial[];
    showEnvioDte?: boolean;
    showLibro?: boolean;
    libroLabel?: string;
    children?: React.ReactNode;
}) {
    return (
        <Card className="shadow-xs">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    {/* Left: title + description */}
                    <div className="min-w-0">
                        <CardTitle className="text-base">{title}</CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>

                    {/* Right: switch + action buttons */}
                    <div className="flex shrink-0 items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Debug</span>
                            <Switch
                                id={`mode-${setKey}`}
                                checked={!debugMode}
                                onCheckedChange={onToggleDebug}
                            />
                            <span className="text-xs text-muted-foreground">Prod</span>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!canGenerate}
                            title={canGenerate ? 'Regenera todos los archivos del set' : 'Se necesitan CAFs disponibles'}
                        >
                            <RefreshCw className="mr-1 size-3.5" />
                            Generar
                        </Button>

                        {showSendButton && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={!canSend || debugMode}
                                title={
                                    debugMode ? 'Cambia a modo producción para enviar'
                                    : !canSend ? 'Genera primero los archivos'
                                    : 'Enviar al SII'
                                }
                            >
                                <Send className="mr-1 size-3.5" />
                                Enviar al SII
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}

                {checklistRows && <Checklist rows={checklistRows} />}

                <HistorialEnvios
                    envios={envios}
                    showEnvioDte={showEnvioDte}
                    showLibro={showLibro}
                    libroLabel={libroLabel}
                />
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// CAF dialog (upload + table)
// ---------------------------------------------------------------------------

function CafDialog({
    open,
    onOpenChange,
    cafs,
    onDeleteCaf,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cafs: CafRow[];
    onDeleteCaf: (id: string) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>CAFs</DialogTitle>
                    <DialogDescription>
                        Los folios de todos los CAFs forman un pool único compartido por todos los sets.
                        Puedes subir varios CAFs de a uno.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2">
                    <Input type="file" accept=".xml,text/xml" className="flex-1" />
                    <Button type="button">
                        <FileUp className="mr-1 size-4" />
                        Subir CAF
                    </Button>
                </div>

                <CafTable cafs={cafs} onDeleteCaf={onDeleteCaf} />

                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Load set dialog
// ---------------------------------------------------------------------------

function LoadSetDialog({
    open,
    onOpenChange,
    onLoad,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoad: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cargar set de pruebas SII</DialogTitle>
                    <DialogDescription>
                        Pega el TXT que entrega el SII. El sistema detectará automáticamente los sets
                        incluidos (básico, compras, exento).
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    rows={12}
                    className="font-mono text-xs"
                    defaultValue={SET_TXT_SAMPLE}
                    placeholder="Pega aquí el TXT del SII..."
                />
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={() => {
 onLoad(); onOpenChange(false); 
}}>
                        Guardar y parsear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SiiCertificationInvoicesIndex() {
    const [txtLoaded, setTxtLoaded] = useState(true);
    const [loadSetOpen, setLoadSetOpen] = useState(false);
    const [cafOpen, setCafOpen] = useState(false);
    const [cafs, setCafs] = useState<CafRow[]>(INITIAL_CAFS);

    const certExento = txtLoaded && TXT_TIENE_EXENTO;

    const [debugBasico,   setDebugBasico]   = useState(true);
    const [debugCompras,  setDebugCompras]  = useState(true);
    const [debugExento,   setDebugExento]   = useState(true);
    const [debugMuestras, setDebugMuestras] = useState(true);

    const deleteCaf = (id: string) => setCafs((prev) => prev.filter((c) => c.id !== id));

    const disponibles = countDisponiblesByTipo(cafs);
    const coverageOk = (setKey: string) =>
        Object.entries(NECESARIOS[setKey] ?? {}).every(
            ([t, n]) => (disponibles[Number(t)] ?? 0) >= n,
        );

    return (
        <>
            <Head title="SII Certificación Facturas" />

            <LoadSetDialog
                open={loadSetOpen}
                onOpenChange={setLoadSetOpen}
                onLoad={() => setTxtLoaded(true)}
            />
            <CafDialog
                open={cafOpen}
                onOpenChange={setCafOpen}
                cafs={cafs}
                onDeleteCaf={deleteCaf}
            />

            <div className="flex w-full max-w-8xl flex-col gap-4 p-4">

                {!txtLoaded && (
                    <Alert className="border-cyan-500/40 bg-cyan-500/10">
                        <AlertTriangle className="size-4 text-cyan-600" />
                        <AlertTitle>Set de pruebas no cargado</AlertTitle>
                        <AlertDescription>
                            Carga el TXT del set de pruebas para habilitar la generación de documentos.
                        </AlertDescription>
                    </Alert>
                )}

                {/* ---- TABS + ACTIONS en una sola fila ---- */}
                <Tabs defaultValue="basico">
                    <div className="flex items-center justify-between gap-4">
                        <TabsList>
                            <TabsTrigger value="basico">
                                Básico
                                {txtLoaded && (
                                    <span className="ml-1 font-mono text-[10px] opacity-60">
                                        {NUMEROS_ATENCION.basico}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="compras">
                                Libro de Compras
                                {txtLoaded && (
                                    <span className="ml-1 font-mono text-[10px] opacity-60">
                                        {NUMEROS_ATENCION.compras}
                                    </span>
                                )}
                            </TabsTrigger>
                            {certExento && (
                                <TabsTrigger value="exento">
                                    Exento
                                    <span className="ml-1 font-mono text-[10px] opacity-60">
                                        {NUMEROS_ATENCION.exento}
                                    </span>
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="muestras">Muestras</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={txtLoaded ? 'outline' : 'default'}
                                size="sm"
                                onClick={() => setLoadSetOpen(true)}
                            >
                                <ClipboardList className="mr-1 size-4" />
                                {txtLoaded ? 'Recargar set' : 'Cargar set'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCafOpen(true)}
                            >
                                <FileUp className="mr-1 size-4" />
                                CAFs {cafs.length > 0 && <Badge className="ml-1 h-4 px-1 text-[10px]">{cafs.length}</Badge>}
                            </Button>
                            <Button type="button" variant="outline" size="sm">
                                <PackageOpen className="mr-1 size-4" />
                                Descargar ZIP
                            </Button>
                        </div>
                    </div>

                    {/* ---- BÁSICO ---- */}
                    <TabsContent value="basico" className="pt-4">
                        <SetCard
                            setKey="basico"
                            title="Set Básico"
                            description="El SII puede entregar los 4 folios de tipo 33 en 1 CAF."
                            checklistRows={CHECKLIST_BASICO}
                            debugMode={debugBasico}
                            onToggleDebug={() => setDebugBasico((v) => !v)}
                            canGenerate={coverageOk('basico')}
                            canSend={coverageOk('basico')}
                            envios={HISTORIAL_BASICO}
                            libroLabel="Libro de ventas"
                        />
                    </TabsContent>

                    {/* ---- LIBRO DE COMPRAS ---- */}
                    <TabsContent value="compras" className="pt-4">
                        <SetCard
                            setKey="compras"
                            title="Libro de Compras"
                            description="No requiere DTEs ni CAFs. Los datos del libro se parsean del TXT del SII."
                            debugMode={debugCompras}
                            onToggleDebug={() => setDebugCompras((v) => !v)}
                            canGenerate={txtLoaded}
                            canSend={txtLoaded}
                            envios={HISTORIAL_COMPRAS}
                            showEnvioDte={false}
                            libroLabel="Libro de compras"
                        >
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo Documento</TableHead>
                                            <TableHead>Folio</TableHead>
                                            <TableHead className="text-right">Monto Exento</TableHead>
                                            <TableHead className="text-right">Monto Afecto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>33 — Factura Electrónica</TableCell>
                                            <TableCell className="font-mono">1001</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                            <TableCell className="text-right">150.000</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>33 — Factura Electrónica</TableCell>
                                            <TableCell className="font-mono">1002</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                            <TableCell className="text-right">80.000</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>34 — Factura Exenta</TableCell>
                                            <TableCell className="font-mono">501</TableCell>
                                            <TableCell className="text-right">45.000</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>60 — Nota de Crédito</TableCell>
                                            <TableCell className="font-mono">201</TableCell>
                                            <TableCell className="text-right">0</TableCell>
                                            <TableCell className="text-right">-20.000</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </SetCard>
                    </TabsContent>

                    {/* ---- EXENTO ---- */}
                    {certExento && (
                        <TabsContent value="exento" className="pt-4">
                            <SetCard
                                setKey="exento"
                                title="Set Factura Exenta"
                                description="El SII puede entregar los 2 folios de tipo 56 en 2 CAFs separados."
                                checklistRows={CHECKLIST_EXENTO}
                                debugMode={debugExento}
                                onToggleDebug={() => setDebugExento((v) => !v)}
                                canGenerate={coverageOk('exento')}
                                canSend={coverageOk('exento')}
                                envios={HISTORIAL_EXENTO}
                                showLibro={false}
                            />
                        </TabsContent>
                    )}

                    {/* ---- MUESTRAS ---- */}
                    <TabsContent value="muestras" className="pt-4">
                        <SetCard
                            setKey="muestras"
                            title="Muestras Impresas"
                            description={`El SII exige mínimo 20 documentos. Se usarán todos los folios disponibles del pool.${certExento ? ' Incluye muestras de tipo 34.' : ''} Total disponible: ${cafs.reduce((acc, c) => acc + c.folios.length, 0)} folios.`}
                            checklistRows={CHECKLIST_MUESTRAS}
                            debugMode={debugMuestras}
                            onToggleDebug={() => setDebugMuestras((v) => !v)}
                            canGenerate={cafs.length > 0}
                            canSend={false}
                            showSendButton={false}
                            envios={HISTORIAL_MUESTRAS}
                            showLibro={false}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

SiiCertificationInvoicesIndex.layout = {
    breadcrumbs: buildModuleBreadcrumbs(
        'SII Certificación Facturas',
        '/sale/sii-certification-invoices/prototype',
    ),
};
