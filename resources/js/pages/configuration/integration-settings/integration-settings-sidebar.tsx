import { FormActionButton } from '@/components/custom/form-action-button';
import { cn } from '@/lib/utils';
import { INTEGRATION_SETTINGS_PAGE } from '@/pages/configuration/integration-settings/config';
import { INTEGRATION_TABS } from '@/pages/configuration/integration-settings/integration-tabs-config';
import type { IntegrationTabId } from '@/pages/configuration/integration-settings/types';

type IntegrationSettingsSidebarProps = {
    activeTab: IntegrationTabId;
    onTabChange: (tab: IntegrationTabId) => void;
};

export function IntegrationSettingsSidebar({
    activeTab,
    onTabChange,
}: IntegrationSettingsSidebarProps) {
    return (
        <div className="flex max-w-xs flex-col gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
                {INTEGRATION_SETTINGS_PAGE.title}
            </h1>
            <p className="text-muted-foreground text-sm">
                {INTEGRATION_SETTINGS_PAGE.description}
            </p>

            {INTEGRATION_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <FormActionButton
                        key={tab.id}
                        type="button"
                        size="lg"
                        variant={isActive ? 'default' : 'outline'}
                        icon={<Icon aria-hidden className="size-4 shrink-0" />}
                        label={tab.label}
                        containerClassName="w-full"
                        buttonClassName={cn(
                            'w-full justify-start text-left',
                            !isActive && 'text-muted-foreground',
                        )}
                        onClick={() => onTabChange(tab.id)}
                    />
                );
            })}
        </div>
    );
}
