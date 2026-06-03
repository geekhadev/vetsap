import { ImagePlus } from 'lucide-react';
import { useRef } from 'react';
import { useClinicEditor } from './clinic-editor-context';

type EditableImageProps = {
    settingKey: string;
    src: string;
    alt: string;
    className?: string;
    /** Must include a positioning class (relative or absolute inset-0) so the overlay anchors correctly. */
    wrapperClassName?: string;
};

export function EditableImage({ settingKey, src, alt, className, wrapperClassName }: EditableImageProps) {
    const { isEditing, saving, saveImage } = useClinicEditor();
    const inputRef = useRef<HTMLInputElement>(null);
    const isSaving = saving === settingKey;

    if (!isEditing) {
        return <img src={src} alt={alt} className={className} />;
    }

    const handleClick = () => inputRef.current?.click();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) void saveImage(settingKey, file);
        e.target.value = '';
    };

    return (
        // Note: no hardcoded `relative` here — callers must include positioning in wrapperClassName
        // so that `absolute inset-0` in wrapperClassName isn't overridden by a later `.relative` rule.
        <div
            className={`group cursor-pointer ${wrapperClassName ?? 'relative'}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            aria-label={`Cambiar imagen: ${alt}`}
        >
            <img src={src} alt={alt} className={className} />
            <div className="absolute inset-0 flex items-center justify-center rounded bg-black/40 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {isSaving ? (
                    <span>Guardando…</span>
                ) : (
                    <span className="flex items-center gap-1.5">
                        <ImagePlus size={16} />
                        Cambiar imagen
                    </span>
                )}
            </div>
            <div className="absolute inset-0 ring-2 ring-cyan-300 ring-inset rounded pointer-events-none" />
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}

type EditableImageSlotProps = {
    settingKey: string;
    src: string | null;
    alt: string;
    className?: string;
    wrapperClassName?: string;
};

/** Renders the image if src is set, or an upload placeholder when in edit mode. */
export function EditableImageSlot({ settingKey, src, alt, className, wrapperClassName }: EditableImageSlotProps) {
    const { isEditing, saving, saveImage } = useClinicEditor();
    const inputRef = useRef<HTMLInputElement>(null);
    const isSaving = saving === settingKey;

    if (!isEditing && !src) return null;

    if (!src) {
        const handleClick = () => inputRef.current?.click();
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) void saveImage(settingKey, file);
            e.target.value = '';
        };

        return (
            <div
                className={`group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-cyan-300 bg-cyan-50 min-h-[200px] ${wrapperClassName ?? ''}`}
                onClick={handleClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleClick()}
                aria-label="Agregar imagen a la galería"
            >
                <span className="flex flex-col items-center gap-1 text-sm text-cyan-600">
                    <ImagePlus size={24} />
                    {isSaving ? 'Subiendo…' : 'Agregar foto'}
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleChange}
                />
            </div>
        );
    }

    return (
        <EditableImage
            settingKey={settingKey}
            src={src}
            alt={alt}
            className={className}
            wrapperClassName={wrapperClassName}
        />
    );
}
