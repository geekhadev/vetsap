import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type {
    WebsiteSettingsFormState,
    WebsiteSettingsIndexPageProps,
} from '@/pages/configuration/website-settings/types';
import { update as updateWebsiteSettings } from '@/routes/configuration/website-settings';
import { store as storeWebsiteLogo } from '@/routes/configuration/website-settings/logo';

function withCacheVersion(url: string, version: number): string {
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}v=${version}`;
}

export function useWebsiteSettingsForm() {
    const { slug, webSettings } =
        usePage<WebsiteSettingsIndexPageProps>().props;

    const serverLogoUrl = webSettings?.['logo'] ?? null;

    const form = useForm<WebsiteSettingsFormState>({
        slug: slug ?? '',
        facebook_url: webSettings?.['facebook_url'] ?? '',
        instagram_url: webSettings?.['instagram_url'] ?? '',
        whatsapp_phone: webSettings?.['whatsapp_phone'] ?? '',
        whatsapp_message: webSettings?.['whatsapp_message'] ?? '',
        contact_map_url: webSettings?.['contact_map_url'] ?? '',
    });

    const logoForm = useForm<{ logo: File | null }>({ logo: null });
    const localLogoPreviewRef = useRef<string | null>(null);
    const [localLogoPreviewUrl, setLocalLogoPreviewUrl] = useState<string | null>(
        null,
    );
    const [logoCacheVersion, setLogoCacheVersion] = useState(0);

    const revokeLocalLogoPreview = (): void => {
        if (localLogoPreviewRef.current !== null) {
            URL.revokeObjectURL(localLogoPreviewRef.current);
            localLogoPreviewRef.current = null;
        }
    };

    useEffect(() => revokeLocalLogoPreview, []);

    const logoPreviewUrl =
        localLogoPreviewUrl ??
        (serverLogoUrl
            ? withCacheVersion(serverLogoUrl, logoCacheVersion)
            : null);

    const submit = (e: React.FormEvent): void => {
        e.preventDefault();
        form.put(updateWebsiteSettings.url(), { preserveScroll: true });
    };

    const uploadLogo = (file: File, input: HTMLInputElement): void => {
        revokeLocalLogoPreview();

        const objectUrl = URL.createObjectURL(file);
        localLogoPreviewRef.current = objectUrl;
        setLocalLogoPreviewUrl(objectUrl);

        logoForm.setData('logo', file);
        logoForm.post(storeWebsiteLogo.url(), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                revokeLocalLogoPreview();
                setLocalLogoPreviewUrl(null);
                setLogoCacheVersion((version) => version + 1);
                logoForm.setData('logo', null);
                input.value = '';
            },
            onError: () => {
                revokeLocalLogoPreview();
                setLocalLogoPreviewUrl(null);
            },
        });
    };

    return {
        form,
        logoForm,
        logoPreviewUrl,
        submit,
        uploadLogo,
    };
}
