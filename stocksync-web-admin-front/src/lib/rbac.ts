export type Role = 'admin' | 'stock_manager' | 'viewer';

export type MenuItem = {
    href: string;
    text: string;
    roles: Role[];
};

export const MENU_ITEMS: MenuItem[] = [
    { href: "/dashboard", text: "Home", roles: ['admin', 'stock_manager', 'viewer'] },
    { href: "/dashboard/produtos", text: "Produtos", roles: ['admin', 'stock_manager'] },
    { href: "/dashboard/fornecedores", text: "Fornecedores", roles: ['admin', 'stock_manager'] },
    { href: "/dashboard/categorias", text: "Categorias", roles: ['admin'] },
    { href: "/dashboard/estoque", text: "Estoque", roles: ['admin', 'stock_manager', 'viewer'] }
];

export function hasAccess(role: Role, href: string): boolean {
    const item = MENU_ITEMS.find(i => i.href === href);
    if (!item) return false; // Or true if public by default, but secure by default is better
    return item.roles.includes(role);
}

export function getMenuForRole(role: Role): MenuItem[] {
    return MENU_ITEMS.filter(item => item.roles.includes(role));
}
