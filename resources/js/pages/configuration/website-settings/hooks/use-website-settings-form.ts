import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type {
    WebsiteSettingsFormState,
    WebsiteSettingsIndexPageProps,
} from '@/pages/configuration/website-settings/types';
import { update as updateWebsiteSettings } from '@/routes/configuration/website-settings';
import { store as storeWebsiteLogo } from '@/routes/configuration/website-settings/logo';
import { store as storeWebsiteOgImage } from '@/routes/configuration/website-settings/og-image';

function withCacheVersion(url: string, version: number): string {
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}v=${version}`;
}

function useImageUpload(serverUrl: string | null, uploadUrl: string) {
    const imageForm = useForm<{ [key: string]: File | null }>({});
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
        (serverUrl ? withCacheVersion(serverUrl, cacheVersion) : null);

    const upload = (fieldName: string, file: File, input: HTMLInputElement): void => {
        revokeLocalPreview();

        const objectUrl = URL.createObjectURL(file);
        localPreviewRef.current = objectUrl;
        setLocalPreviewUrl(objectUrl);

        imageForm.clearErrors();
        imageForm.transform(() => ({
            [fieldName]: file,
        }));
        imageForm.post(uploadUrl, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                imageForm.transform((data) => data);
                revokeLocalPreview();
                setLocalPreviewUrl(null);
                setCacheVersion((v) => v + 1);
                imageForm.setData(fieldName, null);
                input.value = '';
            },
            onError: () => {
                imageForm.transform((data) => data);
                revokeLocalPreview();
                setLocalPreviewUrl(null);
            },
        });
    };

    return { imageForm, previewUrl, upload };
}

export function useWebsiteSettingsForm() {
    const { slug, webSettings } =
        usePage<WebsiteSettingsIndexPageProps>().props;

    const form = useForm<WebsiteSettingsFormState>({
        slug: slug ?? '',
        primary_color: webSettings?.['primary_color'] ?? '',
        facebook_url: webSettings?.['facebook_url'] ?? '',
        instagram_url: webSettings?.['instagram_url'] ?? '',
        whatsapp_phone: webSettings?.['whatsapp_phone'] ?? '',
        whatsapp_message: webSettings?.['whatsapp_message'] ?? '',
        contact_map_url: webSettings?.['contact_map_url'] ?? '',
    });

    const logo = useImageUpload(
        webSettings?.['logo'] ?? null,
        storeWebsiteLogo.url(),
    );

    const ogImage = useImageUpload(
        webSettings?.['og_image'] ?? null,
        storeWebsiteOgImage.url(),
    );

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.put(updateWebsiteSettings.url(), { preserveScroll: true });
    };

    const uploadLogo = (file: File, input: HTMLInputElement): void => {
        logo.upload('logo', file, input);
    };

    const uploadOgImage = (file: File, input: HTMLInputElement): void => {
        ogImage.upload('og_image', file, input);
    };

    return {
        form,
        logoForm: logo.imageForm,
        logoPreviewUrl: logo.previewUrl,
        ogImageForm: ogImage.imageForm,
        ogImagePreviewUrl: ogImage.previewUrl,
        submit,
        uploadLogo,
        uploadOgImage,
    };
}
