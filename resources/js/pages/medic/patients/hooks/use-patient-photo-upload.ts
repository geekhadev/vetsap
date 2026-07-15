import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { store as storePatientPhoto } from '@/routes/medic/patients/photo';

function withCacheVersion(url: string, version: number): string {
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}v=${version}`;
}

type UsePatientPhotoUploadOptions = {
    patientId: string;
    photoUrl: string | null | undefined;
};

export function usePatientPhotoUpload({
    patientId,
    photoUrl,
}: UsePatientPhotoUploadOptions) {
    const photoForm = useForm<{ photo: File | null }>({ photo: null });
    const localPreviewRef = useRef<string | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const [cacheVersion, setCacheVersion] = useState(0);

    const revokeLocalPreview = (): void => {
        if (localPreviewRef.current !== null) {
            URL.revokeObjectURL(localPreviewRef.current);
            localPreviewRef.current = null;
        }
    };

    useEffect(() => revokeLocalPreview, []);

    const previewUrl =
        localPreviewUrl ??
        (photoUrl ? withCacheVersion(photoUrl, cacheVersion) : null);

    const upload = (file: File, input: HTMLInputElement): void => {
        revokeLocalPreview();

        const objectUrl = URL.createObjectURL(file);
        localPreviewRef.current = objectUrl;
        setLocalPreviewUrl(objectUrl);

        photoForm.clearErrors();
        photoForm.transform(() => ({ photo: file }));
        photoForm.post(storePatientPhoto.url(patientId), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                photoForm.transform((data) => data);
                revokeLocalPreview();
                setLocalPreviewUrl(null);
                setCacheVersion((version) => version + 1);
                photoForm.setData('photo', null);
                input.value = '';
            },
            onError: () => {
                photoForm.transform((data) => data);
                revokeLocalPreview();
                setLocalPreviewUrl(null);
            },
        });
    };

    return {
        previewUrl,
        processing: photoForm.processing,
        error: photoForm.errors.photo,
        upload,
    };
}
