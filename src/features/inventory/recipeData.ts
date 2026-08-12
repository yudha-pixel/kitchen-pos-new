/**
 * Comprehensive ingredient list and recipe mappings for 51 menu items
 * Based on provided commercial standard recipes
 */

export const comprehensiveIngredients = [
  // Rice & Grains
  {
    name: 'Beras',
    category: 'Grains & Pasta',
    current_stock: 2.0,
    unit: 'kg',
    min_stock: 50.0,
    unit_price: 15000,
  },
  // Meats
  {
    name: 'Daging Ayam',
    category: 'Meat & Poultry',
    current_stock: 4.0,
    unit: 'kg',
    min_stock: 20.0,
    unit_price: 45000,
  },
  {
    name: 'Daging Sapi',
    category: 'Meat & Poultry',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 10.0,
    unit_price: 120000,
  },
  {
    name: 'Daging Sapi Cincang',
    category: 'Meat & Poultry',
    current_stock: 1.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 130000,
  },
  {
    name: 'Daging Burger Sapi',
    category: 'Meat & Poultry',
    current_stock: 0.8,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 130000,
  },
  {
    name: 'Dada Ayam',
    category: 'Meat & Poultry',
    current_stock: 0.8,
    unit: 'kg',
    min_stock: 10.0,
    unit_price: 50000,
  },
  {
    name: 'Dada Ayam Crispy',
    category: 'Meat & Poultry',
    current_stock: 0.9,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 55000,
  },
  {
    name: 'Ayam Suwir',
    category: 'Meat & Poultry',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 48000,
  },
  {
    name: 'Daging Sapi Asap',
    category: 'Meat & Poultry',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 150000,
  },
  {
    name: 'Fillet Ikan Dory',
    category: 'Meat & Poultry',
    current_stock: 1.5,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 80000,
  },
  // Oils
  {
    name: 'Minyak Goreng',
    category: 'Oils & Condiments',
    current_stock: 2.55,
    unit: 'liter',
    min_stock: 10.0,
    unit_price: 20000,
  },
  {
    name: 'Minyak',
    category: 'Oils & Condiments',
    current_stock: 0.45,
    unit: 'liter',
    min_stock: 5.0,
    unit_price: 22000,
  },
  // Coffee
  {
    name: 'Biji Kopi',
    category: 'Beverage & Coffee',
    current_stock: 3.7,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 150000,
  },
  {
    name: 'Biji Kopi Murni',
    category: 'Beverage & Coffee',
    current_stock: 0.54,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 180000,
  },
  {
    name: 'Biji Kopi Kasar',
    category: 'Beverage & Coffee',
    current_stock: 1.0,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 160000,
  },
  {
    name: 'Biji Kopi Vietnam',
    category: 'Beverage & Coffee',
    current_stock: 0.2,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 170000,
  },
  // Dairy & Milk
  {
    name: 'Susu',
    category: 'Dairy & Cheese',
    current_stock: 20.3,
    unit: 'liter',
    min_stock: 20.0,
    unit_price: 25000,
  },
  {
    name: 'Susu Segar',
    category: 'Dairy & Cheese',
    current_stock: 4.1,
    unit: 'liter',
    min_stock: 20.0,
    unit_price: 28000,
  },
  {
    name: 'Susu Kental Manis',
    category: 'Dairy & Cheese',
    current_stock: 0.7,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 45000,
  },
  {
    name: 'Susu Evaporasi',
    category: 'Dairy & Cheese',
    current_stock: 0.3,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 35000,
  },
  {
    name: 'Krim Segar',
    category: 'Dairy & Cheese',
    current_stock: 0.3,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 40000,
  },
  {
    name: 'Krim Kocok',
    category: 'Dairy & Cheese',
    current_stock: 0.4,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 45000,
  },
  {
    name: 'Krim Susu',
    category: 'Dairy & Cheese',
    current_stock: 2.2,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 38000,
  },
  {
    name: 'Busa Susu',
    category: 'Dairy & Cheese',
    current_stock: 0.6,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 35000,
  },
  {
    name: 'Kuning Telur',
    category: 'Meat & Poultry',
    current_stock: 10.0,
    unit: 'butir',
    min_stock: 50.0,
    unit_price: 3000,
  },
  // Bakery
  {
    name: 'Tepung Terigu',
    category: 'Dry Goods & Baking',
    current_stock: 7.4,
    unit: 'kg',
    min_stock: 20.0,
    unit_price: 12000,
  },
  {
    name: 'Gula',
    category: 'Dry Goods & Baking',
    current_stock: 4.75,
    unit: 'kg',
    min_stock: 10.0,
    unit_price: 18000,
  },
  {
    name: 'Gula Cokelat',
    category: 'Dry Goods & Baking',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 25000,
  },
  {
    name: 'Mentega',
    category: 'Dairy & Cheese',
    current_stock: 2.25,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 45000,
  },
  {
    name: 'Mentega Berkualitas Tinggi',
    category: 'Dairy & Cheese',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 60000,
  },
  {
    name: 'Telur',
    category: 'Meat & Poultry',
    current_stock: 90.0,
    unit: 'butir',
    min_stock: 100.0,
    unit_price: 2500,
  },
  {
    name: 'Ragi',
    category: 'Dry Goods & Baking',
    current_stock: 0.02,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 30000,
  },
  // Cheese
  {
    name: 'Keju',
    category: 'Dairy & Cheese',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 80000,
  },
  {
    name: 'Keju Mozzarella',
    category: 'Dairy & Cheese',
    current_stock: 0.5,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 100000,
  },
  {
    name: 'Keju Parmesan',
    category: 'Dairy & Cheese',
    current_stock: 0.35,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 150000,
  },
  {
    name: 'Keju Slice',
    category: 'Dairy & Cheese',
    current_stock: 0.2,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 90000,
  },
  {
    name: 'Keju Krim',
    category: 'Dairy & Cheese',
    current_stock: 1.6,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 95000,
  },
  // Cream
  {
    name: 'Krim',
    category: 'Dairy & Cheese',
    current_stock: 0.0,
    unit: 'liter',
    min_stock: 5.0,
    unit_price: 35000,
  },
  {
    name: 'Krim Mentega',
    category: 'Dairy & Cheese',
    current_stock: 0.2,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 50000,
  },
  // Fruits
  {
    name: 'Pisang',
    category: 'Produce & Herbs',
    current_stock: 1.2,
    unit: 'kg',
    min_stock: 10.0,
    unit_price: 25000,
  },
  {
    name: 'Blueberry',
    category: 'Produce & Herbs',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 120000,
  },
  {
    name: 'Buah Blueberry',
    category: 'Produce & Herbs',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 120000,
  },
  {
    name: 'Jeruk',
    category: 'Produce & Herbs',
    current_stock: 1.5,
    unit: 'kg',
    min_stock: 10.0,
    unit_price: 20000,
  },
  {
    name: 'Wortel Parut',
    category: 'Produce & Herbs',
    current_stock: 0.6,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 15000,
  },
  {
    name: 'Buah Persik Potong',
    category: 'Produce & Herbs',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 60000,
  },
  // Vegetables
  {
    name: 'Selada',
    category: 'Produce & Herbs',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 20000,
  },
  {
    name: 'Selada Romaine',
    category: 'Produce & Herbs',
    current_stock: 1.0,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 25000,
  },
  {
    name: 'Sayuran',
    category: 'Produce & Herbs',
    current_stock: 0.5,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 18000,
  },
  {
    name: 'Kol',
    category: 'Produce & Herbs',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 15000,
  },
  // Pasta & Noodles
  {
    name: 'Lembaran Lasagna',
    category: 'Grains & Pasta',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 35000,
  },
  {
    name: 'Pasta Spaghetti',
    category: 'Grains & Pasta',
    current_stock: 1.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 25000,
  },
  {
    name: 'Mie Kuning',
    category: 'Grains & Pasta',
    current_stock: 2.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 20000,
  },
  {
    name: 'Mie Kering',
    category: 'Grains & Pasta',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 22000,
  },
  {
    name: 'Kentang Goreng',
    category: 'Produce & Herbs',
    current_stock: 1.0,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 30000,
  },
  // Bread & Bakery
  {
    name: 'Roti Burger',
    category: 'Dry Goods & Baking',
    current_stock: 10.0,
    unit: 'biji',
    min_stock: 10.0,
    unit_price: 5000,
  },
  {
    name: 'Roti Tawar',
    category: 'Dry Goods & Baking',
    current_stock: 20.0,
    unit: 'lembar',
    min_stock: 50.0,
    unit_price: 3000,
  },
  {
    name: 'Biskuit Regal',
    category: 'Dry Goods & Baking',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 45000,
  },
  {
    name: 'Adonan Croissant Puff',
    category: 'Dry Goods & Baking',
    current_stock: 0.8,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 40000,
  },
  {
    name: 'Crouton',
    category: 'Dry Goods & Baking',
    current_stock: 0.2,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 35000,
  },
  // Spices & Seasonings
  {
    name: 'Bumbu Dasar',
    category: 'Dry Goods & Baking',
    current_stock: 0.8,
    unit: 'kg',
    min_stock: 5.0,
    unit_price: 25000,
  },
  {
    name: 'Bumbu Spesial Jawa',
    category: 'Dry Goods & Baking',
    current_stock: 0.3,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 40000,
  },
  {
    name: 'Bumbu Kacang',
    category: 'Dry Goods & Baking',
    current_stock: 0.5,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 35000,
  },
  {
    name: 'Garam',
    category: 'Dry Goods & Baking',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 5000,
  },
  {
    name: 'Merica',
    category: 'Dry Goods & Baking',
    current_stock: 0.0,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 150000,
  },
  {
    name: 'Kecap Manis',
    category: 'Oils & Condiments',
    current_stock: 0.6,
    unit: 'liter',
    min_stock: 5.0,
    unit_price: 35000,
  },
  {
    name: 'Kayu Manis',
    category: 'Dry Goods & Baking',
    current_stock: 0.02,
    unit: 'kg',
    min_stock: 0.5,
    unit_price: 100000,
  },
  {
    name: 'Bubuk Kayu Manis',
    category: 'Dry Goods & Baking',
    current_stock: 0.03,
    unit: 'kg',
    min_stock: 0.5,
    unit_price: 120000,
  },
  // Tea
  {
    name: 'Teh Hitam',
    category: 'Beverage & Coffee',
    current_stock: 0.08,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 80000,
  },
  {
    name: 'Daun Teh Earl Grey',
    category: 'Beverage & Coffee',
    current_stock: 0.03,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 150000,
  },
  {
    name: 'Daun Teh Melati',
    category: 'Beverage & Coffee',
    current_stock: 0.03,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 120000,
  },
  {
    name: 'Teh Thailand',
    category: 'Beverage & Coffee',
    current_stock: 0.1,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 100000,
  },
  {
    name: 'Teh Rempah Chai',
    category: 'Beverage & Coffee',
    current_stock: 0.03,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 130000,
  },
  {
    name: 'Rempah Chai',
    category: 'Dry Goods & Baking',
    current_stock: 0.03,
    unit: 'kg',
    min_stock: 0.5,
    unit_price: 150000,
  },
  // Chocolate
  {
    name: 'Cokelat Bubuk',
    category: 'Dry Goods & Baking',
    current_stock: 0.87,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 80000,
  },
  {
    name: 'Cokelat',
    category: 'Dry Goods & Baking',
    current_stock: 0.5,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 90000,
  },
  // Syrups & Sauces
  {
    name: 'Sirup Karamel',
    category: 'Oils & Condiments',
    current_stock: 0.4,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 80000,
  },
  {
    name: 'Sirup Buah Persik',
    category: 'Oils & Condiments',
    current_stock: 0.25,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 75000,
  },
  {
    name: 'Saus Tomat',
    category: 'Oils & Condiments',
    current_stock: 0.6,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 30000,
  },
  {
    name: 'Saus',
    category: 'Oils & Condiments',
    current_stock: 0.2,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 35000,
  },
  {
    name: 'Dressing Caesar',
    category: 'Oils & Condiments',
    current_stock: 0.3,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 60000,
  },
  {
    name: 'Mayones',
    category: 'Oils & Condiments',
    current_stock: 0.2,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 40000,
  },
  // Ice Cream & Frozen
  {
    name: 'Es Krim Vanila',
    category: 'Dry Goods & Baking',
    current_stock: 0.5,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 60000,
  },
  {
    name: 'Es Batu',
    category: 'Others',
    current_stock: 12.5,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 5000,
  },
  // Nuts
  {
    name: 'Kacang Almond',
    category: 'Dry Goods & Baking',
    current_stock: 0.15,
    unit: 'kg',
    min_stock: 2.0,
    unit_price: 180000,
  },
  // Alcoholic
  {
    name: 'Whiskey Irlandia',
    category: 'Beverage & Coffee',
    current_stock: 0.3,
    unit: 'liter',
    min_stock: 2.0,
    unit_price: 400000,
  },
  // Others
  {
    name: 'Air',
    category: 'Others',
    current_stock: 7.2,
    unit: 'liter',
    min_stock: 100.0,
    unit_price: 5000,
  },
  {
    name: 'Air Panas',
    category: 'Others',
    current_stock: 4.0,
    unit: 'liter',
    min_stock: 100.0,
    unit_price: 5000,
  },
  {
    name: 'Air Dingin',
    category: 'Others',
    current_stock: 5.0,
    unit: 'liter',
    min_stock: 100.0,
    unit_price: 5000,
  },
  {
    name: 'Air Tonik',
    category: 'Beverage & Coffee',
    current_stock: 3.0,
    unit: 'liter',
    min_stock: 10.0,
    unit_price: 15000,
  },
  {
    name: 'Perasan Lemon',
    category: 'Oils & Condiments',
    current_stock: 0.2,
    unit: 'liter',
    min_stock: 3.0,
    unit_price: 40000,
  },
  {
    name: 'Bubuk Matcha',
    category: 'Beverage & Coffee',
    current_stock: 0.32,
    unit: 'kg',
    min_stock: 1.0,
    unit_price: 200000,
  },
  {
    name: 'Pewarna Merah Makanan',
    category: 'Dry Goods & Baking',
    current_stock: 0.05,
    unit: 'liter',
    min_stock: 0.5,
    unit_price: 50000,
  },
  {
    name: 'Tepung Bumbu',
    category: 'Dry Goods & Baking',
    current_stock: 0.4,
    unit: 'kg',
    min_stock: 3.0,
    unit_price: 30000,
  },
  {
    name: 'Tusuk Sate',
    category: 'Others',
    current_stock: 50.0,
    unit: 'tusuk',
    min_stock: 200.0,
    unit_price: 100,
  },
  {
    name: 'Gas Nitrogen',
    category: 'Others',
    current_stock: 0.1,
    unit: 'liter',
    min_stock: 20.0,
    unit_price: 10000,
  },
];

