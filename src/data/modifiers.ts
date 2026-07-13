export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

export const modifierMapping: Record<string, ModifierGroup[]> = {
  makanan: [
    {
      id: 'spiciness',
      name: 'Level Pedas',
      required: false,
      multiSelect: false,
      options: [
        { id: 'spicy-1', name: 'Tidak Pedas', price: 0 },
        { id: 'spicy-2', name: 'Sedikit Pedas', price: 0 },
        { id: 'spicy-3', name: 'Pedas', price: 0 },
        { id: 'spicy-4', name: 'Sangat Pedas', price: 0 },
      ],
    },
    {
      id: 'food-toppings',
      name: 'Topping Makanan',
      required: false,
      multiSelect: true,
      options: [
        { id: 'topping-1', name: 'Extra Nasi', price: 5000 },
        { id: 'topping-2', name: 'Extra Telur', price: 3000 },
        { id: 'topping-3', name: 'Extra Ayam', price: 8000 },
        { id: 'topping-4', name: 'Kerupuk', price: 2000 },
      ],
    },
  ],
  minuman: [
    {
      id: 'sugar-level',
      name: 'Level Gula',
      required: false,
      multiSelect: false,
      options: [
        { id: 'sugar-1', name: 'Tanpa Gula', price: 0 },
        { id: 'sugar-2', name: 'Sedikit Gula', price: 0 },
        { id: 'sugar-3', name: 'Normal', price: 0 },
        { id: 'sugar-4', name: 'Extra Gula', price: 0 },
      ],
    },
    {
      id: 'ice',
      name: 'Es Batu',
      required: false,
      multiSelect: false,
      options: [
        { id: 'ice-1', name: 'Tanpa Es', price: 0 },
        { id: 'ice-2', name: 'Sedikit Es', price: 0 },
        { id: 'ice-3', name: 'Normal', price: 0 },
        { id: 'ice-4', name: 'Extra Es', price: 0 },
      ],
    },
    {
      id: 'drink-toppings',
      name: 'Topping Minuman',
      required: false,
      multiSelect: true,
      options: [
        { id: 'drink-top-1', name: 'Jelly', price: 3000 },
        { id: 'drink-top-2', name: 'Puding', price: 3000 },
        { id: 'drink-top-3', name: 'Nata de Coco', price: 3000 },
        { id: 'drink-top-4', name: 'Susu Kental Manis', price: 2000 },
      ],
    },
  ],
  snack: [
    {
      id: 'snack-toppings',
      name: 'Topping Snack',
      required: false,
      multiSelect: true,
      options: [
        { id: 'snack-top-1', name: 'Saus', price: 2000 },
        { id: 'snack-top-2', name: 'Mayones', price: 2000 },
        { id: 'snack-top-3', name: 'Keju Parut', price: 3000 },
      ],
    },
  ],
};

export const getModifiersByCategory = (category: string): ModifierGroup[] => {
  if (!category) return [];

  const normalizedCategory = category.toLowerCase().trim();

  // Map common variations to standard keys
  const categoryMap: Record<string, string> = {
    'makanan': 'makanan',
    'food': 'makanan',
    'minuman': 'minuman',
    'drink': 'minuman',
    'beverage': 'minuman',
    'snack': 'snack',
    'snacks': 'snack',
  };

  const mappedCategory = categoryMap[normalizedCategory] || normalizedCategory;
  return modifierMapping[mappedCategory] || [];
};

// Convert data modifiers to UI format with selected property
export const convertToUIModifiers = (groups: ModifierGroup[]): any[] => {
  return groups.map(group => ({
    ...group,
    options: group.options.map(option => ({
      ...option,
      selected: false
    }))
  }));
};
