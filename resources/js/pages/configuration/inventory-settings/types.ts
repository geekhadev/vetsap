export type InventorySettingsFormState = {
    validate_stock_on_sales: boolean;
};

export type InventorySettingsIndexPageProps = {
    companyMissing: boolean;
    settings: InventorySettingsFormState | null;
};
