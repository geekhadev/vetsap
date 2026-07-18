<?php

namespace App\Support\Web;

use App\Enums\ClinicWebSettingType;

final class ClinicWebSettingKeys
{
    // Panel — Sitio web tab
    public const LOGO = 'logo';

    public const OG_IMAGE = 'og_image';

    public const FACEBOOK_URL = 'facebook_url';

    public const INSTAGRAM_URL = 'instagram_url';

    public const WHATSAPP_PHONE = 'whatsapp_phone';

    public const WHATSAPP_MESSAGE = 'whatsapp_message';

    public const PRIMARY_COLOR = 'primary_color';

    // Editorial — Hero
    public const HERO_TITLE = 'hero_title';

    public const HERO_SUBTITLE = 'hero_subtitle';

    public const HERO_QUOTE = 'hero_quote';

    // Editorial — Services
    public const SERVICE_1_TITLE = 'service_1_title';

    public const SERVICE_1_DESCRIPTION = 'service_1_description';

    public const SERVICE_1_IMAGE = 'service_1_image';

    public const SERVICE_2_TITLE = 'service_2_title';

    public const SERVICE_2_DESCRIPTION = 'service_2_description';

    public const SERVICE_2_IMAGE = 'service_2_image';

    public const SERVICE_3_TITLE = 'service_3_title';

    public const SERVICE_3_DESCRIPTION = 'service_3_description';

    public const SERVICE_3_IMAGE = 'service_3_image';

    public const SERVICE_4_TITLE = 'service_4_title';

    public const SERVICE_4_DESCRIPTION = 'service_4_description';

    public const SERVICE_4_IMAGE = 'service_4_image';

    // Editorial — Services
    public const SERVICES_TITLE = 'services_title';

    public const SERVICES_SUBTITLE = 'services_subtitle';

    // Editorial — About
    public const ABOUT_TITLE = 'about_title';

    public const ABOUT_PARAGRAPH_1 = 'about_paragraph_1';

    public const ABOUT_PARAGRAPH_2 = 'about_paragraph_2';

    public const ABOUT_PARAGRAPH_3 = 'about_paragraph_3';

    public const ABOUT_IMAGE = 'about_image';

    // Editorial — Gallery
    public const GALLERY_TITLE = 'gallery_title';

    public const GALLERY_SUBTITLE = 'gallery_subtitle';

    // Editorial — Gallery
    public const GALLERY_IMAGE_1 = 'gallery_image_1';

    public const GALLERY_IMAGE_2 = 'gallery_image_2';

    public const GALLERY_IMAGE_3 = 'gallery_image_3';

    public const GALLERY_IMAGE_4 = 'gallery_image_4';

    public const GALLERY_IMAGE_5 = 'gallery_image_5';

    public const GALLERY_IMAGE_6 = 'gallery_image_6';

    // Editorial — Contact
    public const CONTACT_PRETITLE = 'contact_pretitle';

    public const CONTACT_TITLE = 'contact_title';

    public const CONTACT_HOURS_TITLE = 'contact_hours_title';

    public const CONTACT_HOURS = 'contact_hours';

    public const CONTACT_MAP_URL = 'contact_map_url';

    /**
     * @return array<string, ClinicWebSettingType>
     */
    public static function typeMap(): array
    {
        return [
            self::LOGO => ClinicWebSettingType::Image,
            self::OG_IMAGE => ClinicWebSettingType::Image,
            self::FACEBOOK_URL => ClinicWebSettingType::Text,
            self::INSTAGRAM_URL => ClinicWebSettingType::Text,
            self::WHATSAPP_PHONE => ClinicWebSettingType::Text,
            self::WHATSAPP_MESSAGE => ClinicWebSettingType::Text,
            self::PRIMARY_COLOR => ClinicWebSettingType::Text,
            self::HERO_TITLE => ClinicWebSettingType::Text,
            self::HERO_SUBTITLE => ClinicWebSettingType::Text,
            self::HERO_QUOTE => ClinicWebSettingType::Text,
            self::SERVICES_TITLE => ClinicWebSettingType::Text,
            self::SERVICES_SUBTITLE => ClinicWebSettingType::Text,
            self::SERVICE_1_TITLE => ClinicWebSettingType::Text,
            self::SERVICE_1_DESCRIPTION => ClinicWebSettingType::Text,
            self::SERVICE_1_IMAGE => ClinicWebSettingType::Image,
            self::SERVICE_2_TITLE => ClinicWebSettingType::Text,
            self::SERVICE_2_DESCRIPTION => ClinicWebSettingType::Text,
            self::SERVICE_2_IMAGE => ClinicWebSettingType::Image,
            self::SERVICE_3_TITLE => ClinicWebSettingType::Text,
            self::SERVICE_3_DESCRIPTION => ClinicWebSettingType::Text,
            self::SERVICE_3_IMAGE => ClinicWebSettingType::Image,
            self::SERVICE_4_TITLE => ClinicWebSettingType::Text,
            self::SERVICE_4_DESCRIPTION => ClinicWebSettingType::Text,
            self::SERVICE_4_IMAGE => ClinicWebSettingType::Image,
            self::ABOUT_TITLE => ClinicWebSettingType::Text,
            self::ABOUT_PARAGRAPH_1 => ClinicWebSettingType::Html,
            self::ABOUT_PARAGRAPH_2 => ClinicWebSettingType::Html,
            self::ABOUT_PARAGRAPH_3 => ClinicWebSettingType::Html,
            self::ABOUT_IMAGE => ClinicWebSettingType::Image,
            self::GALLERY_TITLE => ClinicWebSettingType::Text,
            self::GALLERY_SUBTITLE => ClinicWebSettingType::Text,
            self::GALLERY_IMAGE_1 => ClinicWebSettingType::Image,
            self::GALLERY_IMAGE_2 => ClinicWebSettingType::Image,
            self::GALLERY_IMAGE_3 => ClinicWebSettingType::Image,
            self::GALLERY_IMAGE_4 => ClinicWebSettingType::Image,
            self::GALLERY_IMAGE_5 => ClinicWebSettingType::Image,
            self::GALLERY_IMAGE_6 => ClinicWebSettingType::Image,
            self::CONTACT_PRETITLE => ClinicWebSettingType::Text,
            self::CONTACT_TITLE => ClinicWebSettingType::Text,
            self::CONTACT_HOURS_TITLE => ClinicWebSettingType::Text,
            self::CONTACT_HOURS => ClinicWebSettingType::Text,
            self::CONTACT_MAP_URL => ClinicWebSettingType::Text,
        ];
    }

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return array_keys(self::typeMap());
    }

    /**
     * @return list<string>
     */
    public static function textKeys(): array
    {
        return array_keys(array_filter(
            self::typeMap(),
            fn (ClinicWebSettingType $t) => $t === ClinicWebSettingType::Text || $t === ClinicWebSettingType::Html,
        ));
    }

    /**
     * @return list<string>
     */
    public static function imageKeys(): array
    {
        return array_keys(array_filter(
            self::typeMap(),
            fn (ClinicWebSettingType $t) => $t === ClinicWebSettingType::Image,
        ));
    }

    /** Panel-visible text keys (saved from the "Sitio web" tab). */
    public const PANEL_TEXT_KEYS = [
        self::PRIMARY_COLOR,
        self::FACEBOOK_URL,
        self::INSTAGRAM_URL,
        self::WHATSAPP_PHONE,
        self::WHATSAPP_MESSAGE,
        self::CONTACT_MAP_URL,
    ];
}
