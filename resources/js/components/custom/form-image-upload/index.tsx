import { ImagePlus } from 'lucide-react';
import { useId, useRef } from 'react';

import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import type { FormImageUploadProps } from './types';

export type { FormImageUploadProps } from './types';

export function FormImageUpload({
    label = undefined,
    required = false,
    error,
    helperText,
    previewUrl = null,
    previewAlt = 'Vista previa de imagen',
    emptyLabel = 'Subir imagen',
    changeLabel = 'Cambiar imagen',
    accept = 'image/jpeg,image/png,image/webp',
    disabled = false,
    processing = false,
    containerClassName,
    previewClassName,
    labelClassName,
    errorClassName,
    onFileSelect,
}: FormImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const baseId = useId();
    const inputId = baseId;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const isInteractive = !disabled && !processing;
    const triggerLabel = previewUrl ? changeLabel : emptyLabel;

    const openFilePicker = (): void => {
        if (!isInteractive) {
            return;
        }

        inputRef.current?.click();
    };

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            {label ? (
                <Label htmlFor={inputId} className={labelClassName}>
                    {label}
                    {required ? <span aria-hidden="true"> (*)</span> : null}
                </Label>
            ) : null}

            <button
                type="button"
                onClick={openFilePicker}
                disabled={!isInteractive}
                aria-label={triggerLabel}
                aria-describedby={hasError ? errorMessageId : undefined}
                aria-invalid={hasError ? true : undefined}
                className={cn(
                    'group border-input bg-background relative flex min-h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow]',
                    'hover:border-ring/60 hover:bg-accent/30',
                    'focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    hasError && 'border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                    previewClassName,
                )}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={previewAlt}
                        className="max-h-24 w-full object-contain p-2"
                    />
                ) : (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 px-4 py-6">
                        <ImagePlus className="size-8" aria-hidden="true" />
                        <span className="text-xs font-medium">{emptyLabel}</span>
                    </div>
                )}

                {processing ? (
                    <div className="bg-background/75 absolute inset-0 flex items-center justify-center backdrop-blur-[1px]">
                        <Spinner className="size-5" />
                    </div>
                ) : (
                    <div className="bg-background/70 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <span className="text-foreground text-xs font-medium">{triggerLabel}</span>
                    </div>
                )}
            </button>

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                disabled={!isInteractive}
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file && inputRef.current) {
                        onFileSelect(file, inputRef.current);
                    }
                }}
            />

            {helperText ? (
                <p className="text-muted-foreground text-sm">{helperText}</p>
            ) : null}

            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />
        </div>
    );
}
