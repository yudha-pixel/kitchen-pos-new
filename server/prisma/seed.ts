import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding local PostgreSQL database...');

  // Step 1: Clean old data
  console.log('🧹 Cleaning old data...');
  await prisma.productModifierGroup.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Old data cleaned');

  // Default admin account (change password after first login)
  const adminExists = await prisma.profile.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await prisma.profile.create({
      data: {
        username: 'admin',
        role: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log('✅ Created default admin user (username: admin, password: admin)');
  }

  // Step 2: Create Categories with colors
  const coffeeCategory = await prisma.category.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Coffee',
      color: 'brown',
    },
  });

  const nonCoffeeCategory = await prisma.category.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Non-Coffee',
      color: 'green',
    },
  });

  const foodCategory = await prisma.category.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Food',
      color: 'orange',
    },
  });

  const bakeryCategory = await prisma.category.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Bakery',
      color: 'yellow',
    },
  });

  console.log('✅ Created 4 categories (Coffee, Non-Coffee, Food, Bakery)');

  // Step 3: Create 3 Coffee Modifier Groups
  const temperatureGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Suhu Minuman',
      is_required: true,
      max_selections: 1,
    },
  });

  const sugarGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Tingkat Gula',
      is_required: true,
      max_selections: 1,
    },
  });

  const addonGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Tambahan Kopi',
      is_required: false,
      max_selections: 2,
    },
  });

  console.log('✅ Created 3 coffee modifier groups');

  // Step 3.5: Create Food and Snack Modifier Groups
  const spicinessGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Level Pedas',
      is_required: false,
      max_selections: 1,
    },
  });

  const foodToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Topping Makanan',
      is_required: false,
      max_selections: 4,
    },
  });

  const drinkSugarGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Level Gula',
      is_required: false,
      max_selections: 1,
    },
  });

  const iceGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Es Batu',
      is_required: false,
      max_selections: 1,
    },
  });

  const drinkToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Topping Minuman',
      is_required: false,
      max_selections: 4,
    },
  });

  const snackToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Topping Snack',
      is_required: false,
      max_selections: 3,
    },
  });

  console.log('✅ Created 6 food/drink/snack modifier groups');

  // Create modifiers for each group
  const temperatureModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: temperatureGroup.id, name: 'Hot', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: temperatureGroup.id, name: 'Iced', price_extra: 3000 },
    ],
  });

  const sugarModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: sugarGroup.id, name: 'Normal Sugar', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: sugarGroup.id, name: 'Less Sugar', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: sugarGroup.id, name: 'No Sugar', price_extra: 0 },
    ],
  });

  const addonModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: addonGroup.id, name: 'Extra Espresso Shot', price_extra: 5000 },
      { id: crypto.randomUUID(), modifier_group_id: addonGroup.id, name: 'Oat Milk Upgrade', price_extra: 8000 },
    ],
  });

  // Food modifiers
  const spicinessModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Tidak Pedas', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Sedikit Pedas', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Pedas', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Sangat Pedas', price_extra: 0 },
    ],
  });

  const foodToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Nasi', price_extra: 5000 },
      { id: crypto.randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Telur', price_extra: 3000 },
      { id: crypto.randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Ayam', price_extra: 8000 },
      { id: crypto.randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Kerupuk', price_extra: 2000 },
    ],
  });

  // Drink modifiers
  const drinkSugarModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Tanpa Gula', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Sedikit Gula', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Normal', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Extra Gula', price_extra: 0 },
    ],
  });

  const iceModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: iceGroup.id, name: 'Tanpa Es', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: iceGroup.id, name: 'Sedikit Es', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: iceGroup.id, name: 'Normal', price_extra: 0 },
      { id: crypto.randomUUID(), modifier_group_id: iceGroup.id, name: 'Extra Es', price_extra: 0 },
    ],
  });

  const drinkToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Jelly', price_extra: 3000 },
      { id: crypto.randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Puding', price_extra: 3000 },
      { id: crypto.randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Nata de Coco', price_extra: 3000 },
      { id: crypto.randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Susu Kental Manis', price_extra: 2000 },
    ],
  });

  // Snack modifiers
  const snackToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: crypto.randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Saus', price_extra: 2000 },
      { id: crypto.randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Mayones', price_extra: 2000 },
      { id: crypto.randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Keju Parut', price_extra: 3000 },
    ],
  });

  console.log('✅ Created modifiers for all groups');

  // Step 4: Create Products - Coffee Category
  const espressoDrinks = [
    { name: 'Espresso', sku: 'ESP-001', price: 18000, description: 'Strong and concentrated coffee shot', image: 'https://picsum.photos/seed/espresso/500/500' },
    { name: 'Americano', sku: 'AM-002', price: 25000, description: 'Espresso with hot water, smooth and bold', image: 'https://picsum.photos/seed/americano/500/500' },
    { name: 'Cappuccino', sku: 'CAP-003', price: 32000, description: 'Espresso with steamed milk and foam', image: 'https://picsum.photos/seed/cappuccino/500/500' },
    { name: 'Caffe Latte', sku: 'CL-004', price: 35000, description: 'Smooth espresso with steamed milk', image: 'https://picsum.photos/seed/caffelatte/500/500' },
    { name: 'Caramel Macchiato', sku: 'CM-005', price: 42000, description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle', image: 'https://picsum.photos/seed/caramelmacchiato/500/500' },
    { name: 'Mocha', sku: 'MOC-006', price: 38000, description: 'Espresso with chocolate and steamed milk', image: 'https://picsum.photos/seed/mocha/500/500' },
    { name: 'Flat White', sku: 'FW-007', price: 34000, description: 'Velvety smooth espresso with microfoam', image: 'https://picsum.photos/seed/flatwhite/500/500' },
    { name: 'Vienna Coffee', sku: 'VC-008', price: 36000, description: 'Espresso with whipped cream', image: 'https://picsum.photos/seed/viennacoffee/500/500' },
    { name: 'Irish Coffee', sku: 'IC-009', price: 40000, description: 'Coffee with Irish cream and whipped cream', image: 'https://picsum.photos/seed/irishcoffee/500/500' },
    { name: 'Affogato', sku: 'AF-010', price: 38000, description: 'Espresso poured over vanilla ice cream', image: 'https://picsum.photos/seed/affogato/500/500' },
  ];

  const coffeeProducts = await Promise.all(
    espressoDrinks.map((drink) =>
      prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          category_id: coffeeCategory.id,
          name: drink.name,
          description: drink.description,
          sku: drink.sku,
          price: drink.price,
          stock_quantity: 100,
          image_url: drink.image,
          productModifierGroups: {
            create: [
              { modifier_group_id: temperatureGroup.id },
              { modifier_group_id: sugarGroup.id },
              { modifier_group_id: addonGroup.id },
            ],
          },
        },
      })
    )
  );

  // Cold Coffee
  const coldCoffee = [
    { name: 'Iced Americano', sku: 'IAM-001', price: 28000, description: 'Chilled espresso with water, refreshing and bold', image: 'https://picsum.photos/seed/icedamericano/500/500' },
    { name: 'Iced Latte', sku: 'IL-002', price: 38000, description: 'Espresso with cold milk over ice', image: 'https://picsum.photos/seed/icedlatte/500/500' },
    { name: 'Cold Brew', sku: 'CB-003', price: 35000, description: 'Slow-steeped cold coffee, smooth and less acidic', image: 'https://picsum.photos/seed/coldbrew/500/500' },
    { name: 'Iced Caramel Macchiato', sku: 'ICM-004', price: 45000, description: 'Iced espresso with vanilla, milk, and caramel', image: 'https://picsum.photos/seed/icedcaramelmacchiato/500/500' },
    { name: 'Iced Mocha', sku: 'IM-005', price: 42000, description: 'Iced chocolate coffee with milk', image: 'https://picsum.photos/seed/icedmocha/500/500' },
    { name: 'Iced Cappuccino', sku: 'IC-006', price: 36000, description: 'Iced espresso with foamed milk', image: 'https://picsum.photos/seed/icedcappuccino/500/500' },
    { name: 'Nitro Cold Brew', sku: 'NCB-007', price: 40000, description: 'Cold brew infused with nitrogen for creamy texture', image: 'https://picsum.photos/seed/nitrocoldbrew/500/500' },
    { name: 'Iced Flat White', sku: 'IFW-008', price: 38000, description: 'Iced espresso with velvety microfoam', image: 'https://picsum.photos/seed/icedflatwhite/500/500' },
    { name: 'Vietnamese Iced Coffee', sku: 'VIC-009', price: 32000, description: 'Strong coffee with sweetened condensed milk', image: 'https://picsum.photos/seed/vietnameseicedcoffee/500/500' },
    { name: 'Iced Espresso Tonic', sku: 'IET-010', price: 35000, description: 'Espresso over tonic water with citrus notes', image: 'https://picsum.photos/seed/icedespressotonic/500/500' },
  ];

  const coldCoffeeProducts = await Promise.all(
    coldCoffee.map((drink) =>
      prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          category_id: coffeeCategory.id,
          name: drink.name,
          description: drink.description,
          sku: drink.sku,
          price: drink.price,
          stock_quantity: 80,
          image_url: drink.image,
          productModifierGroups: {
            create: [
              { modifier_group_id: sugarGroup.id },
              { modifier_group_id: iceGroup.id },
              { modifier_group_id: drinkToppingsGroup.id },
            ],
          },
        },
      })
    )
  );

  // Non-Coffee Category
  const nonCoffeeDrinks = [
    { name: 'Matcha Latte', sku: 'ML-001', price: 38000, description: 'Japanese green tea with steamed milk', image: 'https://picsum.photos/seed/matchalatte/500/500' },
    { name: 'Chai Latte', sku: 'CHL-002', price: 36000, description: 'Spiced tea with steamed milk', image: 'https://picsum.photos/seed/chailatte/500/500' },
    { name: 'Hot Chocolate', sku: 'HC-003', price: 32000, description: 'Rich chocolate drink with milk', image: 'https://picsum.photos/seed/hotchocolate/500/500' },
    { name: 'Iced Matcha Latte', sku: 'IML-004', price: 40000, description: 'Cold green tea with milk over ice', image: 'https://picsum.photos/seed/icedmatchalatte/500/500' },
    { name: 'Iced Chai Latte', sku: 'ICL-005', price: 38000, description: 'Cold spiced tea with milk over ice', image: 'https://picsum.photos/seed/icedchailatte/500/500' },
    { name: 'Iced Lemon Tea', sku: 'ILT-006', price: 28000, description: 'Refreshing tea with lemon over ice', image: 'https://picsum.photos/seed/icedlemontea/500/500' },
    { name: 'Iced Peach Tea', sku: 'IPT-007', price: 30000, description: 'Fruity peach tea over ice', image: 'https://picsum.photos/seed/icedpeachtea/500/500' },
    { name: 'Earl Grey Tea', sku: 'EGT-008', price: 28000, description: 'Classic bergamot-infused black tea', image: 'https://picsum.photos/seed/earlgreytea/500/500' },
    { name: 'Jasmine Tea', sku: 'JT-009', price: 26000, description: 'Fragrant jasmine-scented green tea', image: 'https://picsum.photos/seed/jasminetea/500/500' },
    { name: 'Thai Milk Tea', sku: 'TMT-010', price: 32000, description: 'Sweet Thai tea with condensed milk', image: 'https://picsum.photos/seed/thaimilktea/500/500' },
  ];

  const nonCoffeeProducts = await Promise.all(
    nonCoffeeDrinks.map((drink) =>
      prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          category_id: nonCoffeeCategory.id,
          name: drink.name,
          description: drink.description,
          sku: drink.sku,
          price: drink.price,
          stock_quantity: 70,
          image_url: drink.image,
          productModifierGroups: {
            create: [
              { modifier_group_id: drinkSugarGroup.id },
              { modifier_group_id: iceGroup.id },
              { modifier_group_id: drinkToppingsGroup.id },
            ],
          },
        },
      })
    )
  );

  // Food Category
  const foodItems = [
    { name: 'Nasi Goreng Spesial', sku: 'NG-001', price: 35000, description: 'Indonesian fried rice with egg and vegetables', image: 'https://picsum.photos/seed/nasigorengspesial/500/500' },
    { name: 'Mie Goreng Jawa', sku: 'MG-002', price: 32000, description: 'Javanese style fried noodles', image: 'https://picsum.photos/seed/miegorengjawa/500/500' },
    { name: 'Ayam Bakar', sku: 'AB-003', price: 38000, description: 'Grilled chicken with sweet soy sauce', image: 'https://picsum.photos/seed/ayambakar/500/500' },
    { name: 'Sate Ayam', sku: 'SA-004', price: 45000, description: 'Indonesian chicken skewers with peanut sauce', image: 'https://picsum.photos/seed/sateayam/500/500' },
    { name: 'Burger Cheese', sku: 'BC-005', price: 42000, description: 'Classic beef burger with melted cheese', image: 'https://picsum.photos/seed/burgercheese/500/500' },
    { name: 'Chicken Sandwich', sku: 'CS-006', price: 38000, description: 'Grilled chicken sandwich with vegetables', image: 'https://picsum.photos/seed/chickensandwich/500/500' },
    { name: 'Spaghetti Carbonara', sku: 'SC-007', price: 45000, description: 'Creamy pasta with bacon and parmesan', image: 'https://picsum.photos/seed/spaghetticarbonara/500/500' },
    { name: 'Beef Lasagna', sku: 'BL-008', price: 48000, description: 'Layered pasta with beef and cheese', image: 'https://picsum.photos/seed/beeflasagna/500/500' },
    { name: 'Fish and Chips', sku: 'FC-009', price: 42000, description: 'Battered fish with crispy fries', image: 'https://picsum.photos/seed/fishandchips/500/500' },
    { name: 'Caesar Salad', sku: 'CS-010', price: 35000, description: 'Fresh salad with romaine and croutons', image: 'https://picsum.photos/seed/caesarsalad/500/500' },
  ];

  const foodProducts = await Promise.all(
    foodItems.map((item) =>
      prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          category_id: foodCategory.id,
          name: item.name,
          description: item.description,
          sku: item.sku,
          price: item.price,
          stock_quantity: 50,
          image_url: item.image,
          productModifierGroups: {
            create: [
              { modifier_group_id: spicinessGroup.id },
              { modifier_group_id: foodToppingsGroup.id },
            ],
          },
        },
      })
    )
  );

  // Bakery Category
  const bakeryItems = [
    { name: 'Croissant Butter', sku: 'CR-001', price: 22000, description: 'Flaky butter croissant', image: 'https://picsum.photos/seed/croissantbutter/500/500' },
    { name: 'Croissant Almond', sku: 'CA-002', price: 28000, description: 'Almond-filled butter croissant', image: 'https://picsum.photos/seed/croissantalmond/500/500' },
    { name: 'Chocolate Muffin', sku: 'CM-003', price: 25000, description: 'Rich chocolate chip muffin', image: 'https://picsum.photos/seed/chocolatemuffin/500/500' },
    { name: 'Blueberry Muffin', sku: 'BM-004', price: 25000, description: 'Fresh blueberry muffin', image: 'https://picsum.photos/seed/blueberrymuffin/500/500' },
    { name: 'Cinnamon Roll', sku: 'CR-005', price: 28000, description: 'Sweet cinnamon roll with glaze', image: 'https://picsum.photos/seed/cinnamonroll/500/500' },
    { name: 'Cheesecake Slice', sku: 'CC-006', price: 35000, description: 'Creamy New York cheesecake', image: 'https://picsum.photos/seed/cheesecakeslice/500/500' },
    { name: 'Brownie', sku: 'BR-007', price: 22000, description: 'Fudgy chocolate brownie', image: 'https://picsum.photos/seed/brownie/500/500' },
    { name: 'Banana Bread', sku: 'BB-008', price: 25000, description: 'Moist banana bread with walnuts', image: 'https://picsum.photos/seed/bananabread/500/500' },
    { name: 'Red Velvet Cake', sku: 'RVC-009', price: 38000, description: 'Classic red velvet cake slice', image: 'https://picsum.photos/seed/redvelvetcake/500/500' },
    { name: 'Carrot Cake', sku: 'CC-010', price: 32000, description: 'Spiced carrot cake with cream cheese frosting', image: 'https://picsum.photos/seed/carrotcake/500/500' },
  ];

  const bakeryProducts = await Promise.all(
    bakeryItems.map((item) =>
      prisma.product.create({
        data: {
          id: crypto.randomUUID(),
          category_id: bakeryCategory.id,
          name: item.name,
          description: item.description,
          sku: item.sku,
          price: item.price,
          stock_quantity: 40,
          image_url: item.image,
        },
      })
    )
  );

  const totalProducts = coffeeProducts.length + coldCoffeeProducts.length + 
                        nonCoffeeProducts.length + foodProducts.length + bakeryProducts.length;
  console.log(`✅ Created ${totalProducts} products (${coffeeProducts.length} coffee, ${coldCoffeeProducts.length} cold coffee, ${nonCoffeeProducts.length} non-coffee, ${foodProducts.length} food, ${bakeryProducts.length} bakery)`);

  console.log('🎉 Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
