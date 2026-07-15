import { AttentionFormPanel } from '@/pages/medic/clinical-attentions/attention-form-panel';
import type {
    ClinicalAttention,
    DoctorOption,
    PatientOption,
    TemplateOption,
} from '@/pages/medic/clinical-attentions/types';

type AttentionFormPageProps = {
    formAction: string;
    formMethod: string;
    entity?: ClinicalAttention | null;
    patients: PatientOption[];
    doctors: DoctorOption[];
    templates: TemplateOption[];
    onCancel: () => void;
    backToPatientId?: string | null;
};

export function AttentionFormPage({
    formAction,
    formMethod,
    entity,
    patients,
    doctors,
    templates,
    onCancel,
    backToPatientId,
}: AttentionFormPageProps) {
    return (
        <AttentionFormPanel
            formAction={formAction}
            formMethod={formMethod}
            entity={entity}
            patients={patients}
            doctors={doctors}
            templates={templates}
            backToPatientId={backToPatientId}
            onCancel={onCancel}
            variant="full"
        />
    );
}
