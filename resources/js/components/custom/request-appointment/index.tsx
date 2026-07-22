import { usePage } from '@inertiajs/react';
import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { RequestAppointmentDialog } from '@/components/custom/request-appointment/request-appointment-dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/auth';

export function RequestAppointment() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [open, setOpen] = useState(false);

    if (auth.user.type !== 'customer') {
        return null;
    }

    return (
        <>
            <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 gap-1.5 px-2.5"
                onClick={() => setOpen(true)}
            >
                <CalendarPlus className="size-4" />
                <span>Pedir cita</span>
            </Button>
            <RequestAppointmentDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
