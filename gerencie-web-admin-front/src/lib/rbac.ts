export type Role = 'admin' | 'stock_manager' | 'viewer';

export type MenuItem = {
    href: string;
    text: string;
    roles: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
    { href: "/dashboard", text: "Home", roles: ['admin', 'stock_manager', 'viewer'] },
    { href: "/dashboard/produtos", text: "Produtos", roles: ['admin', 'stock_manager'] },
    { href: "/dashboard/estoque", text: "Estoque", roles: ['admin', 'stock_manager', 'viewer'] },
];

export const CADASTROS_ITEMS: MenuItem[] = [
    { href: "/dashboard/categorias", text: "Categorias", roles: ['admin'] },
    { href: "/dashboard/fornecedores", text: "Fornecedores", roles: ['admin', 'stock_manager'] },
    { href: "/dashboard/marcas", text: "Marcas", roles: ['admin', 'stock_manager'] },
];

export function hasAccess(role: Role, href: string): boolean {
    const all = [...MENU_ITEMS, ...CADASTROS_ITEMS];
    const item = all.find(i => i.href === href);
    if (!item) return false;
    return item.roles.includes(role);
}

export function getMenuForRole(role: Role): MenuItem[] {
    return MENU_ITEMS.filter(item => item.roles.includes(role));
}

export function getCadastrosForRole(role: Role): MenuItem[] {
    return CADASTROS_ITEMS.filter(item => item.roles.includes(role));
}
