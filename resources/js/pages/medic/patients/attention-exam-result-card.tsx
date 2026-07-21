import { Check } from 'lucide-react';
import { FormFileDropzone } from '@/components/custom/form-file-dropzone';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AttentionRequestedExam } from '@/pages/medic/patients/types';

type AttentionExamResultCardProps = {
    exam: AttentionRequestedExam;
    canUpdate: boolean;
    busy?: boolean;
    onUpload?: (file: File) => void;
    onRemove?: () => void;
};

export function AttentionExamResultCard({
    exam,
    canUpdate,
    busy = false,
    onUpload,
    onRemove,
}: AttentionExamResultCardProps) {
    return (
        <li className="flex flex-col rounded-xl border p-3 shadow-xs">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="min-w-0 text-sm leading-snug font-medium text-balance">{exam.name}</p>
                <Badge
                    variant="outline"
                    className={cn(
                        'gap-1 rounded-full font-normal',
                        exam.is_uploaded
                            ? 'border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200'
                            : 'border-amber-200/90 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200',
                    )}
                >
                    {exam.is_uploaded ? (
                        <>
                            <Check className="size-3" aria-hidden />
                            Cargado
                        </>
                    ) : (
                        'Pendiente'
                    )}
                </Badge>
            </div>

            {canUpdate || exam.is_uploaded ? (
                <div className="mt-3">
                    <FormFileDropzone
                        emptyLabel="Cargar resultado"
                        changeLabel="Cambiar"
                        viewLabel="Ver"
                        fileName={exam.file_name}
                        fileUrl={exam.file_url}
                        previewUrl={
                            exam.mime_type?.startsWith('image/') ? exam.file_url : null
                        }
                        canChange={canUpdate}
                        canRemove={canUpdate}
                        disabled={busy || !canUpdate}
                        processing={busy}
                        helperText={
                            canUpdate
                                ? 'PDF o imagen (JPG, PNG, WEBP) · máx. 10 MB'
                                : undefined
                        }
                        onFileSelect={
                            canUpdate && onUpload
                                ? (file) => {
                                      onUpload(file);
                                  }
                                : undefined
                        }
                        onRemove={canUpdate ? onRemove : undefined}
                    />
                </div>
            ) : null}
        </li>
    );
}
