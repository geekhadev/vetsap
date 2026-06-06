import type { Matcher } from 'react-day-picker';

export type FormDateTimeValue = {
    date: string;
    time: string;
};

export type FormDateTimePickerFieldProps = {
    label?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    id?: string;
    value: FormDateTimeValue;
    onChange: (value: FormDateTimeValue) => void;
    minuteStep?: number;
    disabled?: Matcher | Matcher[];
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    triggerClassName?: string;
    popoverContentClassName?: string;
    portalled?: boolean;
};
