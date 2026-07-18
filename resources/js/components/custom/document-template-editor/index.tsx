import Mention from '@tiptap/extension-mention';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle, BackgroundColor } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    Redo2,
    Undo2,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import { DocumentTemplateColorToolbar } from '@/components/custom/document-template-editor/color-toolbar';
import { MentionList } from '@/components/custom/document-template-editor/mention-list';
import type { MentionListHandle } from '@/components/custom/document-template-editor/types';
import type {
    DocumentTemplateVariableFlat,
    DocumentTemplateVariableGroup,
} from '@/components/custom/document-template-editor/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import 'tippy.js/dist/tippy.css';

const EDITOR_PROSE_CLASS = cn(
    'prose prose-sm dark:prose-invert max-w-none min-h-48 focus:outline-none px-3 py-2',
    '[&_p]:my-0 [&_p]:min-h-[1.25em] [&_p+p]:mt-3',
    '[&_.mention]:rounded [&_.mention]:bg-primary/10 [&_.mention]:px-1 [&_.mention]:py-0.5 [&_.mention]:font-medium [&_.mention]:text-primary',
);

type DocumentTemplateEditorProps = {
    id?: string;
    label?: string;
    required?: boolean;
    error?: string;
    value: string;
    onChange: (html: string) => void;
    variables: DocumentTemplateVariableGroup[];
    className?: string;
    onOpenVariables?: () => void;
};

function flattenVariables(
    groups: DocumentTemplateVariableGroup[],
): DocumentTemplateVariableFlat[] {
    return groups.flatMap((group) =>
        group.items.map((item) => ({
            id: item.id,
            label: item.label,
            sample: item.sample,
            group: group.group,
            group_label: group.group_label,
        })),
    );
}

function filterVariables(
    items: DocumentTemplateVariableFlat[],
    query: string,
): DocumentTemplateVariableFlat[] {
    const normalized = query.toLowerCase().trim();

    return items
        .filter((item) => {
            if (normalized === '') {
                return true;
            }

            return (
                item.id.toLowerCase().includes(normalized) ||
                item.label.toLowerCase().includes(normalized) ||
                item.group_label.toLowerCase().includes(normalized)
            );
        })
        .slice(0, 40);
}

