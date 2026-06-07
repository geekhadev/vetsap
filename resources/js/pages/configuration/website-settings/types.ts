export type WebsiteSettingsFormState = {
    slug: string;
    facebook_url: string;
    instagram_url: string;
    whatsapp_phone: string;
    whatsapp_message: string;
    contact_map_url: string;
};

export type WebsiteSettingsIndexPageProps = {
    companyMissing: boolean;
    companyId: string | null;
    slug: string | null;
    webSettings: Record<string, string | null> | null;
};