/**
 * Recipe mapping function - creates recipes for products based on their name
 * Returns array of recipe objects with ingredient quantities
 */
export function createRecipesForProduct(product: any, ingredientMap: Map<string, string>) {
  const recipes = [];
  const productName = product.name.toLowerCase();

  // Affogato: Biji Kopi (18 g), Susu (50 ml), Es Krim Vanila (50 g)
  if (productName.includes('affogato')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Krim Vanila')!, quantity_required: 0.05 });
  }
  // Americano: Biji Kopi (18 g), Air (120 ml)
  else if (productName.includes('americano')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Air')!, quantity_required: 0.12 });
  }
  // Ayam Bakar: Daging Ayam (200 g), Bumbu Dasar (30 g), Minyak Goreng (15 ml), Kecap Manis (20 ml)
  else if (productName.includes('ayam bakar')) {
    recipes.push({ ingredient_id: ingredientMap.get('Daging Ayam')!, quantity_required: 0.2 });
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Dasar')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak Goreng')!, quantity_required: 0.015 });
    recipes.push({ ingredient_id: ingredientMap.get('Kecap Manis')!, quantity_required: 0.02 });
  }
  // Banana Bread: Tepung Terigu (100 g), Pisang (120 g), Gula (50 g), Mentega (40 g), Telur (1 butir / 50 g)
  else if (productName.includes('banana bread')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Pisang')!, quantity_required: 0.12 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
  }
  // Beef Lasagna: Daging Sapi Cincang (100 g), Lembaran Lasagna (3 lembar / 40 g), Keju Mozzarella (50 g), Susu (100 ml), Saus Tomat (60 g)
  else if (productName.includes('lasagna')) {
    recipes.push({ ingredient_id: ingredientMap.get('Daging Sapi Cincang')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Lembaran Lasagna')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Keju Mozzarella')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Saus Tomat')!, quantity_required: 0.06 });
  }
  // Blueberry Muffin: Tepung Terigu (100 g), Buah Blueberry (30 g), Gula (40 g), Mentega (35 g), Telur (1 butir / 50 g)
  else if (productName.includes('blueberry muffin')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Buah Blueberry')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.035 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
  }
  // Brownie: Tepung Terigu (70 g), Cokelat Bubuk (25 g), Gula (80 g), Mentega (60 g), Telur (2 butir / 100 g)
  else if (productName.includes('brownie')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.07 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat Bubuk')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.08 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.06 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 2 });
  }
  // Burger Cheese: Roti Burger (1 buah / 60 g), Daging Burger Sapi (80 g), Keju Slice (1 lembar / 20 g), Selada (15 g), Saus (20 g)
  else if (productName.includes('burger cheese') || productName.includes('cheese burger')) {
    recipes.push({ ingredient_id: ingredientMap.get('Roti Burger')!, quantity_required: 1 });
    recipes.push({ ingredient_id: ingredientMap.get('Daging Burger Sapi')!, quantity_required: 0.08 });
    recipes.push({ ingredient_id: ingredientMap.get('Keju Slice')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Selada')!, quantity_required: 0.015 });
    recipes.push({ ingredient_id: ingredientMap.get('Saus')!, quantity_required: 0.02 });
  }
  // Caesar Salad: Selada Romaine (100 g), Dada Ayam (80 g), Dressing Caesar (30 ml), Keju Parmesan (15 g), Crouton (20 g)
  else if (productName.includes('caesar salad')) {
    recipes.push({ ingredient_id: ingredientMap.get('Selada Romaine')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Dada Ayam')!, quantity_required: 0.08 });
    recipes.push({ ingredient_id: ingredientMap.get('Dressing Caesar')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Keju Parmesan')!, quantity_required: 0.015 });
    recipes.push({ ingredient_id: ingredientMap.get('Crouton')!, quantity_required: 0.02 });
  }
  // Caffe Latte: Biji Kopi (18 g), Susu Segar (150 ml)
  else if (productName.includes('caffe latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Segar')!, quantity_required: 0.15 });
  }
  // Cappuccino: Biji Kopi (18 g), Susu Segar (120 ml), Busa Susu (30 ml)
  else if (productName.includes('cappuccino')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Segar')!, quantity_required: 0.12 });
    recipes.push({ ingredient_id: ingredientMap.get('Busa Susu')!, quantity_required: 0.03 });
  }
  // Caramel Macchiato: Biji Kopi (18 g), Susu Segar (140 ml), Sirup Karamel (20 ml)
  else if (productName.includes('caramel macchiato')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Segar')!, quantity_required: 0.14 });
    recipes.push({ ingredient_id: ingredientMap.get('Sirup Karamel')!, quantity_required: 0.02 });
  }
  // Carrot Cake: Tepung Terigu (90 g), Wortel Parut (60 g), Gula (60 g), Minyak (45 ml), Telur (1 butir / 50 g), Kayu Manis (2 g)
  else if (productName.includes('carrot cake')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.09 });
    recipes.push({ ingredient_id: ingredientMap.get('Wortel Parut')!, quantity_required: 0.06 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.06 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak')!, quantity_required: 0.045 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
    recipes.push({ ingredient_id: ingredientMap.get('Kayu Manis')!, quantity_required: 0.002 });
  }
  // Chai Latte: Teh Hitam (2 g), Susu (150 ml), Rempah Chai (3 g)
  else if (productName.includes('chai latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Teh Hitam')!, quantity_required: 0.002 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.15 });
    recipes.push({ ingredient_id: ingredientMap.get('Rempah Chai')!, quantity_required: 0.003 });
  }
  // Cheesecake Slice: Keju Krim (100 g), Biskuit Regal (40 g), Mentega (25 g), Gula (35 g), Telur (1 butir / 50 g)
  else if (productName.includes('cheesecake')) {
    recipes.push({ ingredient_id: ingredientMap.get('Keju Krim')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Biskuit Regal')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.035 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
  }
  // Chicken Sandwich: Roti Tawar (2 lembar / 60 g), Dada Ayam Crispy (90 g), Selada (15 g), Mayones (20 g)
  else if (productName.includes('chicken sandwich')) {
    recipes.push({ ingredient_id: ingredientMap.get('Roti Tawar')!, quantity_required: 2 });
    recipes.push({ ingredient_id: ingredientMap.get('Dada Ayam Crispy')!, quantity_required: 0.09 });
    recipes.push({ ingredient_id: ingredientMap.get('Selada')!, quantity_required: 0.015 });
    recipes.push({ ingredient_id: ingredientMap.get('Mayones')!, quantity_required: 0.02 });
  }
  // Chocolate Muffin: Tepung Terigu (90 g), Cokelat Bubuk (20 g), Gula (40 g), Mentega (35 g), Telur (1 butir / 50 g)
  else if (productName.includes('chocolate muffin')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.09 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat Bubuk')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.035 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
  }
  // Cinnamon Roll: Tepung Terigu (100 g), Bubuk Kayu Manis (3 g), Gula Cokelat (30 g), Mentega (30 g), Susu (50 ml)
  else if (productName.includes('cinnamon roll')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Bubuk Kayu Manis')!, quantity_required: 0.003 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula Cokelat')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.05 });
  }
  // Cold Brew: Biji Kopi Kasar (100 g), Air Dingin (500 ml)
  else if (productName.includes('cold brew')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi Kasar')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Air Dingin')!, quantity_required: 0.5 });
  }
  // Croissant Almond: Adonan Croissant Puff (1 buah / 80 g), Kacang Almond (15 g), Krim Mentega (20 g)
  else if (productName.includes('croissant almond')) {
    recipes.push({ ingredient_id: ingredientMap.get('Adonan Croissant Puff')!, quantity_required: 0.08 });
    recipes.push({ ingredient_id: ingredientMap.get('Kacang Almond')!, quantity_required: 0.015 });
    recipes.push({ ingredient_id: ingredientMap.get('Krim Mentega')!, quantity_required: 0.02 });
  }
  // Croissant Butter: Tepung Terigu (100 g), Mentega Berkualitas Tinggi (40 g), Ragi (2 g), Susu (40 ml)
  else if (productName.includes('croissant butter')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Mentega Berkualitas Tinggi')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Ragi')!, quantity_required: 0.002 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.04 });
  }
  // Earl Grey Tea: Daun Teh Earl Grey (3 g), Air Panas (200 ml)
  else if (productName.includes('earl grey')) {
    recipes.push({ ingredient_id: ingredientMap.get('Daun Teh Earl Grey')!, quantity_required: 0.003 });
    recipes.push({ ingredient_id: ingredientMap.get('Air Panas')!, quantity_required: 0.2 });
  }
  // Espresso: Biji Kopi Murni (18 g)
  else if (productName.includes('espresso')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi Murni')!, quantity_required: 0.018 });
  }
  // Fish and Chips: Fillet Ikan Dory (150 g), Kentang Goreng (100 g), Tepung Bumbu (40 g), Minyak Goreng (200 ml)
  else if (productName.includes('fish and chips')) {
    recipes.push({ ingredient_id: ingredientMap.get('Fillet Ikan Dory')!, quantity_required: 0.15 });
    recipes.push({ ingredient_id: ingredientMap.get('Kentang Goreng')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Bumbu')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak Goreng')!, quantity_required: 0.2 });
  }
  // Flat White: Biji Kopi (18 g), Susu Tekstur Halus / Microfoam (140 ml)
  else if (productName.includes('flat white')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Krim Susu')!, quantity_required: 0.14 });
  }
  // Hot Chocolate: Cokelat Bubuk (30 g), Susu (180 ml), Gula (15 g)
  else if (productName.includes('hot chocolate')) {
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat Bubuk')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.18 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.015 });
  }
  // Iced Americano: Biji Kopi (18 g), Air (100 ml), Es Batu (80 g)
  else if (productName.includes('iced americano')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Air')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.08 });
  }
  // Iced Cappuccino: Biji Kopi (18 g), Susu (100 ml), Es Batu (70 g), Busa Susu (30 ml)
  else if (productName.includes('iced cappuccino')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
    recipes.push({ ingredient_id: ingredientMap.get('Busa Susu')!, quantity_required: 0.03 });
  }
  // Iced Caramel Macchiato: Biji Kopi (18 g), Susu (120 ml), Sirup Karamel (20 ml), Es Batu (70 g)
  else if (productName.includes('iced caramel macchiato')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.12 });
    recipes.push({ ingredient_id: ingredientMap.get('Sirup Karamel')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Chai Latte: Teh Rempah Chai (3 g), Susu (130 ml), Es Batu (70 g)
  else if (productName.includes('iced chai latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Teh Rempah Chai')!, quantity_required: 0.003 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.13 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Espresso Tonic: Espresso (1 shot / 18 g), Air Tonik (150 ml), Es Batu (70 g)
  else if (productName.includes('iced espresso tonic')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi Murni')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Air Tonik')!, quantity_required: 0.15 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Flat White: Biji Kopi (18 g), Susu (120 ml), Es Batu (70 g)
  else if (productName.includes('iced flat white')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.12 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Latte: Biji Kopi (18 g), Susu (130 ml), Es Batu (70 g)
  else if (productName.includes('iced latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.13 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Lemon Tea: Teh Hitam (2 g), Perasan Lemon (20 ml), Gula (25 g), Es Batu (80 g)
  else if (productName.includes('iced lemon tea')) {
    recipes.push({ ingredient_id: ingredientMap.get('Teh Hitam')!, quantity_required: 0.002 });
    recipes.push({ ingredient_id: ingredientMap.get('Perasan Lemon')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.08 });
  }
  // Iced Matcha Latte: Bubuk Matcha (8 g), Susu (140 ml), Es Batu (70 g)
  else if (productName.includes('iced matcha latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Bubuk Matcha')!, quantity_required: 0.008 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.14 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Mocha: Biji Kopi (18 g), Cokelat (25 g), Susu (120 ml), Es Batu (70 g)
  else if (productName.includes('iced mocha')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.12 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Iced Peach Tea: Teh Hitam (2 g), Sirup Buah Persik (25 ml), Buah Persik Potong (30 g), Es Batu (80 g)
  else if (productName.includes('iced peach tea')) {
    recipes.push({ ingredient_id: ingredientMap.get('Teh Hitam')!, quantity_required: 0.002 });
    recipes.push({ ingredient_id: ingredientMap.get('Sirup Buah Persik')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Buah Persik Potong')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.08 });
  }
  // Irish Coffee: Biji Kopi (18 g), Whiskey Irlandia (30 ml), Krim Segar (30 ml), Gula (10 g)
  else if (productName.includes('irish coffee')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Whiskey Irlandia')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Krim Segar')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.01 });
  }
  // Jasmine Tea: Daun Teh Melati (3 g), Air Panas (200 ml)
  else if (productName.includes('jasmine tea')) {
    recipes.push({ ingredient_id: ingredientMap.get('Daun Teh Melati')!, quantity_required: 0.003 });
    recipes.push({ ingredient_id: ingredientMap.get('Air Panas')!, quantity_required: 0.2 });
  }
  // Matcha Latte: Bubuk Matcha (8 g), Susu (160 ml), Gula (15 g)
  else if (productName.includes('matcha latte')) {
    recipes.push({ ingredient_id: ingredientMap.get('Bubuk Matcha')!, quantity_required: 0.008 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.16 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.015 });
  }
  // Mie Goreng: Mie Kuning (100 g), Bumbu Dasar (25 g), Minyak Goreng (20 ml), Sayuran (50 g), Telur (1 butir / 50 g)
  else if (productName.includes('mie goreng') && !productName.includes('jawa')) {
    recipes.push({ ingredient_id: ingredientMap.get('Mie Kuning')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Dasar')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak Goreng')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Sayuran')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
  }
  // Mie Goreng Jawa: Mie Kuning (100 g), Bumbu Spesial Jawa (30 g), Ayam Suwir (40 g), Kol (30 g), Kecap Manis (20 ml)
  else if (productName.includes('mie goreng jawa')) {
    recipes.push({ ingredient_id: ingredientMap.get('Mie Kuning')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Spesial Jawa')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Ayam Suwir')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Kol')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Kecap Manis')!, quantity_required: 0.02 });
  }
  // Mocha: Biji Kopi (18 g), Cokelat (25 g), Susu (140 ml)
  else if (productName.includes('mocha') && !productName.includes('iced')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu')!, quantity_required: 0.14 });
  }
  // Nasi Goreng Spesial: Beras / Nasi (200 g), Bumbu Dasar (25 g), Daging Ayam (50 g), Telur (1 butir / 50 g), Minyak Goreng (20 ml)
  else if (productName.includes('nasi goreng')) {
    recipes.push({ ingredient_id: ingredientMap.get('Beras')!, quantity_required: 0.2 });
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Dasar')!, quantity_required: 0.025 });
    recipes.push({ ingredient_id: ingredientMap.get('Daging Ayam')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Telur')!, quantity_required: 1 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak Goreng')!, quantity_required: 0.02 });
  }
  // Nitro Cold Brew: Biji Kopi (100 g), Air (500 ml), Gas Nitrogen (secukupnya)
  else if (productName.includes('nitro cold brew')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Air')!, quantity_required: 0.5 });
    recipes.push({ ingredient_id: ingredientMap.get('Gas Nitrogen')!, quantity_required: 0.01 });
  }
  // Red Velvet Cake: Tepung Terigu (90 g), Pewarna Merah Makanan (5 ml), Cokelat Bubuk (10 g), Keju Krim (60 g), Gula (50 g)
  else if (productName.includes('red velvet')) {
    recipes.push({ ingredient_id: ingredientMap.get('Tepung Terigu')!, quantity_required: 0.09 });
    recipes.push({ ingredient_id: ingredientMap.get('Pewarna Merah Makanan')!, quantity_required: 0.005 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat Bubuk')!, quantity_required: 0.01 });
    recipes.push({ ingredient_id: ingredientMap.get('Keju Krim')!, quantity_required: 0.06 });
    recipes.push({ ingredient_id: ingredientMap.get('Gula')!, quantity_required: 0.05 });
  }
  // Sate Ayam: Daging Ayam (150 g), Bumbu Kacang (50 g), Kecap Manis (20 ml), Tusuk Sate (5 tusuk)
  else if (productName.includes('sate ayam')) {
    recipes.push({ ingredient_id: ingredientMap.get('Daging Ayam')!, quantity_required: 0.15 });
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Kacang')!, quantity_required: 0.05 });
    recipes.push({ ingredient_id: ingredientMap.get('Kecap Manis')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Tusuk Sate')!, quantity_required: 5 });
  }
  // Spaghetti Carbonara: Pasta Spaghetti (100 g), Krim Susu (80 ml), Keju Parmesan (20 g), Daging Sapi Asap (40 g), Kuning Telur (1 butir / 20 g)
  else if (productName.includes('spaghetti carbonara')) {
    recipes.push({ ingredient_id: ingredientMap.get('Pasta Spaghetti')!, quantity_required: 0.1 });
    recipes.push({ ingredient_id: ingredientMap.get('Krim Susu')!, quantity_required: 0.08 });
    recipes.push({ ingredient_id: ingredientMap.get('Keju Parmesan')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Daging Sapi Asap')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Kuning Telur')!, quantity_required: 1 });
  }
  // Thai Milk Tea: Teh Thailand (10 g), Susu Kental Manis (30 ml), Susu Evaporasi (30 ml), Es Batu (80 g)
  else if (productName.includes('thai milk tea')) {
    recipes.push({ ingredient_id: ingredientMap.get('Teh Thailand')!, quantity_required: 0.01 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Kental Manis')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Evaporasi')!, quantity_required: 0.03 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.08 });
  }
  // Vienna Coffee: Biji Kopi (18 g), Krim Kocok / Whipping Cream (40 g), Cokelat Bubuk (2 g)
  else if (productName.includes('vienna coffee')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi')!, quantity_required: 0.018 });
    recipes.push({ ingredient_id: ingredientMap.get('Krim Kocok')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Cokelat Bubuk')!, quantity_required: 0.002 });
  }
  // Vietnamese Iced Coffee: Biji Kopi Vietnam (20 g), Susu Kental Manis (40 ml), Es Batu (70 g)
  else if (productName.includes('vietnamese iced coffee')) {
    recipes.push({ ingredient_id: ingredientMap.get('Biji Kopi Vietnam')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Susu Kental Manis')!, quantity_required: 0.04 });
    recipes.push({ ingredient_id: ingredientMap.get('Es Batu')!, quantity_required: 0.07 });
  }
  // Default for unknown items
  else {
    recipes.push({ ingredient_id: ingredientMap.get('Bumbu Dasar')!, quantity_required: 0.02 });
    recipes.push({ ingredient_id: ingredientMap.get('Minyak Goreng')!, quantity_required: 0.03 });
  }

  return recipes;
}
