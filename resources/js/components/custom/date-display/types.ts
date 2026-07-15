/** `date` → dd/mm/aaaa · `datetime` → dd/mm/aaaa HH:mm · `time` → HH:mm */
export type DateDisplayMode = 'date' | 'datetime' | 'time';

export type DateDisplayProps = {
    value: string | Date | null | undefined;
    /** Solo fecha, fecha+hora, o solo hora (estándar del producto). */
    mode: DateDisplayMode;
    /** Texto cuando no hay valor o la fecha es inválida. */
    empty?: string;
    /**
     * `time`: elemento `<time dateTime>` cuando hay fecha válida.
     * `span`: solo texto.
     */
    as?: 'time' | 'span';
    className?: string;
};
