// Script to calculate ingredient stock based on 51 products with 10 portions each

const ingredientUsage = {};

// Recipe data extracted from recipeData.ts
const recipes = [
  // Affogato
  { product: 'Affogato', ingredients: { 'Biji Kopi': 0.018, 'Susu': 0.05, 'Es Krim Vanila': 0.05 } },
  // Americano
  { product: 'Americano', ingredients: { 'Biji Kopi': 0.018, 'Air': 0.12 } },
  // Ayam Bakar
  { product: 'Ayam Bakar', ingredients: { 'Daging Ayam': 0.2, 'Bumbu Dasar': 0.03, 'Minyak Goreng': 0.015, 'Kecap Manis': 0.02 } },
  // Banana Bread
  { product: 'Banana Bread', ingredients: { 'Tepung Terigu': 0.1, 'Pisang': 0.12, 'Gula': 0.05, 'Mentega': 0.04, 'Telur': 1 } },
  // Beef Lasagna
  { product: 'Beef Lasagna', ingredients: { 'Daging Sapi Cincang': 0.1, 'Lembaran Lasagna': 0.04, 'Keju Mozzarella': 0.05, 'Susu': 0.1, 'Saus Tomat': 0.06 } },
  // Blueberry Muffin
  { product: 'Blueberry Muffin', ingredients: { 'Tepung Terigu': 0.1, 'Buah Blueberry': 0.03, 'Gula': 0.04, 'Mentega': 0.035, 'Telur': 1 } },
  // Brownie
  { product: 'Brownie', ingredients: { 'Tepung Terigu': 0.07, 'Cokelat Bubuk': 0.025, 'Gula': 0.08, 'Mentega': 0.06, 'Telur': 2 } },
  // Burger Cheese
  { product: 'Burger Cheese', ingredients: { 'Roti Burger': 1, 'Daging Burger Sapi': 0.08, 'Keju Slice': 0.02, 'Selada': 0.015, 'Saus': 0.02 } },
  // Caesar Salad
  { product: 'Caesar Salad', ingredients: { 'Selada Romaine': 0.1, 'Dada Ayam': 0.08, 'Dressing Caesar': 0.03, 'Keju Parmesan': 0.015, 'Crouton': 0.02 } },
  // Caffe Latte
  { product: 'Caffe Latte', ingredients: { 'Biji Kopi': 0.018, 'Susu Segar': 0.15 } },
  // Cappuccino
  { product: 'Cappuccino', ingredients: { 'Biji Kopi': 0.018, 'Susu Segar': 0.12, 'Busa Susu': 0.03 } },
  // Caramel Macchiato
  { product: 'Caramel Macchiato', ingredients: { 'Biji Kopi': 0.018, 'Susu Segar': 0.14, 'Sirup Karamel': 0.02 } },
  // Carrot Cake
  { product: 'Carrot Cake', ingredients: { 'Tepung Terigu': 0.09, 'Wortel Parut': 0.06, 'Gula': 0.06, 'Minyak': 0.045, 'Telur': 1, 'Kayu Manis': 0.002 } },
  // Chai Latte
  { product: 'Chai Latte', ingredients: { 'Teh Hitam': 0.002, 'Susu': 0.15, 'Rempah Chai': 0.003 } },
  // Cheesecake Slice
  { product: 'Cheesecake Slice', ingredients: { 'Keju Krim': 0.1, 'Biskuit Regal': 0.04, 'Mentega': 0.025, 'Gula': 0.035, 'Telur': 1 } },
  // Chicken Sandwich
  { product: 'Chicken Sandwich', ingredients: { 'Roti Tawar': 2, 'Dada Ayam Crispy': 0.09, 'Selada': 0.015, 'Mayones': 0.02 } },
  // Chocolate Muffin
  { product: 'Chocolate Muffin', ingredients: { 'Tepung Terigu': 0.09, 'Cokelat Bubuk': 0.02, 'Gula': 0.04, 'Mentega': 0.035, 'Telur': 1 } },
  // Cinnamon Roll
  { product: 'Cinnamon Roll', ingredients: { 'Tepung Terigu': 0.1, 'Bubuk Kayu Manis': 0.003, 'Gula Cokelat': 0.03, 'Mentega': 0.03, 'Susu': 0.05 } },
  // Cold Brew
  { product: 'Cold Brew', ingredients: { 'Biji Kopi Kasar': 0.1, 'Air Dingin': 0.5 } },
  // Croissant Almond
  { product: 'Croissant Almond', ingredients: { 'Adonan Croissant Puff': 0.08, 'Kacang Almond': 0.015, 'Krim Mentega': 0.02 } },
  // Croissant Butter
  { product: 'Croissant Butter', ingredients: { 'Tepung Terigu': 0.1, 'Mentega Berkualitas Tinggi': 0.04, 'Ragi': 0.002, 'Susu': 0.04 } },
  // Earl Grey Tea
  { product: 'Earl Grey Tea', ingredients: { 'Daun Teh Earl Grey': 0.003, 'Air Panas': 0.2 } },
  // Espresso
  { product: 'Espresso', ingredients: { 'Biji Kopi Murni': 0.018 } },
  // Fish and Chips
  { product: 'Fish and Chips', ingredients: { 'Fillet Ikan Dory': 0.15, 'Kentang Goreng': 0.1, 'Tepung Bumbu': 0.04, 'Minyak Goreng': 0.2 } },
  // Flat White
  { product: 'Flat White', ingredients: { 'Biji Kopi': 0.018, 'Krim Susu': 0.14 } },
  // Hot Chocolate
  { product: 'Hot Chocolate', ingredients: { 'Cokelat Bubuk': 0.03, 'Susu': 0.18, 'Gula': 0.015 } },
  // Iced Americano
  { product: 'Iced Americano', ingredients: { 'Biji Kopi': 0.018, 'Air': 0.1, 'Es Batu': 0.08 } },
  // Iced Cappuccino
  { product: 'Iced Cappuccino', ingredients: { 'Biji Kopi': 0.018, 'Susu': 0.1, 'Es Batu': 0.07, 'Busa Susu': 0.03 } },
  // Iced Caramel Macchiato
  { product: 'Iced Caramel Macchiato', ingredients: { 'Biji Kopi': 0.018, 'Susu': 0.12, 'Sirup Karamel': 0.02, 'Es Batu': 0.07 } },
  // Iced Chai Latte
  { product: 'Iced Chai Latte', ingredients: { 'Teh Rempah Chai': 0.003, 'Susu': 0.13, 'Es Batu': 0.07 } },
  // Iced Espresso Tonic
  { product: 'Iced Espresso Tonic', ingredients: { 'Biji Kopi Murni': 0.018, 'Air Tonik': 0.15, 'Es Batu': 0.07 } },
  // Iced Flat White
  { product: 'Iced Flat White', ingredients: { 'Biji Kopi': 0.018, 'Susu': 0.12, 'Es Batu': 0.07 } },
  // Iced Latte
  { product: 'Iced Latte', ingredients: { 'Biji Kopi': 0.018, 'Susu': 0.13, 'Es Batu': 0.07 } },
  // Iced Lemon Tea
  { product: 'Iced Lemon Tea', ingredients: { 'Teh Hitam': 0.002, 'Perasan Lemon': 0.02, 'Gula': 0.025, 'Es Batu': 0.08 } },
  // Iced Matcha Latte
  { product: 'Iced Matcha Latte', ingredients: { 'Bubuk Matcha': 0.008, 'Susu': 0.14, 'Es Batu': 0.07 } },
  // Iced Mocha
  { product: 'Iced Mocha', ingredients: { 'Biji Kopi': 0.018, 'Cokelat': 0.025, 'Susu': 0.12, 'Es Batu': 0.07 } },
  // Iced Peach Tea
  { product: 'Iced Peach Tea', ingredients: { 'Teh Hitam': 0.002, 'Sirup Buah Persik': 0.025, 'Buah Persik Potong': 0.03, 'Es Batu': 0.08 } },
  // Irish Coffee
  { product: 'Irish Coffee', ingredients: { 'Biji Kopi': 0.018, 'Whiskey Irlandia': 0.03, 'Krim Segar': 0.03, 'Gula': 0.01 } },
  // Jasmine Tea
  { product: 'Jasmine Tea', ingredients: { 'Daun Teh Melati': 0.003, 'Air Panas': 0.2 } },
  // Matcha Latte
  { product: 'Matcha Latte', ingredients: { 'Bubuk Matcha': 0.008, 'Susu': 0.16, 'Gula': 0.015 } },
  // Mie Goreng
  { product: 'Mie Goreng', ingredients: { 'Mie Kuning': 0.1, 'Bumbu Dasar': 0.025, 'Minyak Goreng': 0.02, 'Sayuran': 0.05, 'Telur': 1 } },
  // Mie Goreng Jawa
  { product: 'Mie Goreng Jawa', ingredients: { 'Mie Kuning': 0.1, 'Bumbu Spesial Jawa': 0.03, 'Ayam Suwir': 0.04, 'Kol': 0.03, 'Kecap Manis': 0.02 } },
  // Mocha
  { product: 'Mocha', ingredients: { 'Biji Kopi': 0.018, 'Cokelat': 0.025, 'Susu': 0.14 } },
  // Nasi Goreng Spesial
  { product: 'Nasi Goreng Spesial', ingredients: { 'Beras': 0.2, 'Bumbu Dasar': 0.025, 'Daging Ayam': 0.05, 'Telur': 1, 'Minyak Goreng': 0.02 } },
  // Nitro Cold Brew
  { product: 'Nitro Cold Brew', ingredients: { 'Biji Kopi': 0.1, 'Air': 0.5, 'Gas Nitrogen': 0.01 } },
  // Red Velvet Cake
  { product: 'Red Velvet Cake', ingredients: { 'Tepung Terigu': 0.09, 'Pewarna Merah Makanan': 0.005, 'Cokelat Bubuk': 0.01, 'Keju Krim': 0.06, 'Gula': 0.05 } },
  // Sate Ayam
  { product: 'Sate Ayam', ingredients: { 'Daging Ayam': 0.15, 'Bumbu Kacang': 0.05, 'Kecap Manis': 0.02, 'Tusuk Sate': 5 } },
  // Spaghetti Carbonara
  { product: 'Spaghetti Carbonara', ingredients: { 'Pasta Spaghetti': 0.1, 'Krim Susu': 0.08, 'Keju Parmesan': 0.02, 'Daging Sapi Asap': 0.04, 'Kuning Telur': 1 } },
  // Thai Milk Tea
  { product: 'Thai Milk Tea', ingredients: { 'Teh Thailand': 0.01, 'Susu Kental Manis': 0.03, 'Susu Evaporasi': 0.03, 'Es Batu': 0.08 } },
  // Vienna Coffee
  { product: 'Vienna Coffee', ingredients: { 'Biji Kopi': 0.018, 'Krim Kocok': 0.04, 'Cokelat Bubuk': 0.002 } },
  // Vietnamese Iced Coffee
  { product: 'Vietnamese Iced Coffee', ingredients: { 'Biji Kopi Vietnam': 0.02, 'Susu Kental Manis': 0.04, 'Es Batu': 0.07 } },
  // Es Teh Manis
  { product: 'Es Teh Manis', ingredients: { 'Teh Hitam': 0.002, 'Gula': 0.02, 'Es Batu': 0.08 } },
  // Jus Jeruk Segar
  { product: 'Jus Jeruk Segar', ingredients: { 'Jeruk': 0.15, 'Gula': 0.02, 'Es Batu': 0.08 } },
  // Iced Matcha Latte (additional)
  { product: 'Iced Matcha Latte', ingredients: { 'Bubuk Matcha': 0.008, 'Susu': 0.14, 'Es Batu': 0.07 } },
  // Iced Espresso Tonic (additional)
  { product: 'Iced Espresso Tonic', ingredients: { 'Biji Kopi Murni': 0.018, 'Air Tonik': 0.15, 'Es Batu': 0.07 } },
  // Matcha Latte (additional)
  { product: 'Matcha Latte', ingredients: { 'Bubuk Matcha': 0.008, 'Susu': 0.16, 'Gula': 0.015 } },
];

// Calculate total usage per ingredient
recipes.forEach(recipe => {
  Object.entries(recipe.ingredients).forEach(([ingredient, quantity]) => {
    if (!ingredientUsage[ingredient]) {
      ingredientUsage[ingredient] = 0;
    }
    ingredientUsage[ingredient] += quantity;
  });
});

// Multiply by 10 (portions per product)
const portionsPerProduct = 10;
Object.keys(ingredientUsage).forEach(ingredient => {
  ingredientUsage[ingredient] *= portionsPerProduct;
});

// Output results
console.log('Ingredient Stock Calculation for 51 Products × 10 Portions:');
console.log('================================================================');
Object.entries(ingredientUsage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([ingredient, quantity]) => {
    console.log(`${ingredient}: ${quantity.toFixed(3)}`);
  });
console.log('================================================================');
console.log(`Total unique ingredients: ${Object.keys(ingredientUsage).length}`);
