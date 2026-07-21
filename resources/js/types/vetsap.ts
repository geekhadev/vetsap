export type VetsapClinicalAttentionShared = {
    start_from_appointment_minutes_before: number;
    start_from_appointment_minutes_after: number;
};

export type VetsapSharedProps = {
    clinical_attention: VetsapClinicalAttentionShared;
};
