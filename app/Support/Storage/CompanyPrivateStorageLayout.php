<?php

namespace App\Support\Storage;

/**
 * Rutas relativas al disco `local` (raíz `storage/app/private`).
 */
final class CompanyPrivateStorageLayout
{
    /**
     * Certificado SII subido vía integración (ruta administrada).
     */
    public static function siiIntegrationCertificateDirectory(string $companyId): string
    {
        return 'companies/'.$companyId.'/integrations/sii';
    }

    /**
     * @deprecated Solo para compatibilidad con instalaciones que aún tengan certificados en la ruta anterior.
     */
    public static function legacySiiCertificateDirectory(string $companyId): string
    {
        return 'company-sii-certificates/'.$companyId;
    }

    /**
     * Directorio de trabajo de un ticket de certificación SII (boletas).
     */
    public static function siiCertificationTicketDirectory(string $companyId, string $ticketId): string
    {
        return 'companies/'.$companyId.'/sale/sii/certification-tickets/'.$ticketId;
    }

    /**
     * Archivo XML de CAF SII (disco privado `local`).
     */
    public static function siiCafXmlRelativePath(string $companyId, string $cafId): string
    {
        return 'companies/'.$companyId.'/sale/sii/cafs/'.$cafId.'.xml';
    }

    /**
     * @deprecated Solo para compatibilidad con tickets creados antes del cambio de layout.
     */
    public static function legacyCertificationTicketDirectory(string $ticketId): string
    {
        return 'sale/certifications/'.$ticketId;
    }

    /**
     * Comprueba que la ruta relativa en disco corresponde al ticket (layout nuevo o legado).
     */
    public static function certificationArtifactBelongsToTicket(
        string $companyId,
        string $ticketId,
        string $relative,
    ): bool {
        $prefixNew = self::siiCertificationTicketDirectory($companyId, $ticketId).'/';
        if (str_starts_with($relative, $prefixNew)) {
            return true;
        }

        $prefixLegacy = self::legacyCertificationTicketDirectory($ticketId).'/';

        return str_starts_with($relative, $prefixLegacy);
    }

    /**
     * @return list<string>
     */
    public static function managedSiiCertificateDirectoryCandidates(string $companyId): array
    {
        return [
            self::siiIntegrationCertificateDirectory($companyId),
            self::legacySiiCertificateDirectory($companyId),
        ];
    }
}
