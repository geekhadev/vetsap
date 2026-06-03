import { EditableImage } from './editable-image';
import { EditableText } from './editable-text';
import type { ClinicSettings } from './types';

const DEFAULT_SERVICES = [
    {
        key: 1,
        title: 'Medicina General',
        description: 'Consultas de rutina, vacunas, desparasitación y control de salud preventiva para tu mascota.',
        image: 'https://placehold.co/600x400/e0f7fa/00838f?text=Medicina+General',
    },
    {
        key: 2,
        title: 'Cirugía',
        description: 'Procedimientos quirúrgicos con equipamiento moderno y personal altamente capacitado.',
        image: 'https://placehold.co/600x400/e0f7fa/00838f?text=Cirugía',
    },
    {
        key: 3,
        title: 'Urgencias',
        description: 'Atención de emergencias para cuando tu mascota más te necesita, con respuesta rápida.',
        image: 'https://placehold.co/600x400/e0f7fa/00838f?text=Urgencias',
    },
    {
        key: 4,
        title: 'Odontología',
        description: 'Limpieza dental, extracciones y cuidado bucal profesional para mantener la salud oral.',
        image: 'https://placehold.co/600x400/e0f7fa/00838f?text=Odontología',
    },
] as const;

type ClinicServicesProps = {
    settings: ClinicSettings;
};

export function ClinicServices({ settings }: ClinicServicesProps) {
    const services = DEFAULT_SERVICES.map((def) => ({
        titleKey: `service_${def.key}_title`,
        descriptionKey: `service_${def.key}_description`,
        imageKey: `service_${def.key}_image`,
        title: settings[`service_${def.key}_title`] ?? def.title,
        description: settings[`service_${def.key}_description`] ?? def.description,
        image: settings[`service_${def.key}_image`] ?? def.image,
    }));

    const sectionTitle = settings['services_title'] ?? 'Nuestros servicios';
    const sectionSubtitle =
        settings['services_subtitle'] ??
        'Ofrecemos una amplia gama de servicios veterinarios para mantener a tu mascota saludable y feliz.';

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 md:px-0" id="servicios">
            <EditableText settingKey="services_title" value={sectionTitle} as="h3" className="text-5xl tracking-tight text-cyan-500" />
            <EditableText settingKey="services_subtitle" value={sectionSubtitle} as="span" className="mb-6 text-balance text-gray-600" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {services.map((service) => (
                    <div key={service.titleKey} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="relative h-64 w-full transform overflow-hidden rounded-lg border-4 border-gray-100 shadow-lg transition-transform hover:rotate-0">
                                <EditableImage
                                    settingKey={service.imageKey}
                                    src={service.image}
                                    alt={service.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    wrapperClassName="absolute inset-0"
                                />
                            </div>
                            <div className="flex flex-col gap-2 p-2">
                                <EditableText
                                    settingKey={service.titleKey}
                                    value={service.title}
                                    as="h4"
                                    className="text-xl"
                                />
                                <EditableText
                                    settingKey={service.descriptionKey}
                                    value={service.description}
                                    as="p"
                                    className="text-sm text-gray-600"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
