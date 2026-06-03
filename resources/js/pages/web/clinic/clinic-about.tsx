import { EditableImage } from './editable-image';
import { EditableText } from './editable-text';
import type { ClinicSettings } from './types';

const DEFAULT_PARAGRAPHS = [
    'Somos una clínica veterinaria con más de 10 años de experiencia en la Región del Biobío, comprometida con ofrecer atención médica de calidad para tus mascotas.',
    'Nuestro equipo de veterinarios especializados trabaja con dedicación para garantizar el bienestar y la salud de cada paciente que llega a nuestras instalaciones.',
    'Contamos con equipamiento de última generación y un ambiente cálido diseñado para que tanto tú como tu mascota se sientan cómodos y seguros en cada visita.',
];

type ClinicAboutProps = {
    settings: ClinicSettings;
};

export function ClinicAbout({ settings }: ClinicAboutProps) {
    const paragraphs = [
        { key: 'about_paragraph_1', value: settings['about_paragraph_1'] ?? DEFAULT_PARAGRAPHS[0] },
        { key: 'about_paragraph_2', value: settings['about_paragraph_2'] ?? DEFAULT_PARAGRAPHS[1] },
        { key: 'about_paragraph_3', value: settings['about_paragraph_3'] ?? DEFAULT_PARAGRAPHS[2] },
    ];
    const image = settings['about_image'] ?? 'https://placehold.co/600x500/e0f7fa/00838f?text=Nuestro+equipo';

    const sectionTitle = settings['about_title'] ?? 'Sobre nosotros';

    return (
        <div
            className="mx-auto flex w-full max-w-7xl gap-3 px-6 md:px-0 flex-col md:flex-row items-center"
            id="sobre-nosotros"
        >
            <div className="flex flex-col gap-4">
                <EditableText settingKey="about_title" value={sectionTitle} as="h3" className="text-5xl font-bold tracking-tight text-cyan-500" />
                <div className="space-y-4 text-balance text-gray-700">
                    {paragraphs.map(({ key, value }) => (
                        <EditableText key={key} settingKey={key} value={value} as="p" />
                    ))}
                </div>
            </div>
            <div className="col-span-1">
                <EditableImage
                    settingKey="about_image"
                    src={image}
                    alt="Sobre nosotros"
                    className="w-full rounded-lg object-cover shadow-md"
                    wrapperClassName="relative rounded-lg overflow-hidden"
                />
            </div>
        </div>
    );
}
