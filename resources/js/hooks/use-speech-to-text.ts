import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_LANG = 'es-CL';

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function joinTranscriptParts(...parts: string[]): string {
    return parts
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .join(' ');
}

function speechErrorMessage(code: SpeechRecognitionErrorCode): string | null {
    switch (code) {
        case 'not-allowed':
        case 'service-not-allowed':
            return 'Permite el acceso al micrófono para dictar por voz.';
        case 'audio-capture':
            return 'No se encontró un micrófono disponible.';
        case 'network':
            return 'Error de red al reconocer la voz. Intenta de nuevo.';
        case 'language-not-supported':
            return 'El idioma de dictado no está soportado en este navegador.';
        case 'aborted':
        case 'no-speech':
            return null;
        default:
            return 'No se pudo reconocer la voz. Intenta de nuevo.';
    }
}

export type UseSpeechToTextOptions = {
    /** Locale BCP 47; por defecto español de Chile. */
    lang?: string;
    getValue: () => string;
    setValue: (value: string) => void;
    onError?: (message: string) => void;
};

export type UseSpeechToTextReturn = {
    isSupported: boolean;
    isListening: boolean;
    start: () => void;
    stop: () => void;
    toggle: () => void;
};

/**
 * Dictado por voz vía Web Speech API.
 * Acumula resultados finales e intermedios sobre el valor base al iniciar.
 */
export function useSpeechToText({
    lang = DEFAULT_LANG,
    getValue,
    setValue,
    onError,
}: UseSpeechToTextOptions): UseSpeechToTextReturn {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const wantListeningRef = useRef(false);
    const baseValueRef = useRef('');
    const finalTranscriptRef = useRef('');
    const getValueRef = useRef(getValue);
    const setValueRef = useRef(setValue);
    const onErrorRef = useRef(onError);
    const langRef = useRef(lang);

    useEffect(() => {
        getValueRef.current = getValue;
        setValueRef.current = setValue;
        onErrorRef.current = onError;
        langRef.current = lang;
    }, [getValue, setValue, onError, lang]);

    const isSupported = getSpeechRecognitionConstructor() !== null;

    const stop = useCallback(() => {
        wantListeningRef.current = false;
        const recognition = recognitionRef.current;

        if (recognition) {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            recognition.abort();
            recognitionRef.current = null;
        }

        setIsListening(false);
    }, []);

    const start = useCallback(() => {
        const Recognition = getSpeechRecognitionConstructor();

        if (!Recognition) {
            onErrorRef.current?.('Tu navegador no soporta dictado por voz.');

            return;
        }

        stop();

        const recognition = new Recognition();
        recognition.lang = langRef.current;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        baseValueRef.current = getValueRef.current();
        finalTranscriptRef.current = '';
        wantListeningRef.current = true;
        recognitionRef.current = recognition;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const piece = result[0]?.transcript ?? '';

                if (result.isFinal) {
                    finalTranscriptRef.current = joinTranscriptParts(
                        finalTranscriptRef.current,
                        piece,
                    );
                } else {
                    interim = joinTranscriptParts(interim, piece);
                }
            }

            setValueRef.current(
                joinTranscriptParts(
                    baseValueRef.current,
                    finalTranscriptRef.current,
                    interim,
                ),
            );
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const message = speechErrorMessage(event.error);

            if (message) {
                onErrorRef.current?.(message);
            }

            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                wantListeningRef.current = false;
            }
        };

        recognition.onend = () => {
            if (wantListeningRef.current && recognitionRef.current === recognition) {
                try {
                    recognition.start();
                } catch {
                    wantListeningRef.current = false;
                    recognitionRef.current = null;
                    setIsListening(false);
                }

                return;
            }

            recognitionRef.current = null;
            setIsListening(false);
        };

        try {
            recognition.start();
            setIsListening(true);
        } catch {
            wantListeningRef.current = false;
            recognitionRef.current = null;
            setIsListening(false);
            onErrorRef.current?.('No se pudo iniciar el dictado por voz.');
        }
    }, [stop]);

    const toggle = useCallback(() => {
        if (isListening) {
            stop();
        } else {
            start();
        }
    }, [isListening, start, stop]);

    useEffect(() => () => stop(), [stop]);

    return {
        isSupported,
        isListening,
        start,
        stop,
        toggle,
    };
}
