import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { DOCUMENT_OPTIONS } from '@/pages/configuration/companies/tabs/tab-config';
import { login } from '@/routes';
import { store } from '@/routes/register';

const selectClassName = cn(
    'border-input placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

export default function Register() {
    return (
        <>
            <Head title="Registro" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <h2 className="text-sm font-medium">Tu cuenta</h2>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nombre completo"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="flex gap-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Contraseña"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirmar contraseña
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirmar contraseña"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 border-t pt-4">
                                <h2 className="text-sm font-medium">Tu empresa</h2>
                                <p className="text-muted-foreground text-sm">
                                    Luego Podrás completar el perfil de tu empresa.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-1">
                                    <Label htmlFor="company-document_type">
                                        Tipo de documento
                                    </Label>
                                    <select
                                        id="company-document_type"
                                        name="company[document_type]"
                                        required
                                        tabIndex={5}
                                        className={selectClassName}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>
                                            Selecciona…
                                        </option>
                                        {DOCUMENT_OPTIONS.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={
                                            errors['company.document_type']
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 sm:col-span-1">
                                    <Label htmlFor="company-document_number">
                                        Número de documento
                                    </Label>
                                    <Input
                                        id="company-document_number"
                                        type="text"
                                        required
                                        tabIndex={6}
                                        name="company[document_number]"
                                        maxLength={255}
                                        placeholder="Ej. 12.345.678-9"
                                    />
                                    <InputError
                                        message={
                                            errors['company.document_number']
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="company-name">
                                        Nombre de la empresa
                                    </Label>
                                    <Input
                                        id="company-name"
                                        type="text"
                                        required
                                        tabIndex={7}
                                        name="company[name]"
                                        maxLength={255}
                                        placeholder="Razón social o nombre comercial"
                                    />
                                    <InputError
                                        message={errors['company.name']}
                                    />
                                </div>
                            </div>

                            <InputError message={errors.company} />

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={8}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{' '}
                            <TextLink href={login()} tabIndex={9}>
                                Iniciar sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crear una cuenta',
    description: 'Introduce tus datos para registrarte',
};
