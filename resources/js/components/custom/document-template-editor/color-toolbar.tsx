import type { Editor } from '@tiptap/react';
import { Highlighter, Baseline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const TEXT_COLORS = [
    { label: 'Negro', value: '#171717' },
    { label: 'Gris', value: '#525252' },
    { label: 'Rojo', value: '#dc2626' },
    { label: 'Naranja', value: '#ea580c' },
    { label: 'Ámbar', value: '#d97706' },
    { label: 'Verde', value: '#16a34a' },
    { label: 'Azul', value: '#2563eb' },
    { label: 'Violeta', value: '#7c3aed' },
    { label: 'Rosa', value: '#db2777' },
] as const;

const BACKGROUND_COLORS = [
    { label: 'Amarillo', value: '#fef08a' },
    { label: 'Verde', value: '#bbf7d0' },
    { label: 'Azul', value: '#bfdbfe' },
    { label: 'Rosa', value: '#fbcfe8' },
    { label: 'Naranja', value: '#fed7aa' },
    { label: 'Violeta', value: '#ddd6fe' },
    { label: 'Gris', value: '#e5e5e5' },
] as const;

type ColorToolbarProps = {
    editor: Editor | null;
};

export function DocumentTemplateColorToolbar({ editor }: ColorToolbarProps) {
    const currentColor =
        (editor?.getAttributes('textStyle').color as string | undefined) ??
        undefined;
    const currentBackground =
        (editor?.getAttributes('textStyle').backgroundColor as
            | string
            | undefined) ?? undefined;

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        aria-label="Color de texto"
                        title="Color de texto"
                    >
                        <span className="flex flex-col items-center gap-0.5">
                            <Baseline className="size-4" />
                            <span
                                className="h-0.5 w-3.5 rounded-full"
                                style={{
                                    backgroundColor: currentColor ?? '#171717',
                                }}
                            />
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Color de texto
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                        {TEXT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                title={color.label}
                                className={cn(
                                    'size-6 rounded-sm border border-black/10',
                                    currentColor === color.value &&
                                        'ring-2 ring-ring ring-offset-1',
                                )}
                                style={{ backgroundColor: color.value }}
                                onClick={() =>
                                    editor
                                        ?.chain()
                                        .focus()
                                        .setColor(color.value)
                                        .run()
                                }
                            />
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 w-full text-xs"
                        onClick={() =>
                            editor?.chain().focus().unsetColor().run()
                        }
                    >
                        Quitar color
                    </Button>
                </PopoverContent>
            </Popover>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={!editor}
                        aria-label="Color de fondo"
                        title="Color de fondo"
                    >
                        <span className="relative">
                            <Highlighter className="size-4" />
                            <span
                                className="absolute -right-0.5 -bottom-0.5 size-2 rounded-sm border border-background"
                                style={{
                                    backgroundColor:
                                        currentBackground ?? 'transparent',
                                }}
                            />
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Color de fondo
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {BACKGROUND_COLORS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                title={color.label}
                                className={cn(
                                    'size-6 rounded-sm border border-black/10',
                                    currentBackground === color.value &&
                                        'ring-2 ring-ring ring-offset-1',
                                )}
                                style={{ backgroundColor: color.value }}
                                onClick={() =>
                                    editor
                                        ?.chain()
                                        .focus()
                                        .setBackgroundColor(color.value)
                                        .run()
                                }
                            />
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 w-full text-xs"
                        onClick={() =>
                            editor
                                ?.chain()
                                .focus()
                                .unsetBackgroundColor()
                                .run()
                        }
                    >
                        Quitar fondo
                    </Button>
                </PopoverContent>
            </Popover>
        </>
    );
}
