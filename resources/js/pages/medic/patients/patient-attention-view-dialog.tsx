import { router } from '@inertiajs/react';
import { ChevronDown, FileDown, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/custom/confirm-dialog';
import { DateDisplay } from '@/components/custom/date-display';
import { InfoItem } from '@/components/custom/info-item';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toWhatsappPhoneDigits } from '@/pages/agenda/calendar/appointment-share';
import {
    ATTENTION_CONTENT_TAB,
    ATTENTION_CONTENT_TAB_ICONS,
    ATTENTION_CONTENT_TAB_LABELS,
    attentionContentTabsListClassName,
    attentionContentTabsPanelClassName,
    attentionContentTabsTriggerClassName,
    attentionModalContentClassName,
} from '@/pages/medic/patients/attention-content-tabs';
import { AttentionDocumentTemplateCard } from '@/pages/medic/patients/attention-document-template-card';
import { AttentionExamResultCard } from '@/pages/medic/patients/attention-exam-result-card';
import {
    formatAttentionDuration,
    resolveAttentionViewFields,
} from '@/pages/medic/patients/attention-view-helpers';
import { useAttentionExamUpload } from '@/pages/medic/patients/hooks/use-attention-exam-upload';
import type {
    AttentionRequestedExam,
    AttentionSummary,
    PatientTemplateOption,
} from '@/pages/medic/patients/types';
import { destroy, download, whatsapp } from '@/routes/medic/clinical-attentions';

type PatientAttentionViewDialogProps = {
    attention: AttentionSummary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    tutorPhone?: string | null;
    templates: PatientTemplateOption[];
    canDelete: boolean;
    canUpdateExams: boolean;
    onAttentionExamsChange?: (attentionId: string, exams: AttentionRequestedExam[]) => void;
};

