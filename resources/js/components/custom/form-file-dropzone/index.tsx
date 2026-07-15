import { Eye, FileText, ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import type { FormFileDropzoneProps } from './types';

export type { FormFileDropzoneProps } from './types';

function isImageUrl(url: string | null | undefined, fileName?: string | null): boolean {
    if (url) {
        const lower = url.toLowerCase();

        if (
            lower.includes('.jpg') ||
            lower.includes('.jpeg') ||
            lower.includes('.png') ||
            lower.includes('.webp') ||
            lower.includes('image/')
        ) {
            return true;
        }
    }

    const name = fileName?.toLowerCase() ?? '';

    return (
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png') ||
        name.endsWith('.webp')
    );
}

export function FormFileDropzone({
    label,
    required = false,
    error,
    helperText,
    accept = '.pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp',
    emptyLabel = 'Seleccionar archivo',
    changeLabel = 'Cambiar',
    viewLabel = 'Ver',
    fileName = null,
    fileUrl = null,
    previewUrl = null,
    disabled = false,
    processing = false,
    canChange = true,
    canRemove = false,
    containerClassName,
    labelClassName,
    errorClassName,
    onFileSelect,
    onRemove,
}: FormFileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const baseId = useId();
    const inputId = baseId;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const isInteractive = !disabled && !processing;
    const hasFile = Boolean(fileName || previewUrl || fileUrl);
    const [isDragging, setIsDragging] = useState(false);

    const openFilePicker = (): void => {
        if (!isInteractive || !canChange) {
            return;
        }

        inputRef.current?.click();
    };

    const handleFiles = (files: FileList | null): void => {
        const file = files?.[0];

        if (!file || !inputRef.current || !onFileSelect) {
            return;
        }

        onFileSelect(file, inputRef.current);
    };

    const showImagePreview =
        Boolean(previewUrl || fileUrl) && isImageUrl(previewUrl ?? fileUrl, fileName);
    const imageSrc = previewUrl ?? (showImagePreview ? fileUrl : null);

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={inputId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}

            {hasFile ? (
                <div className={cn('relative', disabled && 'opacity-60')}>
                    <div
                        className={cn(
                            'group/preview border-input bg-muted/20 relative flex min-h-28 w-full flex-col items-center justify-center overflow-hidden rounded-xl border px-3 py-4 text-center shadow-xs',
                            hasError &&
                                'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                        )}
                    >
                        {showImagePreview && imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={fileName ?? 'Vista previa'}
                                className="mb-2 max-h-16 w-full object-contain"
                            />
                        ) : (
                            <FileText className="text-primary mb-2 size-7" aria-hidden />
                        )}

                        {fileName ? (
                            <span className="text-muted-foreground max-w-full truncate text-[11px]">
                                {fileName}
                            </span>
                        ) : null}

                        <div
                            className={cn(
                                'absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/80 px-3 opacity-0 backdrop-blur-[1px] transition-opacity pointer-events-none',
                                'group-hover/preview:pointer-events-auto group-hover/preview:opacity-100',
                                'group-focus-within/preview:pointer-events-auto group-focus-within/preview:opacity-100',
                            )}
                        >
                            {fileUrl ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                    asChild
                                >
                                    <a href={fileUrl} target="_blank" rel="noreferrer">
                                        <Eye className="size-4" aria-hidden />
                                        {viewLabel}
                                    </a>
                                </Button>
                            ) : null}

                            {canChange ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/70"
                                    disabled={!isInteractive}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openFilePicker();
                                    }}
                                >
                                    <RefreshCw className="size-4" aria-hidden />
                                    {changeLabel}
                                </Button>
                            ) : null}
                        </div>

                        {processing ? (
                            <div className="bg-background/75 absolute inset-0 z-30 flex items-center justify-center backdrop-blur-[1px]">
                                <Spinner className="size-5" />
                            </div>
                        ) : null}
                    </div>

                    {canRemove && onRemove ? (
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 z-20 size-7 cursor-pointer rounded-full shadow-sm hover:bg-destructive/90"
                            disabled={!isInteractive}
                            title="Quitar archivo"
                            aria-label="Quitar archivo"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onRemove();
                            }}
                        >
                            <Trash2 className="size-3.5" aria-hidden />
                        </Button>
                    ) : null}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={!isInteractive || !canChange}
                    aria-label={emptyLabel}
                    aria-describedby={hasError ? errorMessageId : undefined}
                    aria-invalid={hasError ? true : undefined}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (isInteractive && canChange) {
                            setIsDragging(true);
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (isInteractive && canChange) {
                            setIsDragging(true);
                        }
                    }}
                    onDragLeave={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsDragging(false);

                        if (!isInteractive || !canChange) {
                            return;
                        }

                        handleFiles(event.dataTransfer.files);
                    }}
                    className={cn(
                        'group border-input bg-muted/20 relative flex min-h-28 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed px-3 py-4 text-center shadow-xs transition-[color,box-shadow,background-color,border-color]',
                        'hover:border-primary/40 hover:bg-accent/40',
                        'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                        'disabled:cursor-not-allowed disabled:opacity-60',
                        isDragging && 'border-primary bg-primary/5',
                        hasError &&
                            'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                    )}
                >
                    <div className="bg-background mb-2 flex size-10 items-center justify-center rounded-full border shadow-xs">
                        {accept.includes('image') && !accept.includes('pdf') ? (
                            <ImagePlus className="text-muted-foreground size-5" aria-hidden />
                        ) : (
                            <Upload className="text-muted-foreground size-5" aria-hidden />
                        )}
                    </div>

                    <span className="text-foreground text-xs font-medium">{emptyLabel}</span>
                    <span className="text-muted-foreground mt-1 text-[11px]">
                        Arrastra aquí o haz clic
                    </span>

                    {processing ? (
                        <div className="bg-background/75 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                            <Spinner className="size-5" />
                        </div>
                    ) : null}
                </button>
            )}

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                disabled={!isInteractive || !canChange}
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    handleFiles(event.target.files);

                    if (event.target) {
                        event.target.value = '';
                    }
                }}
            />

            {helperText ? (
                <p className="text-muted-foreground text-xs">{helperText}</p>
            ) : null}

            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />
        </div>
    );
}
