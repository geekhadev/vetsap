import { useState } from 'react';
import { DocumentTemplateEditor } from '@/components/custom/document-template-editor';
import type { DocumentTemplateVariableGroup } from '@/components/custom/document-template-editor/types';
import { FormDialogFooter } from '@/components/custom/form-dialog-footer';
import { FormTextInput } from '@/components/custom/form-text-input';
import { InertiaFormDialog } from '@/components/custom/inertia-form-dialog';
import { DocumentTemplatePreview } from '@/pages/medic/document-templates/document-template-preview';
import { useDocumentTemplateForm } from '@/pages/medic/document-templates/hooks/use-form';
import type { DocumentTemplate } from '@/pages/medic/document-templates/types';
import { VariablesCatalogDialog } from '@/pages/medic/document-templates/variables-catalog-dialog';

type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entity: DocumentTemplate | null;
    variables: DocumentTemplateVariableGroup[];
};

type FormFields = {
    title: string;
    content: string;
};

type FormDialogBodyProps = {
    entity: DocumentTemplate | null;
    variables: DocumentTemplateVariableGroup[];
    onOpenChange: (open: boolean) => void;
};

function FormDialogBody({
    entity,
    variables,
    onOpenChange,
}: FormDialogBodyProps) {
    const { isEdit, formProps, headTitle, description } =
        useDocumentTemplateForm(entity);
    const [title, setTitle] = useState(entity?.title ?? '');
    const [content, setContent] = useState(entity?.content ?? '');
    const [variablesOpen, setVariablesOpen] = useState(false);

    return (
        <>
            <VariablesCatalogDialog
                open={variablesOpen}
                onOpenChange={setVariablesOpen}
                variables={variables}
            />

            <InertiaFormDialog<FormFields>
                open
                onOpenChange={onOpenChange}
                title={headTitle}
                description={description}
                formKey={entity?.id ?? 'create'}
                inertiaForm={{ ...formProps }}
                contentClassName="flex h-[92vh] w-full flex-col gap-4 overflow-hidden sm:max-w-[90vw]"
                formClassName="flex min-h-0 flex-1 flex-col gap-4 space-y-0"
                dialogContentProps={{
                    onInteractOutside: (event) => {
                        if (variablesOpen) {
                            event.preventDefault();
                        }
                    },
                    onPointerDownOutside: (event) => {
                        if (variablesOpen) {
                            event.preventDefault();
                        }
                    },
                    onFocusOutside: (event) => {
                        if (variablesOpen) {
                            event.preventDefault();
                        }
                    },
                }}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
                            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
                                <FormTextInput
                                    label="Título"
                                    placeholder="Ej. Consentimiento informado"
                                    required
                                    error={errors.title}
                                    inputProps={{
                                        id: 'document-template-title',
                                        name: 'title',
                                        maxLength: 255,
                                        value: title,
                                        onChange: (event) =>
                                            setTitle(event.target.value),
                                    }}
                                />

                                <input
                                    type="hidden"
                                    name="content"
                                    value={content}
                                />

                                <DocumentTemplateEditor
                                    required
                                    error={errors.content}
                                    value={content}
                                    onChange={setContent}
                                    variables={variables}
                                    className="min-h-0 flex-1"
                                    onOpenVariables={() =>
                                        setVariablesOpen(true)
                                    }
                                />
                            </div>

                            <DocumentTemplatePreview
                                content={content}
                                variables={variables}
                            />
                        </div>

                        <FormDialogFooter
                            onCancel={() => onOpenChange(false)}
                            processing={processing}
                            isEdit={isEdit}
                        />
                    </>
                )}
            </InertiaFormDialog>
        </>
    );
}

export function FormDialog({
    open,
    onOpenChange,
    entity,
    variables,
}: FormDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <FormDialogBody
            key={entity?.id ?? 'create'}
            entity={entity}
            variables={variables}
            onOpenChange={onOpenChange}
        />
    );
}
