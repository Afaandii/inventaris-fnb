import {
  LayoutDashboard,
  Boxes,
  Database,
  UtensilsCrossed,
  ChefHat,
  Truck,
  ReceiptText,
  CalendarCheck,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface SubMenuItem {
  id: string;
  title: string;
  path: string;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  items?: SubMenuItem[];
}

export interface MenuGroup {
  groupName: string;
  items: MenuItem[];
}

export const navigationData: MenuGroup[] = [
  {
    groupName: 'General',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupName: 'Master Data',
    items: [
      {
        id: 'master',
        title: 'Master Data',
        path: '/master',
        icon: Database,
        items: [
          { id: 'mst-categories', title: 'Categories', path: '/master/categories' },
          { id: 'mst-ingredients', title: 'Ingredients', path: '/master/ingredients' },
          { id: 'mst-outlets', title: 'Outlets', path: '/master/outlets' },
          { id: 'mst-warehouses', title: 'Warehouses', path: '/master/warehouses' },
          { id: 'mst-suppliers', title: 'Suppliers', path: '/master/suppliers' },
          { id: 'mst-units', title: 'Units', path: '/master/units' },
          { id: 'mst-roles', title: 'Roles', path: '/master/roles' },
          { id: 'mst-users', title: 'Users', path: '/master/users' },
        ],
      },
    ],
  },
  {
    groupName: 'Inventory',
    items: [
      {
        id: 'inventory',
        title: 'Inventory',
        path: '/inventory',
        icon: Boxes,
        items: [
          { id: 'inv-balances', title: 'Balances', path: '/inventory/stok-balances' },
          { id: 'inv-movements', title: 'Movements', path: '/inventory/stok-movements' },
          { id: 'inv-adjustments', title: 'Adjustments', path: '/inventory/stok-adjustments' },
          { id: 'inv-transfers', title: 'Transfers', path: '/inventory/stok-transfers' },
          { id: 'inv-opnames', title: 'Opnames', path: '/inventory/stok-opnames' },
          { id: 'inv-wastes', title: 'Wastes', path: '/inventory/wastes' },
        ],
      },
    ],
  },
  {
    groupName: 'Product',
    items: [
      {
        id: 'product',
        title: 'Product',
        path: '/product',
        icon: UtensilsCrossed,
        items: [
          { id: 'prod-menu-items', title: 'Menu Items', path: '/product/menu-items' },
          { id: 'prod-products', title: 'Products', path: '/product/products' },
          { id: 'prod-variants', title: 'Product Variants', path: '/product/product-variants' },
          { id: 'prod-recipes', title: 'Recipes', path: '/product/recipes' },
          { id: 'prod-recipe-items', title: 'Recipe Items', path: '/product/recipe-items' },
        ],
      },
    ],
  },
  {
    groupName: 'Production',
    items: [
      {
        id: 'production',
        title: 'Production',
        path: '/production',
        icon: ChefHat,
        items: [
          { id: 'prod-productions', title: 'Productions', path: '/production/productions' },
        ],
      },
    ],
  },
  {
    groupName: 'Purchasing',
    items: [
      {
        id: 'purchasing',
        title: 'Purchasing',
        path: '/purchasing',
        icon: Truck,
        items: [
          { id: 'pur-orders', title: 'Purchase Orders', path: '/purchasing/purchase-orders' },
          { id: 'pur-receipts', title: 'Good Receipts', path: '/purchasing/good-receipts' },
        ],
      },
    ],
  },
  {
    groupName: 'Sales',
    items: [
      {
        id: 'sales',
        title: 'Sales',
        path: '/sales',
        icon: ReceiptText,
        items: [
          { id: 'sales-orders', title: 'Sales Orders', path: '/sales/sales-orders' },
          { id: 'sales-items', title: 'Order Items', path: '/sales/sales-order-items' },
          { id: 'sales-payments', title: 'Payments', path: '/sales/payments' },
        ],
      },
    ],
  },
  {
    groupName: 'Reservations',
    items: [
      {
        id: 'reservations',
        title: 'Reservations',
        path: '/reservations',
        icon: CalendarCheck,
        items: [
          { id: 'res-tables', title: 'Dining Tables', path: '/reservations/dining-tables' },
          { id: 'res-reservation', title: 'Reservations', path: '/reservations/reservation' },
        ],
      },
    ],
  },
  {
    groupName: 'Reports',
    items: [
      {
        id: 'reports',
        title: 'Reports',
        path: '/reports',
        icon: BarChart3,
        items: [
          { id: 'rep-sales', title: 'Sales', path: '/reports/sales' },
          { id: 'rep-inventory', title: 'Inventory', path: '/reports/inventory' },
          { id: 'rep-purchasing', title: 'Purchasing', path: '/reports/purchasing' },
          { id: 'rep-production', title: 'Production', path: '/reports/production' },
          { id: 'rep-reservations', title: 'Reservations', path: '/reports/reservations' },
        ],
      },
    ],
  },
  {
    groupName: 'Settings',
    items: [
      {
        id: 'settings',
        title: 'Settings',
        path: '/settings',
        icon: Settings,
        items: [
          { id: 'set-store', title: 'Store', path: '/settings/store' },
          { id: 'set-security', title: 'Security', path: '/settings/security' },
        ],
      },
    ],
  },
];
