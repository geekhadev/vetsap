import type { Auth } from '@/types/auth';
import type { CashRegisterSharedProps } from '@/types/cash-register';
import type {
    CompanySelectedSession,
    SelectableCompanyOption,
} from '@/types/company-session';
import type { VetsapSharedProps } from '@/types/vetsap';

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
            cash_register: CashRegisterSharedProps;
            vetsap: VetsapSharedProps;
            [key: string]: unknown;
        };
    }
}
