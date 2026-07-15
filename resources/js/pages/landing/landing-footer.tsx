import { usePage } from '@inertiajs/react';

const navLinks = [
    { title: 'Producto', href: '#producto' },
    { title: 'Funcionalidades', href: '#modulos' },
    { title: 'Precios', href: '#precios' },
    { title: 'FAQ', href: '#faq' },
    { title: 'Equipo', href: '/equipo' },
];

export function LandingFooter() {
    const { name } = usePage().props;
    const year = new Date().getFullYear();

    return (
        <footer className="mx-auto w-full max-w-7xl rounded-t-lg bg-cyan-900 shadow">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:gap-0">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-200">
                        © {year} {name}. Todos los derechos reservados.
                    </p>
                    <p className="text-sm text-gray-200">ERP y web pública para clínicas veterinarias en Chile.</p>
                </div>
                <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-200">
                    {navLinks.map((item) => (
                        <li key={item.title}>
                            <a href={item.href} className="transition-colors hover:text-yellow-400">
                                {item.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    );
}
