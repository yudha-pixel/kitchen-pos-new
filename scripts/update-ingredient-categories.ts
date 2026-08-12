import { prisma } from '../server/lib/prisma';

async function updateIngredientCategories() {
  const categoryMapping: Record<string, string> = {
    // Meat & Poultry
    'Bacon': 'Meat & Poultry',
    'Beef Steak': 'Meat & Poultry',
    'Chicken Breast': 'Meat & Poultry',
    'Eggs': 'Meat & Poultry',
    
    // Dairy & Cheese
    'Butter': 'Dairy & Cheese',
    'Cold Milk': 'Dairy & Cheese',
    'Condensed Milk': 'Dairy & Cheese',
    'Cream': 'Dairy & Cheese',
    'Cream Cheese': 'Dairy & Cheese',
    'Evaporated Milk': 'Dairy & Cheese',
    'Fresh Milk': 'Dairy & Cheese',
    'Mascarpone': 'Dairy & Cheese',
    'Milk Foam': 'Dairy & Cheese',
    'Parmesan Cheese': 'Dairy & Cheese',
    'Steamed Milk': 'Dairy & Cheese',
    'Whipped Cream': 'Dairy & Cheese',
    
    // Dry Goods & Baking
    'Cocoa Powder': 'Dry Goods & Baking',
    'Cracker': 'Dry Goods & Baking',
    'Flour': 'Dry Goods & Baking',
    'Ladyfingers': 'Dry Goods & Baking',
    'Salt': 'Dry Goods & Baking',
    'Sugar': 'Dry Goods & Baking',
    'Vanilla Ice Cream': 'Dry Goods & Baking',
    'Yeast': 'Dry Goods & Baking',
    
    // Beverage & Coffee
    'Black Tea': 'Beverage & Coffee',
    'Coffee Beans': 'Beverage & Coffee',
    'Jasmine Tea Leaves': 'Beverage & Coffee',
    'Matcha Powder': 'Beverage & Coffee',
    
    // Produce & Herbs
    'Garlic': 'Produce & Herbs',
    'Onion': 'Produce & Herbs',
    'Rosemary': 'Produce & Herbs',
    
    // Oils & Condiments
    'Chocolate Syrup': 'Oils & Condiments',
    'Oil': 'Oils & Condiments',
    'Soy Sauce': 'Oils & Condiments',
    'Vegetable Oil': 'Oils & Condiments',
    
    // Grains & Pasta
    'Rice': 'Grains & Pasta',
    'Spaghetti': 'Grains & Pasta',
    
    // Others
    'Cold Water': 'Others',
    'Hot Water': 'Others',
    'Ice': 'Others',
  };

  console.log('Updating ingredient categories...');
  
  const ingredients = await prisma.ingredient.findMany();
  console.log(`Found ${ingredients.length} ingredients in database`);
  
  let updatedCount = 0;
  
  for (const ingredient of ingredients) {
    const category = categoryMapping[ingredient.name];
    
    if (category) {
      await prisma.ingredient.update({
        where: { id: ingredient.id },
        data: { category },
      });
      console.log(`Updated ${ingredient.name} -> ${category}`);
      updatedCount++;
    } else {
      console.log(`No category mapping found for: ${ingredient.name}`);
    }
  }
  
  console.log(`Updated ${updatedCount} ingredients with categories`);
}

updateIngredientCategories()
  .catch((e) => {
    console.error('Error updating categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
