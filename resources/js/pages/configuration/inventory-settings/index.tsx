import { Head, usePage } from '@inertiajs/react';
import {
    SplitSettingsAside,
    SplitSettingsHeading,
    SplitSettingsLayout,
    SplitSettingsPanel,
} from '@/components/custom/split-settings-layout';
import { SettingsSection } from '@/pages/configuration/calendar-settings/settings-section';
import { SettingsSwitchField } from '@/pages/configuration/calendar-settings/settings-switch-field';
import { INVENTORY_SETTINGS_PAGE } from '@/pages/configuration/inventory-settings/config';
import { useInventorySettingsForm } from '@/pages/configuration/inventory-settings/hooks/use-inventory-settings-form';
import type { InventorySettingsIndexPageProps } from '@/pages/configuration/inventory-settings/types';

function InventorySettingsIndex() {
    const { companyMissing } =
        usePage<InventorySettingsIndexPageProps>().props;
    const { form } = useInventorySettingsForm();

    if (companyMissing) {
        return (
            <>
                <Head title={INVENTORY_SETTINGS_PAGE.title} />
                <div className="p-4">
                    <p className="text-muted-foreground text-sm">
                        Debes seleccionar una empresa para configurar el
                        inventario.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={INVENTORY_SETTINGS_PAGE.title} />

            <SplitSettingsLayout>
                <SplitSettingsAside>
                    <SplitSettingsHeading
                        title={INVENTORY_SETTINGS_PAGE.title}
                        description={INVENTORY_SETTINGS_PAGE.description}
                    />
                </SplitSettingsAside>

                <SplitSettingsPanel contentClassName="space-y-6">
                    <SettingsSection
                        title="Validación de stock"
                        showSeparator={false}
                        tooltip="Aplica al cobrar productos en el punto de venta y al aplicar vacunas en clínica."
                    >
                        <div className="space-y-2">
                            <SettingsSwitchField
                                label="Validar stock en ventas"
                                checked={form.data.validate_stock_on_sales}
                                onCheckedChange={(checked) =>
                                    form.setData(
                                        'validate_stock_on_sales',
                                        checked,
                                    )
                                }
                            />
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Si está activo, no se podrá cobrar ni aplicar
                                vacunas sin stock suficiente. Si está inactivo,
                                se permitirá y el stock puede quedar negativo;
                                los movimientos de inventario se registran
                                igual.
                            </p>
                            {form.errors.validate_stock_on_sales ? (
                                <p className="text-destructive text-xs">
                                    {form.errors.validate_stock_on_sales}
                                </p>
                            ) : null}
                        </div>
                    </SettingsSection>
                </SplitSettingsPanel>
            </SplitSettingsLayout>
        </>
    );
}

InventorySettingsIndex.layout = {
    breadcrumbs: INVENTORY_SETTINGS_PAGE.breadcrumbs(),
};

export default InventorySettingsIndex;
