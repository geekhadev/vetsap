import { Pencil, X } from 'lucide-react';
import { useClinicEditor } from './clinic-editor-context';

export function ClinicEditorToolbar() {
    const { isEditing, toggleEditing } = useClinicEditor();

    return (
        <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
            <button
                type="button"
                onClick={toggleEditing}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors ${
                    isEditing
                        ? 'bg-clinic-600 text-white hover:bg-clinic-700'
                        : 'border border-amber-400 bg-amber-400 text-gray-700 hover:bg-amber-50'
                }`}
            >
                {isEditing ? <X size={15} aria-hidden /> : <Pencil size={15} aria-hidden />}
                {isEditing ? 'Salir del editor' : 'Editar página'}
            </button>
        </div>
    );
}
