import type { Auth } from '@/types/auth';
import type {
    CompanySelectedSession,
    SelectableCompanyOption,
} from '@/types/company-session';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            company_selected: CompanySelectedSession | null;
            selectable_companies: SelectableCompanyOption[];
            show_company_switcher: boolean;
            can_create_company: boolean;
            [key: string]: unknown;
        };
    }
}
