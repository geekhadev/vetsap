import { Pencil, X } from 'lucide-react';
import { useClinicEditor } from './clinic-editor-context';

export function ClinicEditorToolbar() {
    const { isEditing, toggleEditing } = useClinicEditor();

    return (
        <div className="fixed top-5 right-5 z-50">
            <button
                type="button"
                onClick={toggleEditing}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors ${
                    isEditing
                        ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                        : 'border border-amber-400 bg-amber-400 text-gray-700 hover:bg-amber-50'
                }`}
            >
                {isEditing ? <X size={15} aria-hidden /> : <Pencil size={15} aria-hidden />}
                {isEditing ? 'Salir del editor' : 'Editar página'}
            </button>
        </div>
    );
}
