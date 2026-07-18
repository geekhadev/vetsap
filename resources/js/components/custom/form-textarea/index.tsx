import { Mic, MicOff } from 'lucide-react';
import { useId, useRef   } from 'react';
import type {ChangeEvent, RefObject} from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { cn } from '@/lib/utils';

import type { FormTextareaProps } from './types';

export type { FormTextareaProps } from './types';

function dispatchValueChange(
    onChange: ((event: ChangeEvent<HTMLTextAreaElement>) => void) | undefined,
    textarea: HTMLTextAreaElement,
    nextValue: string,
): void {
    textarea.value = nextValue;

    if (onChange) {
        const event = {
            target: textarea,
            currentTarget: textarea,
        } as ChangeEvent<HTMLTextAreaElement>;
        onChange(event);

        return;
    }

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

type SpeechDictationButtonProps = {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    value: string | number | readonly string[] | undefined;
    onChange: ((event: ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
    lang: string;
};

function SpeechDictationButton({
    textareaRef,
    value,
    onChange,
    lang,
}: SpeechDictationButtonProps) {
    const { isSupported, isListening, toggle } = useSpeechToText({
        lang,
        getValue: () => {
            if (typeof value === 'string') {
                return value;
            }

            return textareaRef.current?.value ?? '';
        },
        setValue: (nextValue) => {
            const el = textareaRef.current;

            if (!el) {
                return;
            }

            dispatchValueChange(onChange, el, nextValue);
        },
        onError: (message) => {
            toast.error(message);
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'absolute end-1 top-1 size-8 rounded-md',
                isListening
                    ? 'text-destructive hover:text-destructive animate-pulse'
                    : 'text-muted-foreground hover:text-foreground',
            )}
            data-listening={isListening ? 'true' : 'false'}
            aria-pressed={isListening}
            aria-label={isListening ? 'Detener dictado por voz' : 'Dictar por voz'}
            title={isListening ? 'Detener dictado' : 'Dictar por voz'}
            onClick={toggle}
        >
            {isListening ? (
                <MicOff className="size-4" aria-hidden />
            ) : (
                <Mic className="size-4" aria-hidden />
            )}
        </Button>
    );
}

export function FormTextarea({
    placeholder = 'Ingrese un valor',
    label = 'Ingrese un valor',
    required = false,
    error,
    containerClassName,
    textareaClassName,
    labelClassName,
    errorClassName,
    textareaProps = {},
    speechToText = false,
    speechLang = 'es-CL',
}: FormTextareaProps) {
    const baseId = useId();
    const textareaId = textareaProps.id ?? baseId;
    const errorMessageId = `${baseId}-error`;
    const trimmedError = error?.trim() ?? '';
    const hasError = trimmedError.length > 0;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const describedByParts = [
        textareaProps['aria-describedby'],
        hasError ? errorMessageId : undefined,
    ].filter(Boolean) as string[];
    const ariaDescribedBy =
        describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const { className: textareaPropsClassName, ...restTextareaProps } = textareaProps;

    return (
        <div className={cn('grid w-full gap-2', containerClassName)}>
            <Label htmlFor={textareaId} className={labelClassName}>
                {label}
                {required ? <span aria-hidden="true"> (*)</span> : null}
            </Label>
            <div className={cn('relative', speechToText && 'group/speech')}>
                <Textarea
                    {...restTextareaProps}
                    ref={textareaRef}
                    id={textareaId}
                    placeholder={placeholder}
                    required={required}
                    className={cn(
                        speechToText &&
                            'pe-10 group-has-[[data-listening=true]]/speech:border-destructive group-has-[[data-listening=true]]/speech:focus-visible:border-destructive group-has-[[data-listening=true]]/speech:focus-visible:ring-destructive/30',
                        textareaPropsClassName,
                        textareaClassName,
                    )}
                    aria-invalid={hasError ? true : restTextareaProps['aria-invalid']}
                    aria-describedby={ariaDescribedBy}
                />
                {speechToText ? (
                    <SpeechDictationButton
                        textareaRef={textareaRef}
                        value={textareaProps.value}
                        onChange={textareaProps.onChange}
                        lang={speechLang}
                    />
                ) : null}
            </div>
            <InputError
                id={errorMessageId}
                message={hasError ? trimmedError : undefined}
                className={errorClassName}
            />
        </div>
    );
}
