import {
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Box,
  ShoppingBag,
  Users,
  Tag,
  CalendarCheck,
  IdCard,
  Wallet,
  BarChart3,
  Settings,
  PackageOpen,
  ClipboardCheck,
  Tags,
  SlidersHorizontal,
  ArrowLeftRight,
  Truck,
  Workflow,
} from 'lucide-react';

// Shared between Header (breadcrumb icon) and Sidebar (module rail icon) so
// both render the same icon for a given AppDefinition.iconName.
export const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Box,
  ShoppingBag,
  Users,
  Tag,
  CalendarCheck,
  IdCard,
  Wallet,
  BarChart3,
  Settings,
};

export const NAVIGATION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  PackageOpen,
  ClipboardCheck,
  Tags,
  SlidersHorizontal,
  ArrowLeftRight,
  Truck,
  Workflow,
};