export function PatientAttentionViewDialog({
    attention,
    open,
    onOpenChange,
    patientId,
    tutorPhone = null,
    templates,
    canDelete,
    canUpdateExams,
    onAttentionExamsChange,
}: PatientAttentionViewDialogProps) {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const exams = attention?.requested_exams ?? [];
    const documentTemplates = attention?.document_templates ?? [];
    const canShareWhatsapp = toWhatsappPhoneDigits(tutorPhone ?? '') !== null;

    const fields = useMemo(
        () => (attention ? resolveAttentionViewFields(attention, templates) : []),
        [attention, templates],
    );

    const vitalFields = useMemo(
        () => fields.filter((f) => f.group === 'Signos vitales'),
        [fields],
    );
    const otherFields = useMemo(
        () => fields.filter((f) => f.group !== 'Signos vitales'),
        [fields],
    );

    const title = attention?.template_name?.trim() || 'Atención clínica';
    const moment = attention
        ? (attention.closed_at ?? attention.started_at ?? attention.created_at)
        : null;
    const doctorLabel = attention?.doctor_name?.trim()
        ? `Médico: ${attention.doctor_name}`
        : 'Sin médico asignado';
    const durationLabel = attention
        ? formatAttentionDuration(attention.started_at, attention.closed_at)
        : '—';

    const showExamsTab = exams.length > 0;
    const showFormatosTab = documentTemplates.length > 0;
    const showContentTabs = showExamsTab || showFormatosTab;
    const hasAnyContent = fields.length > 0 || showExamsTab || showFormatosTab;

    const { busyServiceId, uploadExam, removeExam } = useAttentionExamUpload({
        attentionId: attention?.id ?? '',
        onExamUpdated: (exam) => {
            if (!attention) {
                return;
            }

            const next = attention.requested_exams.map((item) =>
                item.id === exam.id ? exam : item,
            );
            onAttentionExamsChange?.(attention.id, next);
        },
    });

    const handleDelete = () => {
        if (!attention) {
            return;
        }

        setDeleting(true);
        router.delete(
            destroy.url(attention.id, {
                query: { back_to_patient: patientId },
            }),
            {
                preserveScroll: true,
                onFinish: () => {
                    setDeleting(false);
                    setConfirmDeleteOpen(false);
                    onOpenChange(false);
                },
            },
        );
    };

    const consultaFields = (
        <>
            {vitalFields.length > 0 ? (
                <section className="flex flex-col gap-4">
                    <h3 className="text-base font-semibold">Signos vitales</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {vitalFields.map((field) => (
                            <InfoItem key={field.field_key} label={field.label}>
                                {field.value}
                            </InfoItem>
                        ))}
                    </dl>
                </section>
            ) : null}

            {otherFields.length > 0 ? (
                <section className="flex flex-col gap-4">
                    <h3 className="text-base font-semibold">Datos clínicos</h3>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {otherFields.map((field) => (
                            <InfoItem key={field.field_key} label={field.label}>
                                <span className="text-balance whitespace-pre-wrap">
                                    {field.value}
                                </span>
                            </InfoItem>
                        ))}
                    </dl>
                </section>
            ) : null}

            {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    Esta atención no tiene valores clínicos registrados.
                </p>
            ) : null}
        </>
    );

    const examsPanel = (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {exams.map((exam) => (
                <AttentionExamResultCard
                    key={exam.id}
                    exam={exam}
                    canUpdate={canUpdateExams}
                    busy={busyServiceId === exam.id}
                    onUpload={(file) => {
                        void uploadExam(exam.id, file);
                    }}
                    onRemove={() => {
                        void removeExam(exam.id);
                    }}
                />
            ))}
        </ul>
    );

    const formatosPanel =
        attention != null ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {documentTemplates.map((template) => (
                    <AttentionDocumentTemplateCard
                        key={template.id}
                        attentionId={attention.id}
                        template={template}
                    />
                ))}
            </ul>
        ) : null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={cn(
                        attentionModalContentClassName,
                        '[&>button]:top-4 [&>button]:right-4 [&>button]:flex [&>button]:size-8 [&>button]:items-center [&>button]:justify-center',
                    )}
                >                    <DialogHeader className="shrink-0 gap-2 border-b px-6 py-4 pr-14 text-left">
                        <div className="flex items-center justify-between gap-3">
                            <DialogTitle className="min-w-0 truncate">{title}</DialogTitle>

                            <div className="flex shrink-0 items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" size="sm" variant="outline">
                                            Acciones
                                            <ChevronDown
                                                className="size-4 opacity-60"
                                                aria-hidden
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-56">
                                        <DropdownMenuItem asChild>
                                            <a
                                                href={
                                                    attention
                                                        ? download.url(attention.id)
                                                        : undefined
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileDown className="size-4" aria-hidden />
                                                Ver atención en PDF
                                            </a>
                                        </DropdownMenuItem>
                                        {canShareWhatsapp && attention ? (
                                            <DropdownMenuItem asChild>
                                                <a
                                                    href={whatsapp.url(attention.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <MessageCircle className="size-4" aria-hidden />
                                                    Enviar atención por WhatsApp
                                                </a>
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem disabled>
                                                <MessageCircle className="size-4" aria-hidden />
                                                Enviar atención por WhatsApp
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem>
                                            <Mail className="size-4" aria-hidden />
                                            Enviar atención por email
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {canDelete ? (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setConfirmDeleteOpen(true)}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="size-4" aria-hidden />
                                        Eliminar
                                    </Button>
                                ) : null}
                            </div>
                        </div>

                        <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{doctorLabel}</span>
                            <span className="text-muted-foreground/40" aria-hidden>
                                ·
                            </span>
                            <DateDisplay
                                value={moment}
                                mode="datetime"
                                className="tabular-nums"
                            />
                            <span className="text-muted-foreground/40" aria-hidden>
                                ·
                            </span>
                            <span className="tabular-nums">Duración: {durationLabel}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        {!hasAnyContent ? (
                            <p className="text-muted-foreground text-sm">
                                Esta atención no tiene valores registrados.
                            </p>
                        ) : showContentTabs ? (
                            <Tabs
                                key={attention?.id ?? 'attention'}
                                defaultValue={ATTENTION_CONTENT_TAB.consulta}
                                className="flex min-h-[28rem] flex-col gap-0"
                            >
                                <TabsList className={attentionContentTabsListClassName}>
                                    <TabsTrigger
                                        value={ATTENTION_CONTENT_TAB.consulta}
                                        className={attentionContentTabsTriggerClassName}
                                    >
                                        <ATTENTION_CONTENT_TAB_ICONS.consulta aria-hidden />
                                        {ATTENTION_CONTENT_TAB_LABELS.consulta}
                                    </TabsTrigger>
                                    {showExamsTab ? (
                                        <TabsTrigger
                                            value={ATTENTION_CONTENT_TAB.examenes}
                                            className={attentionContentTabsTriggerClassName}
                                        >
                                            <ATTENTION_CONTENT_TAB_ICONS.examenes aria-hidden />
                                            {ATTENTION_CONTENT_TAB_LABELS.examenes}
                                            <span className="text-muted-foreground tabular-nums">
                                                ({exams.length})
                                            </span>
                                        </TabsTrigger>
                                    ) : null}
                                    {showFormatosTab ? (
                                        <TabsTrigger
                                            value={ATTENTION_CONTENT_TAB.formatos}
                                            className={attentionContentTabsTriggerClassName}
                                        >
                                            <ATTENTION_CONTENT_TAB_ICONS.formatos aria-hidden />
                                            {ATTENTION_CONTENT_TAB_LABELS.formatos}
                                            <span className="text-muted-foreground tabular-nums">
                                                ({documentTemplates.length})
                                            </span>
                                        </TabsTrigger>
                                    ) : null}
                                </TabsList>

                                <TabsContent
                                    value={ATTENTION_CONTENT_TAB.consulta}
                                    className={cn(
                                        attentionContentTabsPanelClassName,
                                        'flex flex-col gap-6',
                                    )}
                                >
                                    {consultaFields}
                                </TabsContent>

                                {showExamsTab ? (
                                    <TabsContent
                                        value={ATTENTION_CONTENT_TAB.examenes}
                                        className={attentionContentTabsPanelClassName}
                                    >
                                        {examsPanel}
                                    </TabsContent>
                                ) : null}

                                {showFormatosTab ? (
                                    <TabsContent
                                        value={ATTENTION_CONTENT_TAB.formatos}
                                        className={attentionContentTabsPanelClassName}
                                    >
                                        {formatosPanel}
                                    </TabsContent>
                                ) : null}
                            </Tabs>
                        ) : (
                            <div className="flex min-h-[28rem] flex-col gap-6">
                                {consultaFields}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title="¿Eliminar la atención?"
                description="Se eliminará esta atención del historial del paciente. Esta acción no se puede deshacer."
                confirmLabel={deleting ? 'Eliminando…' : 'Eliminar atención'}
                confirmVariant="destructive"
                confirming={deleting}
                onConfirm={handleDelete}
            />
        </>
    );
}