function createMentionSuggestion(getItems: () => DocumentTemplateVariableFlat[]) {
    return {
        char: '@',
        items: ({ query }: { query: string }) =>
            filterVariables(getItems(), query),
        render: () => {
            let componentRef: MentionListHandle | null = null;
            let popup: TippyInstance[] = [];
            let container: HTMLDivElement | null = null;
            let root: Root | null = null;

            return {
                onStart: (props: SuggestionProps) => {
                    container = document.createElement('div');
                    root = createRoot(container);

                    root.render(
                        <MentionList
                            ref={(instance) => {
                                componentRef = instance;
                            }}
                            items={
                                props.items as DocumentTemplateVariableFlat[]
                            }
                            command={props.command}
                        />,
                    );

                    if (!props.clientRect) {
                        return;
                    }

                    popup = tippy('body', {
                        getReferenceClientRect:
                            props.clientRect as () => DOMRect,
                        appendTo: () => document.body,
                        content: container,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },
                onUpdate: (props: SuggestionProps) => {
                    root?.render(
                        <MentionList
                            ref={(instance) => {
                                componentRef = instance;
                            }}
                            items={
                                props.items as DocumentTemplateVariableFlat[]
                            }
                            command={props.command}
                        />,
                    );

                    popup[0]?.setProps({
                        getReferenceClientRect:
                            props.clientRect as () => DOMRect,
                    });
                },
                onKeyDown: (props: SuggestionKeyDownProps) => {
                    if (props.event.key === 'Escape') {
                        popup[0]?.hide();

                        return true;
                    }

                    return componentRef?.onKeyDown(props) ?? false;
                },
                onExit: () => {
                    popup[0]?.destroy();
                    popup = [];
                    queueMicrotask(() => {
                        root?.unmount();
                        root = null;
                        container = null;
                    });
                },
            };
        },
    };
}

export function DocumentTemplateEditor({
    id = 'document-template-content',
    label = 'Contenido',
    required = false,
    error,
    value,
    onChange,
    variables,
    className,
    onOpenVariables,
}: DocumentTemplateEditorProps): ReactElement {
    const flatVariables = useMemo(
        () => flattenVariables(variables),
        [variables],
    );

    const editor = useEditor(
        {
            immediatelyRender: false,
            extensions: [
                StarterKit.configure({
                    heading: false,
                    codeBlock: false,
                    blockquote: false,
                    horizontalRule: false,
                    hardBreak: {
                        keepMarks: true,
                    },
                }),
                TextStyle,
                Color,
                BackgroundColor,
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
                Mention.configure({
                    HTMLAttributes: {
                        class: 'rounded bg-primary/10 px-1 py-0.5 font-medium text-primary',
                    },
                    suggestion: createMentionSuggestion(() => flatVariables),
                }),
            ],
            content: value || '',
            editorProps: {
                attributes: {
                    id,
                    class: EDITOR_PROSE_CLASS,
                },
            },
            onUpdate: ({ editor: current }) => {
                onChange(current.getHTML());
            },
        },
        [flatVariables],
    );

    useEffect(() => {
        if (!editor) {
            return;
        }

        const current = editor.getHTML();

        if (value !== current) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [editor, value]);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {label ? (
                <Label htmlFor={id}>
                    {label}
                    {required ? (
                        <span className="text-destructive"> *</span>
                    ) : null}
                </Label>
            ) : null}

            <div
                className={cn(
                    'flex min-h-64 flex-1 flex-col overflow-hidden rounded-md border shadow-xs',
                    error && 'border-destructive',
                )}
            >
                <div className="flex shrink-0 flex-wrap gap-1 border-b bg-muted/40 p-1.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                        }
                        aria-label="Negrita"
                    >
                        <Bold className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                        aria-label="Cursiva"
                    >
                        <Italic className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                        }
                        aria-label="Lista"
                    >
                        <List className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                        }
                        aria-label="Lista numerada"
                    >
                        <ListOrdered className="size-4" />
                    </Button>
                    <div className="mx-1 w-px self-stretch bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-8',
                            editor?.isActive({ textAlign: 'left' }) &&
                                'bg-accent',
                        )}
                        disabled={!editor}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .setTextAlign('left')
                                .run()
                        }
                        aria-label="Alinear a la izquierda"
                    >
                        <AlignLeft className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-8',
                            editor?.isActive({ textAlign: 'center' }) &&
                                'bg-accent',
                        )}
                        disabled={!editor}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .setTextAlign('center')
                                .run()
                        }
                        aria-label="Centrar"
                    >
                        <AlignCenter className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-8',
                            editor?.isActive({ textAlign: 'right' }) &&
                                'bg-accent',
                        )}
                        disabled={!editor}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .setTextAlign('right')
                                .run()
                        }
                        aria-label="Alinear a la derecha"
                    >
                        <AlignRight className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                            'size-8',
                            editor?.isActive({ textAlign: 'justify' }) &&
                                'bg-accent',
                        )}
                        disabled={!editor}
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .setTextAlign('justify')
                                .run()
                        }
                        aria-label="Justificar"
                    >
                        <AlignJustify className="size-4" />
                    </Button>
                    <div className="mx-1 w-px self-stretch bg-border" />
                    <DocumentTemplateColorToolbar editor={editor} />
                    <div className="mx-1 w-px self-stretch bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().undo().run()}
                        aria-label="Deshacer"
                    >
                        <Undo2 className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        onClick={() => editor?.chain().focus().redo().run()}
                        aria-label="Rehacer"
                    >
                        <Redo2 className="size-4" />
                    </Button>
                    {onOpenVariables ? (
                        <Button
                            type="button"
                            variant="link"
                            className="ml-auto h-auto self-center px-2 text-xs"
                            onClick={onOpenVariables}
                        >
                            Ver variables disponibles
                        </Button>
                    ) : (
                        <p className="ml-auto self-center px-2 text-xs text-muted-foreground">
                            Escribe @ para insertar variables
                        </p>
                    )}
                </div>
                <EditorContent
                    editor={editor}
                    className="min-h-0 flex-1 overflow-y-auto [&_.tiptap]:min-h-full"
                />
            </div>

            {error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}
