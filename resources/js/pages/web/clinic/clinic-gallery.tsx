import { useClinicEditor } from './clinic-editor-context';
import { EditableImage } from './editable-image';
import { EditableText } from './editable-text';
import type { ClinicSettings } from './types';

const galleryRotations = [-2, -1, 0, 1, 2, 1] as const;

const GALLERY_SLOTS = [1, 2, 3, 4, 5, 6].map((i) => ({
    key: `gallery_image_${i}`,
    placeholder: `https://placehold.co/600x400/e0f7fa/00838f?text=Foto+${i}`,
}));

type ClinicGalleryProps = {
    settings: ClinicSettings;
};

export function ClinicGallery({ settings }: ClinicGalleryProps) {
    const { isEditing } = useClinicEditor();

    const slots = GALLERY_SLOTS.map(({ key, placeholder }) => ({
        key,
        src: settings[key] ?? null,
        placeholder,
    }));

    // In edit mode show all 6 slots (including empty ones); otherwise only filled ones
    const displaySlots = isEditing ? slots : slots.filter(({ src }) => src !== null);

    const sectionTitle = settings['gallery_title'] ?? 'Fotitos';
    const sectionSubtitle = settings['gallery_subtitle'] ?? 'Momentos especiales de nuestros pacientes de cuatro patas.';

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 md:px-0" id="galeria">
            <EditableText settingKey="gallery_title" value={sectionTitle} as="h3" className="text-5xl tracking-tight text-cyan-500" />
            <EditableText settingKey="gallery_subtitle" value={sectionSubtitle} as="span" className="mb-6 text-balance text-gray-600" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {displaySlots.map(({ key, src, placeholder }, index) => (
                    <div key={key}>
                        <div
                            className="relative h-64 w-full transform overflow-hidden rounded-lg border-4 border-gray-100 shadow-lg transition-transform hover:rotate-0"
                            style={{ transform: `rotate(${galleryRotations[index % galleryRotations.length]}deg)` }}
                        >
                            <EditableImage
                                settingKey={key}
                                src={src ?? placeholder}
                                alt={`Galería ${index + 1}`}
                                className="absolute inset-0 h-full w-full object-cover"
                                wrapperClassName="absolute inset-0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
