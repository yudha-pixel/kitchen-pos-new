import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { synchronizePermissionCatalog } from '../lib/permissionBackfill';
import { createStockLog } from '../lib/inventoryService';

async function main() {
  console.log('🌱 Seeding local PostgreSQL database...');

  // Step 1: Clean old data (respect foreign key constraints)
  console.log('🧹 Cleaning old data...');
  await prisma.customerOrderItem.deleteMany();
  await prisma.customerOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.productModifierGroup.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Old data cleaned');

  // Step 1.1: Create roles if they don't exist
  const roles = ['admin', 'cashier', 'management', 'owner'];
  for (const roleName of roles) {
    const roleExists = await prisma.role.findUnique({ where: { name: roleName } });
    if (!roleExists) {
      await prisma.role.create({
        data: {
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
          is_system: true,
        },
      });
      console.log(`✅ Created ${roleName} role`);
    }
  }

  // Step 1.2: Reconcile the shared catalog for system roles only.
  await synchronizePermissionCatalog(prisma, { dryRun: false });
  console.log('✅ Synchronized permission catalog and system-role mappings');

  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Kitchen POS',
      phone: '0812-3456-7890',
      email: 'support@kitchenpos.id',
      website: 'https://kitchenpos.id',
      address: 'Jl. Jendral Sudirman No. 123, Jakarta Selatan, DKI Jakarta 12190',
      tax_id: '01.234.567.8-012.000',
      company_registry: 'AHU-0012345.AH.01.01.TAHUN.2024',
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      tax_rate: 10,
      service_charge: 5,
    },
  });

  // Step 1.4: Create default outlets
  const outlet1 = await prisma.outlet.upsert({
    where: { code: 'OUT-001' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Outlet Pusat',
      code: 'OUT-001',
      address: 'Jl. Jendral Sudirman No. 1, Jakarta',
      phone: '021-12345678',
      is_active: true,
      company_id: company.id,
    },
  });
  console.log('✅ Created default outlet: OUT-001');

  // Step 1.5: Create test users
  const testUsers = [
    { username: 'admin', password: 'admin', full_name: 'System Administrator', role: 'admin', outlet: 'OUT-001' },
    { username: 'cashier', password: 'cashier123', full_name: 'Cashier User', role: 'cashier', outlet: 'OUT-001' },
    { username: 'manager', password: 'manager123', full_name: 'Manager User', role: 'management', outlet: 'OUT-001' },
    { username: 'owner', password: 'owner123', full_name: 'Owner User', role: 'owner', outlet: 'OUT-001' },
    { username: 'admin2', password: 'admin123', full_name: 'Second Admin', role: 'admin', outlet: 'OUT-001' },
  ];

  const defaultPreferences = {
    favorites: ['/pos', '/products', '/settings'],
    recent: [
      { route: '/pos', title: 'Point of Sale', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { route: '/products', title: 'Menu & Products', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    ],
  };

  for (const user of testUsers) {
    const userExists = await prisma.profile.findUnique({ where: { username: user.username } });
    if (!userExists) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const role = await prisma.role.findUnique({ where: { name: user.role } });
      const outlet = await prisma.outlet.findUnique({ where: { code: user.outlet } });
      
      await prisma.profile.create({
        data: {
          username: user.username,
          full_name: user.full_name,
          role_id: role!.id,
          outlet_id: outlet!.id,
          password_hash: passwordHash,
          is_active: true,
        },
      });
      console.log(`✅ Created test user: ${user.username} (${user.role})`);
    }

    // Seed demo Recent/Favorites preferences for this user
    const preferencesJson = JSON.stringify(defaultPreferences);
    await prisma.$executeRaw`UPDATE "profiles" SET "preferences" = ${preferencesJson}::jsonb WHERE "username" = ${user.username}`;
    console.log(`✅ Seeded preferences for: ${user.username}`);
  }

  // Create additional outlets
  const outlet2 = await prisma.outlet.upsert({
    where: { code: 'OUT-002' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Outlet Cabang Senopati',
      code: 'OUT-002',
      address: 'Jl. Senopati Raya No. 45, Jakarta Selatan',
      phone: '021-87654321',
      is_active: true,
      company_id: company.id,
    },
  });

  const outlet3 = await prisma.outlet.upsert({
    where: { code: 'OUT-003' },
    update: {},
    create: {
      id: randomUUID(),
      name: 'Outlet Cabang BSD',
      code: 'OUT-003',
      address: 'Jl. BSD City Raya No. 78, Tangerang',
      phone: '021-55555555',
      is_active: true,
      company_id: company.id,
    },
  });

  console.log('✅ Created 3 default outlets (Pusat, Senopati, BSD)');

  // Dine-in tables for /pos/meja and the QR self-order links at /order/[tableId]
  for (let i = 1; i <= 8; i++) {
    await prisma.table.upsert({
      where: { table_number: `Meja ${i}` },
      update: {},
      create: {
        id: randomUUID(),
        table_number: `Meja ${i}`,
        outlet_id: outlet1.id,
        status: 'available',
        is_active: true,
      },
    });
  }

  console.log('✅ Created 8 dine-in tables (Meja 1-8) for Outlet Pusat');

  // Step 2: Create Categories with colors
  const makananUtamaCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Makanan Utama',
      color: 'orange',
    },
  });

  const minumanCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Minuman',
      color: 'blue',
    },
  });

  const dessertCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Dessert',
      color: 'pink',
    },
  });

  const kopiCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Kopi',
      color: 'brown',
    },
  });

  const tehCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Teh',
      color: 'green',
    },
  });

  const bakeryCategory = await prisma.category.create({
    data: {
      id: randomUUID(),
      name: 'Bakery',
      color: 'yellow',
    },
  });

  console.log('✅ Created 6 categories (Makanan Utama, Minuman, Dessert, Kopi, Teh, Bakery)');

  // Step 3: Create 3 Coffee Modifier Groups
  const temperatureGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Suhu Minuman',
      is_required: true,
      max_selections: 1,
    },
  });

  const sugarGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Tingkat Gula',
      is_required: true,
      max_selections: 1,
    },
  });

  const addonGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Tambahan Kopi',
      is_required: false,
      max_selections: 2,
    },
  });

  console.log('✅ Created 3 coffee modifier groups');

  // Step 3.5: Create Food and Snack Modifier Groups
  const spicinessGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Level Pedas',
      is_required: false,
      max_selections: 1,
    },
  });

  const foodToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Topping Makanan',
      is_required: false,
      max_selections: 4,
    },
  });

  const drinkSugarGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Level Gula',
      is_required: false,
      max_selections: 1,
    },
  });

  const iceGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Es Batu',
      is_required: false,
      max_selections: 1,
    },
  });

  const drinkToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Topping Minuman',
      is_required: false,
      max_selections: 4,
    },
  });

  const snackToppingsGroup = await prisma.modifierGroup.create({
    data: {
      id: randomUUID(),
      name: 'Topping Snack',
      is_required: false,
      max_selections: 3,
    },
  });

  console.log('✅ Created 6 food/drink/snack modifier groups');

  // Create modifiers for each group
  const temperatureModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: temperatureGroup.id, name: 'Hot', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: temperatureGroup.id, name: 'Iced', price_extra: 3000 },
    ],
  });

  const sugarModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: sugarGroup.id, name: 'Normal Sugar', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: sugarGroup.id, name: 'Less Sugar', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: sugarGroup.id, name: 'No Sugar', price_extra: 0 },
    ],
  });

  const addonModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: addonGroup.id, name: 'Extra Espresso Shot', price_extra: 5000 },
      { id: randomUUID(), modifier_group_id: addonGroup.id, name: 'Oat Milk Upgrade', price_extra: 8000 },
    ],
  });

  // Food modifiers
  const spicinessModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Tidak Pedas', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Sedikit Pedas', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Pedas', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: spicinessGroup.id, name: 'Sangat Pedas', price_extra: 0 },
    ],
  });

  const foodToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Nasi', price_extra: 5000 },
      { id: randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Telur', price_extra: 3000 },
      { id: randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Extra Ayam', price_extra: 8000 },
      { id: randomUUID(), modifier_group_id: foodToppingsGroup.id, name: 'Kerupuk', price_extra: 2000 },
    ],
  });

  // Drink modifiers
  const drinkSugarModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Tanpa Gula', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Sedikit Gula', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Normal', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: drinkSugarGroup.id, name: 'Extra Gula', price_extra: 0 },
    ],
  });

  const iceModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: iceGroup.id, name: 'Tanpa Es', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: iceGroup.id, name: 'Sedikit Es', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: iceGroup.id, name: 'Normal', price_extra: 0 },
      { id: randomUUID(), modifier_group_id: iceGroup.id, name: 'Extra Es', price_extra: 0 },
    ],
  });

  const drinkToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Jelly', price_extra: 3000 },
      { id: randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Puding', price_extra: 3000 },
      { id: randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Nata de Coco', price_extra: 3000 },
      { id: randomUUID(), modifier_group_id: drinkToppingsGroup.id, name: 'Susu Kental Manis', price_extra: 2000 },
    ],
  });

  // Snack modifiers
  const snackToppingsModifiers = await prisma.modifier.createMany({
    data: [
      { id: randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Saus', price_extra: 2000 },
      { id: randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Mayones', price_extra: 2000 },
      { id: randomUUID(), modifier_group_id: snackToppingsGroup.id, name: 'Keju Parut', price_extra: 3000 },
    ],
  });

  console.log('✅ Created modifiers for all groups');

  // Step 4: Create Products - Coffee Category
  const espressoDrinks = [
    { name: 'Espresso', sku: 'ESP-001', price: 25000, description: 'Strong and concentrated coffee shot', image: 'https://picsum.photos/seed/espresso/500/500' },
    { name: 'Americano', sku: 'AM-002', price: 35000, description: 'Espresso with hot water, smooth and bold', image: 'https://picsum.photos/seed/americano/500/500' },
    { name: 'Cappuccino', sku: 'CAP-003', price: 45000, description: 'Espresso with steamed milk and foam', image: 'https://picsum.photos/seed/cappuccino/500/500' },
    { name: 'Caffe Latte', sku: 'CL-004', price: 48000, description: 'Smooth espresso with steamed milk', image: 'https://picsum.photos/seed/caffelatte/500/500' },
    { name: 'Caramel Macchiato', sku: 'CM-005', price: 55000, description: 'Espresso with vanilla syrup, steamed milk, and caramel drizzle', image: 'https://picsum.photos/seed/caramelmacchiato/500/500' },
    { name: 'Mocha', sku: 'MOC-006', price: 52000, description: 'Espresso with chocolate and steamed milk', image: 'https://picsum.photos/seed/mocha/500/500' },
    { name: 'Flat White', sku: 'FW-007', price: 48000, description: 'Velvety smooth espresso with microfoam', image: 'https://picsum.photos/seed/flatwhite/500/500' },
    { name: 'Vienna Coffee', sku: 'VC-008', price: 50000, description: 'Espresso with whipped cream', image: 'https://picsum.photos/seed/viennacoffee/500/500' },
    { name: 'Irish Coffee', sku: 'IC-009', price: 55000, description: 'Coffee with Irish cream and whipped cream', image: 'https://picsum.photos/seed/irishcoffee/500/500' },
    { name: 'Affogato', sku: 'AF-010', price: 52000, description: 'Espresso poured over vanilla ice cream', image: 'https://picsum.photos/seed/affogato/500/500' },
  ];

  const coffeeProducts = await Promise.all(
    espressoDrinks.map((drink) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: kopiCategory.id,
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
    { name: 'Iced Americano', sku: 'IAM-001', price: 38000, description: 'Chilled espresso with water, refreshing and bold', image: 'https://picsum.photos/seed/icedamericano/500/500' },
    { name: 'Iced Latte', sku: 'IL-002', price: 48000, description: 'Espresso with cold milk over ice', image: 'https://picsum.photos/seed/icedlatte/500/500' },
    { name: 'Cold Brew', sku: 'CB-003', price: 45000, description: 'Slow-steeped cold coffee, smooth and less acidic', image: 'https://picsum.photos/seed/coldbrew/500/500' },
    { name: 'Iced Caramel Macchiato', sku: 'ICM-004', price: 55000, description: 'Iced espresso with vanilla, milk, and caramel', image: 'https://picsum.photos/seed/icedcaramelmacchiato/500/500' },
    { name: 'Iced Mocha', sku: 'IM-005', price: 52000, description: 'Iced chocolate coffee with milk', image: 'https://picsum.photos/seed/icedmocha/500/500' },
    { name: 'Iced Cappuccino', sku: 'IC-006', price: 46000, description: 'Iced espresso with foamed milk', image: 'https://picsum.photos/seed/icedcappuccino/500/500' },
    { name: 'Nitro Cold Brew', sku: 'NCB-007', price: 50000, description: 'Cold brew infused with nitrogen for creamy texture', image: 'https://picsum.photos/seed/nitrocoldbrew/500/500' },
    { name: 'Iced Flat White', sku: 'IFW-008', price: 48000, description: 'Iced espresso with velvety microfoam', image: 'https://picsum.photos/seed/icedflatwhite/500/500' },
    { name: 'Vietnamese Iced Coffee', sku: 'VIC-009', price: 42000, description: 'Strong coffee with sweetened condensed milk', image: 'https://picsum.photos/seed/vietnameseicedcoffee/500/500' },
    { name: 'Iced Espresso Tonic', sku: 'IET-010', price: 45000, description: 'Espresso over tonic water with citrus notes', image: 'https://picsum.photos/seed/icedespressotonic/500/500' },
  ];

  const coldCoffeeProducts = await Promise.all(
    coldCoffee.map((drink) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: kopiCategory.id,
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

  // Non-Coffee Category (excluding tea drinks)
  const nonCoffeeDrinks = [
    { name: 'Matcha Latte', sku: 'ML-001', price: 48000, description: 'Japanese green tea with steamed milk', image: 'https://picsum.photos/seed/matchalatte/500/500' },
    { name: 'Hot Chocolate', sku: 'HC-002', price: 42000, description: 'Rich chocolate drink with milk', image: 'https://picsum.photos/seed/hotchocolate/500/500' },
    { name: 'Iced Matcha Latte', sku: 'IML-003', price: 50000, description: 'Cold green tea with milk over ice', image: 'https://picsum.photos/seed/icedmatchalatte/500/500' },
    { name: 'Thai Milk Tea', sku: 'TMT-004', price: 42000, description: 'Sweet Thai tea with condensed milk', image: 'https://picsum.photos/seed/thaimilktea/500/500' },
    { name: 'Iced Espresso Tonic', sku: 'IET-005', price: 45000, description: 'Espresso over tonic water with citrus notes', image: 'https://picsum.photos/seed/icedespressotonic/500/500' },
    { name: 'Lemonade', sku: 'LM-006', price: 25000, description: 'Fresh lemonade', image: 'https://picsum.photos/seed/lemonade/500/500' },
    { name: 'Coconut Water', sku: 'CW-007', price: 20000, description: 'Fresh coconut water', image: 'https://picsum.photos/seed/coconutwater/500/500' },
    { name: 'Jus Jeruk Segar', sku: 'JJS-008', price: 20000, description: 'Fresh orange juice', image: 'https://picsum.photos/seed/jusjeruk/500/500' },
    { name: 'Es Teh Manis', sku: 'ETM-009', price: 10000, description: 'Sweet iced tea', image: 'https://picsum.photos/seed/estehmanis/500/500' },
  ];

  const nonCoffeeProducts = await Promise.all(
    nonCoffeeDrinks.map((drink) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: minumanCategory.id,
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
    { name: 'Nasi Goreng Spesial', sku: 'NG-001', price: 45000, description: 'Indonesian fried rice with egg and vegetables', image: 'https://picsum.photos/seed/nasigorengspesial/500/500' },
    { name: 'Mie Goreng Jawa', sku: 'MG-002', price: 42000, description: 'Javanese style fried noodles', image: 'https://picsum.photos/seed/miegorengjawa/500/500' },
    { name: 'Ayam Bakar', sku: 'AB-003', price: 48000, description: 'Grilled chicken with sweet soy sauce', image: 'https://picsum.photos/seed/ayambakar/500/500' },
    { name: 'Sate Ayam', sku: 'SA-004', price: 55000, description: 'Indonesian chicken skewers with peanut sauce', image: 'https://picsum.photos/seed/sateayam/500/500' },
    { name: 'Burger Cheese', sku: 'BC-005', price: 52000, description: 'Classic beef burger with melted cheese', image: 'https://picsum.photos/seed/burgercheese/500/500' },
    { name: 'Chicken Sandwich', sku: 'CS-006', price: 48000, description: 'Grilled chicken sandwich with vegetables', image: 'https://picsum.photos/seed/chickensandwich/500/500' },
    { name: 'Spaghetti Carbonara', sku: 'SC-007', price: 55000, description: 'Creamy pasta with bacon and parmesan', image: 'https://picsum.photos/seed/spaghetticarbonara/500/500' },
    { name: 'Beef Lasagna', sku: 'BL-008', price: 58000, description: 'Layered pasta with beef and cheese', image: 'https://picsum.photos/seed/beeflasagna/500/500' },
    { name: 'Fish and Chips', sku: 'FC-009', price: 52000, description: 'Battered fish with crispy fries', image: 'https://picsum.photos/seed/fishandchips/500/500' },
    { name: 'Caesar Salad', sku: 'CS-010', price: 45000, description: 'Fresh salad with romaine and croutons', image: 'https://picsum.photos/seed/caesarsalad/500/500' },
  ];

  const foodProducts = await Promise.all(
    foodItems.map((item) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: makananUtamaCategory.id,
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

  // Dessert Category (bakery items)
  const dessertItems = [
    { name: 'Croissant Butter', sku: 'CR-001', price: 28000, description: 'Flaky butter croissant', image: 'https://picsum.photos/seed/croissantbutter/500/500' },
    { name: 'Croissant Almond', sku: 'CA-002', price: 35000, description: 'Almond-filled butter croissant', image: 'https://picsum.photos/seed/croissantalmond/500/500' },
    { name: 'Chocolate Muffin', sku: 'CM-003', price: 32000, description: 'Rich chocolate chip muffin', image: 'https://picsum.photos/seed/chocolatemuffin/500/500' },
    { name: 'Blueberry Muffin', sku: 'BM-004', price: 32000, description: 'Fresh blueberry muffin', image: 'https://picsum.photos/seed/blueberrymuffin/500/500' },
    { name: 'Cinnamon Roll', sku: 'CR-005', price: 35000, description: 'Sweet cinnamon roll with glaze', image: 'https://picsum.photos/seed/cinnamonroll/500/500' },
    { name: 'Cheesecake Slice', sku: 'CC-006', price: 42000, description: 'Creamy New York cheesecake', image: 'https://picsum.photos/seed/cheesecakeslice/500/500' },
    { name: 'Brownie', sku: 'BR-007', price: 28000, description: 'Fudgy chocolate brownie', image: 'https://picsum.photos/seed/brownie/500/500' },
    { name: 'Banana Bread', sku: 'BB-008', price: 32000, description: 'Moist banana bread with walnuts', image: 'https://picsum.photos/seed/bananabread/500/500' },
    { name: 'Red Velvet Cake', sku: 'RVC-009', price: 45000, description: 'Classic red velvet cake slice', image: 'https://picsum.photos/seed/redvelvetcake/500/500' },
    { name: 'Carrot Cake', sku: 'CC-010', price: 40000, description: 'Spiced carrot cake with cream cheese frosting', image: 'https://picsum.photos/seed/carrotcake/500/500' },
  ];

  const dessertProducts = await Promise.all(
    dessertItems.map((item) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: dessertCategory.id,
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

  // Bakery Category (simplified)
  const bakeryItems = [
    { name: 'Croissant Butter', sku: 'CRB-001', price: 28000, description: 'Flaky butter croissant', image: 'https://picsum.photos/seed/croissantbutter/500/500' },
    { name: 'Croissant Almond', sku: 'CRA-002', price: 35000, description: 'Almond-filled butter croissant', image: 'https://picsum.photos/seed/croissantalmond/500/500' },
  ];

  const bakeryProducts = await Promise.all(
    bakeryItems.map((item) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: bakeryCategory.id,
          name: item.name,
          description: item.description,
          sku: item.sku,
          price: item.price,
          stock_quantity: 30,
          image_url: item.image,
        },
      })
    )
  );

  // Teh Category (tea drinks from non-coffee)
  const tehItems = [
    { name: 'Chai Latte', sku: 'CHL-001', price: 45000, description: 'Spiced tea with steamed milk', image: 'https://picsum.photos/seed/chailatte/500/500' },
    { name: 'Iced Chai Latte', sku: 'ICL-002', price: 48000, description: 'Cold spiced tea with milk over ice', image: 'https://picsum.photos/seed/icedchailatte/500/500' },
    { name: 'Iced Lemon Tea', sku: 'ILT-003', price: 38000, description: 'Refreshing tea with lemon over ice', image: 'https://picsum.photos/seed/icedlemontea/500/500' },
    { name: 'Iced Peach Tea', sku: 'IPT-004', price: 40000, description: 'Fruity peach tea over ice', image: 'https://picsum.photos/seed/icedpeachtea/500/500' },
    { name: 'Earl Grey Tea', sku: 'EGT-005', price: 38000, description: 'Classic bergamot-infused black tea', image: 'https://picsum.photos/seed/earlgreytea/500/500' },
    { name: 'Jasmine Tea', sku: 'JT-006', price: 35000, description: 'Fragrant jasmine-scented green tea', image: 'https://picsum.photos/seed/jasminetea/500/500' },
  ];

  const tehProducts = await Promise.all(
    tehItems.map((item) =>
      prisma.product.create({
        data: {
          id: randomUUID(),
          category_id: tehCategory.id,
          name: item.name,
          description: item.description,
          sku: item.sku,
          price: item.price,
          stock_quantity: 60,
          image_url: item.image,
          productModifierGroups: {
            create: [
              { modifier_group_id: drinkSugarGroup.id },
              { modifier_group_id: iceGroup.id },
            ],
          },
        },
      })
    )
  );

  const totalProducts = coffeeProducts.length + coldCoffeeProducts.length + 
                        nonCoffeeProducts.length + foodProducts.length + dessertProducts.length + bakeryProducts.length + tehProducts.length;
  console.log(`✅ Created ${totalProducts} products (${coffeeProducts.length} coffee, ${coldCoffeeProducts.length} cold coffee, ${nonCoffeeProducts.length} minuman, ${foodProducts.length} makanan utama, ${dessertProducts.length} dessert, ${bakeryProducts.length} bakery, ${tehProducts.length} teh)`);

  // Create Suppliers
  const suppliers = [
    { name: 'PT Indofood Sukses Makmur', phone: '021-57958888', email: 'sales@indofood.com', address: 'Jl. Jendral Sudirman Kav. 76-78, Jakarta' },
    { name: 'PT Ultra Jaya', phone: '022-7564321', email: 'order@ultrajaya.co.id', address: 'Jl. Raya Bandung Km. 24, Cimahi' },
    { name: 'PT Wings Surya', phone: '031-8531234', email: 'procurement@wingsgroup.com', address: 'Jl. Raya Menganti Km. 16, Surabaya' },
    { name: 'PT Mayora Indah', phone: '021-54321234', email: 'supply@mayora.co.id', address: 'Jl. Tomang Raya No. 11-13, Jakarta' },
    { name: 'PT Garudafood', phone: '021-65432109', email: 'vendor@garudafood.com', address: 'Jl. Bintaro Raya No. 9, Tangerang Selatan' },
    { name: 'PT Frisian Flag Indonesia', phone: '021-87654321', email: 'business@frisianflag.com', address: 'Jl. Raya Bogor Km. 28, Jakarta' },
    { name: 'PT Unilever Indonesia', phone: '021-23456789', email: 'b2b@unilever.com', address: 'Jl. Gatot Subroto Kav. 15, Jakarta' },
    { name: 'PT Heinz ABC Indonesia', phone: '021-34567890', email: 'sales@heinzabc.com', address: 'Jl. Daan Mogot Km. 12, Jakarta' },
  ];

  await prisma.supplier.createMany({
    data: suppliers,
    skipDuplicates: true,
  });
  console.log('✅ Created 8 suppliers');

  // Create Employees
  const employees = [
    { name: 'Budi Santoso', phone: '081234567890', email: 'budi.santoso@kitchenpos.com', position: 'manager', base_salary: 8000000, hourly_rate: 75000, employment_type: 'permanent' },
    { name: 'Siti Rahayu', phone: '081234567891', email: 'siti.rahayu@kitchenpos.com', position: 'manager', base_salary: 7500000, hourly_rate: 70000, employment_type: 'permanent' },
    { name: 'Andi Wijaya', phone: '081234567892', email: 'andi.wijaya@kitchenpos.com', position: 'cashier', base_salary: 4500000, hourly_rate: 35000, employment_type: 'permanent' },
    { name: 'Dewi Lestari', phone: '081234567893', email: 'dewi.lestari@kitchenpos.com', position: 'cashier', base_salary: 4000000, hourly_rate: 30000, employment_type: 'freelance' },
    { name: 'Eko Prasetyo', phone: '081234567894', email: 'eko.prasetyo@kitchenpos.com', position: 'cashier', base_salary: 0, hourly_rate: 35000, employment_type: 'freelance' },
    { name: 'Fajar Nugraha', phone: '081234567895', email: 'fajar.nugraha@kitchenpos.com', position: 'chef', base_salary: 6000000, hourly_rate: 50000, employment_type: 'permanent' },
    { name: 'Gita Permata', phone: '081234567896', email: 'gita.permata@kitchenpos.com', position: 'chef', base_salary: 5500000, hourly_rate: 45000, employment_type: 'permanent' },
    { name: 'Hadi Kusuma', phone: '081234567897', email: 'hadi.kusuma@kitchenpos.com', position: 'chef', base_salary: 0, hourly_rate: 45000, employment_type: 'freelance' },
    { name: 'Indah Sari', phone: '081234567898', email: 'indah.sari@kitchenpos.com', position: 'waiter', base_salary: 3500000, hourly_rate: 30000, employment_type: 'permanent' },
    { name: 'Joko Anwar', phone: '081234567899', email: 'joko.anwar@kitchenpos.com', position: 'waiter', base_salary: 0, hourly_rate: 28000, employment_type: 'freelance' },
    { name: 'Kartika Sari', phone: '081234567900', email: 'kartika.sari@kitchenpos.com', position: 'barista', base_salary: 5000000, hourly_rate: 40000, employment_type: 'permanent' },
    { name: 'Lukman Hakim', phone: '081234567901', email: 'lukman.hakim@kitchenpos.com', position: 'barista', base_salary: 0, hourly_rate: 38000, employment_type: 'freelance' },
  ];

  await prisma.employee.createMany({
    data: employees,
    skipDuplicates: true,
  });
  console.log('✅ Created 12 employees (2 managers, 2 cashiers, 2 chefs, 2 waiters, 2 baristas - 5 freelance, 7 permanent)');

  // Step 5: Generate Sample Orders for Reports
  console.log('📊 Generating sample orders for reports...');

  // Get existing data for relationships
  const allProducts = await prisma.product.findMany();
  const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
  const cashiers = await prisma.profile.findMany({
    where: { role_id: cashierRole!.id }
  });
  const tables = await prisma.table.findMany();

  if (allProducts.length === 0 || cashiers.length === 0) {
    console.log('⚠️  Skipping order generation - missing products or cashiers');
  } else {
    // Generate 400 orders over 90 days (increased for higher revenue)
    const numberOfOrders = 400;
    const daysToCover = 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToCover);

    const paymentMethods = ['cash', 'card', 'transfer'];
    const orderStatuses = ['completed', 'paid', 'paid', 'paid', 'pending', 'cancelled']; // Weighted towards completed/paid

    for (let i = 0; i < numberOfOrders; i++) {
      // Generate realistic timestamp with peak hours
      const orderDate = new Date(startDate);
      const daysOffset = Math.floor(Math.random() * daysToCover);
      orderDate.setDate(orderDate.getDate() + daysOffset);

      // Peak hours: 11am-2pm, 6pm-9pm
      const hour = Math.random();
      let orderHour;
      if (hour < 0.4) {
        // 11am-2pm (40% of orders)
        orderHour = 11 + Math.floor(Math.random() * 3);
      } else if (hour < 0.8) {
        // 6pm-9pm (40% of orders)
        orderHour = 18 + Math.floor(Math.random() * 3);
      } else {
        // Other hours (20% of orders)
        orderHour = 9 + Math.floor(Math.random() * 12);
      }

      orderDate.setHours(orderHour, Math.floor(Math.random() * 60), 0, 0);

      // Weekend boost (20% more orders on weekends)
      const dayOfWeek = orderDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - already handled by random distribution
      }

      // Select random cashier
      const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];

      // Select random payment method
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Select order status (weighted)
      const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      // Decide if dine-in or takeaway (70% dine-in)
      const isDineIn = Math.random() < 0.7;
      const tableNumber = isDineIn ? tables[Math.floor(Math.random() * tables.length)]?.table_number : null;

      // Generate order items (3-8 items per order - increased for higher revenue)
      const numberOfItems = 3 + Math.floor(Math.random() * 6);
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numberOfItems; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        const quantity = 1 + Math.floor(Math.random() * 4); // 1-5 quantity per item (increased)
        const priceAtTime = product.price;
        const itemTotal = priceAtTime * quantity;
        totalAmount += itemTotal;

        orderItems.push({
          id: randomUUID(),
          product_id: product.id,
          quantity,
          price_at_time: priceAtTime,
          status: 'completed',
        });
      }

      // Add small random discount (15% of orders)
      let discountAmount = 0;
      if (Math.random() < 0.15) {
        discountAmount = totalAmount * 0.1;
        totalAmount -= discountAmount;
      }

      // Create order first
      const orderId = randomUUID();
      const order = await prisma.order.create({
        data: {
          id: orderId,
          cashier_id: cashier.id,
          outlet_id: outlet1.id,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: orderStatus,
          created_at: orderDate,
          table_number: tableNumber,
          discount_amount: discountAmount,
          items: {
            create: orderItems,
          },
        },
      });

      // Create payment transaction if order is paid/completed
      if (orderStatus === 'paid' || orderStatus === 'completed') {
        const gateway = paymentMethod === 'cash' ? 'manual' : 'qris';
        const paymentTransaction = await prisma.paymentTransaction.create({
          data: {
            id: randomUUID(),
            order_id: orderId,
            gateway,
            amount: totalAmount,
            payment_method: paymentMethod,
            status: 'completed',
            paid_at: orderDate,
          },
        });

        // Update order with payment transaction reference
        await prisma.order.update({
          where: { id: orderId },
          data: { payment_transaction_id: paymentTransaction.id },
        });
      }

      if (i % 20 === 0) {
        console.log(`  Generated ${i}/${numberOfOrders} orders...`);
      }
    }

    console.log(`✅ Generated ${numberOfOrders} sample orders over ${daysToCover} days`);
  }

  // Step 6: Generate Sample Payroll Data for Reports
  console.log('💰 Generating sample payroll data for reports...');

  const employeesForPayroll = await prisma.employee.findMany();
  const payrollCount = 1; // Generate 1 month of payroll data (reduced from 3)

  for (let monthOffset = 0; monthOffset < payrollCount; monthOffset++) {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - monthOffset);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0); // Last day of the month

    for (const employee of employeesForPayroll) {
      // Generate realistic working days (20-26 days per month)
      const workingDays = 20 + Math.floor(Math.random() * 7);
      
      // Calculate base salary based on employment type
      let baseSalary = 0;
      let overtimeHours = 0;
      let overtimePay = 0;
      
      if (employee.employment_type === 'permanent') {
        baseSalary = employee.base_salary;
        // Random overtime (0-20 hours per month)
        overtimeHours = Math.floor(Math.random() * 20);
        const hourlyRate = employee.base_salary / (22 * 8); // Daily rate / 8 hours
        overtimePay = overtimeHours * hourlyRate * 1.5; // 1.5x overtime rate
      } else {
        // Freelance: hourly rate * working days * 8 hours
        const hourlyRate = employee.hourly_rate || 0;
        baseSalary = 0; // Freelance don't have base salary
        overtimeHours = Math.floor(Math.random() * 10);
        overtimePay = overtimeHours * hourlyRate * 1.5;
      }
      
      // Random bonus (0-500,000)
      const bonus = Math.floor(Math.random() * 500000);
      
      // Random deduction (0-100,000)
      const deduction = Math.floor(Math.random() * 100000);
      
      // Calculate total pay differently for permanent vs freelance
      let totalPay;
      if (employee.employment_type === 'permanent') {
        totalPay = baseSalary + overtimePay + bonus - deduction;
      } else {
        // Freelance: regular wages (hourly_rate * working_days * 8) + overtime + bonus - deduction
        const hourlyRate = employee.hourly_rate || 0;
        const regularWages = hourlyRate * workingDays * 8;
        totalPay = regularWages + overtimePay + bonus - deduction;
      }
      
      await prisma.payroll.create({
        data: {
          id: randomUUID(),
          employee_id: employee.id,
          period_start: periodStart,
          period_end: periodEnd,
          base_salary: Math.round(baseSalary),
          overtime_hours: overtimeHours,
          overtime_pay: Math.round(overtimePay),
          bonus,
          deduction,
          total_pay: Math.round(totalPay),
        },
      });
    }
  }

  console.log(`✅ Generated ${payrollCount} months of payroll data for ${employeesForPayroll.length} employees (${payrollCount * employeesForPayroll.length} total payroll records)`);

  // Step 7: Generate Sample Petty Cash Data for Reports
  console.log('� Generating sample petty cash data for reports...');

  const pettyCashCategories = ['ad_hoc_purchase', 'operational', 'misc'];
  const pettyCashDescriptions = {
    ad_hoc_purchase: ['Beli bahan tambahan', 'Pembelian alat dapur', 'Beli kemasan'],
    operational: ['Transportasi kirim barang', 'Biaya parkir', 'Bensin operasional'],
    misc: ['Tips pengiriman', 'Biaya tak terduga', 'Lain-lain'],
  };

  const pettyCashDays = 90; // Generate petty cash for 90 days

  for (let dayOffset = 0; dayOffset < pettyCashDays; dayOffset++) {
    const expenseDate = new Date();
    expenseDate.setDate(expenseDate.getDate() - dayOffset);
    
    // Generate 0-1 petty cash entries per day (reduce frequency)
    const entriesPerDay = Math.floor(Math.random() * 2); // 0 or 1 entry per day
    
    for (let i = 0; i < entriesPerDay; i++) {
      const category = pettyCashCategories[Math.floor(Math.random() * pettyCashCategories.length)];
      const descriptions = pettyCashDescriptions[category as keyof typeof pettyCashDescriptions];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Random amount between 5,000 and 50,000 (further reduced)
      const amount = 5000 + Math.random() * 45000;
      
      // Use the first admin user as created_by
      const adminUser = await prisma.profile.findFirst({
        where: { username: 'admin' }
      });
      
      await prisma.pettyCash.create({
        data: {
          id: randomUUID(),
          amount: Math.round(amount),
          description,
          category,
          expense_date: expenseDate,
          created_by: adminUser!.id,
        },
      });
    }
  }

  console.log(`✅ Generated sample petty cash data for ${pettyCashDays} days`);

  // Step 9: Seed comprehensive inventory data
  await seedInventoryData();

  console.log('🎉 Seeding complete');
}

// Comprehensive inventory data seeding function
async function seedInventoryData() {
  console.log('📦 Seeding comprehensive inventory data...');

  // Clean existing inventory data first
  console.log('🧹 Cleaning existing inventory data...');
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.goodsReceivedNoteItem.deleteMany();
  await prisma.goodsReceivedNote.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.quotationRequest.deleteMany();
  await prisma.purchaseRequisitionItem.deleteMany();
  await prisma.purchaseRequisition.deleteMany();
  await prisma.stockRequest.deleteMany();
  await prisma.stockWriteOff.deleteMany();
  await prisma.stockBatch.deleteMany();
  await prisma.stockLog.deleteMany();
  await prisma.stockAdjustmentLog.deleteMany();
  await prisma.ingredientCategory.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.supplier.deleteMany();
  console.log('✅ Inventory data cleaned');

  // Step 1: Create comprehensive suppliers
  console.log('🏭 Creating comprehensive suppliers...');
  const suppliers = await createComprehensiveSuppliers();
  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Step 2: Create warehouses and ingredient categories
  console.log('🏗️ Creating warehouses and ingredient categories...');
  const warehouse = await prisma.warehouse.findFirst();
  const ingredientCategories = await createIngredientCategories();
  console.log(`✅ Created ${ingredientCategories.length} ingredient categories`);

  // Step 3: Create comprehensive ingredients linked to suppliers
  console.log('🥗 Creating comprehensive ingredients...');
  const ingredients = await createComprehensiveIngredients(suppliers, warehouse, ingredientCategories);
  console.log(`✅ Created ${ingredients.length} ingredients`);

  // Step 4: Generate stock requests
  console.log('📋 Generating stock requests...');
  const stockRequests = await generateStockRequests(ingredients, suppliers);
  console.log(`✅ Generated ${stockRequests.length} stock requests`);

  // Step 5: Generate quotation requests and quotations
  console.log('💰 Generating quotation requests and quotations...');
  const { quotationRequests, quotations } = await generateQuotations(stockRequests, suppliers);
  console.log(`✅ Generated ${quotationRequests.length} quotation requests and ${quotations.length} quotations`);

  // Step 6: Generate purchase orders
  console.log('📄 Generating purchase orders...');
  const purchaseOrders = await generatePurchaseOrders(quotations, ingredients);
  console.log(`✅ Generated ${purchaseOrders.length} purchase orders`);

  // Step 7: Generate purchase requisitions
  console.log('📝 Generating purchase requisitions...');
  const purchaseRequisitions = await generatePurchaseRequisitions(ingredients, suppliers);
  console.log(`✅ Generated ${purchaseRequisitions.length} purchase requisitions`);

  // Step 8: Generate goods received notes
  console.log('✅ Generating goods received notes...');
  const goodsReceivedNotes = await generateGoodsReceivedNotes(purchaseOrders, ingredients);
  console.log(`✅ Generated ${goodsReceivedNotes.length} goods received notes`);

  // Step 9: Generate invoices
  console.log('🧾 Generating invoices...');
  const invoices = await generateInvoices(goodsReceivedNotes);
  console.log(`✅ Generated ${invoices.length} invoices`);

  // Step 10: Generate supplier payments
  console.log('💳 Generating supplier payments...');
  const payments = await generateSupplierPayments(invoices);
  console.log(`✅ Generated ${payments.length} supplier payments`);

  console.log('🎉 Comprehensive inventory data seeding complete');
}

async function createComprehensiveSuppliers() {
  const supplierData = [
    // Enhanced existing suppliers
    {
      name: 'PT Indofood Sukses Makmur',
      phone: '021-57958888',
      email: 'sales@indofood.com',
      address: 'Jl. Jendral Sudirman Kav. 76-78, Jakarta',
      pic_name: 'Budi Santoso',
      pic_mobile: '081234567890',
      category: 'Dry Goods',
      moq_amount: 5000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Reliable delivery, good quality products',
      is_active: true,
    },
    {
      name: 'PT Ultra Jaya',
      phone: '022-7564321',
      email: 'order@ultrajaya.co.id',
      address: 'Jl. Raya Bandung Km. 24, Cimahi',
      pic_name: 'Siti Rahayu',
      pic_mobile: '081234567891',
      category: 'Dairy & Beverages',
      moq_amount: 3000000,
      moq_unit: 'Rp',
      payment_terms: 'net 14',
      performance_notes: 'Fast delivery, competitive pricing',
      is_active: true,
    },
    {
      name: 'PT Wings Surya',
      phone: '031-8531234',
      email: 'procurement@wingsgroup.com',
      address: 'Jl. Raya Menganti Km. 16, Surabaya',
      pic_name: 'Andi Wijaya',
      pic_mobile: '081234567892',
      category: 'Packaging',
      moq_amount: 2000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Consistent quality, on-time delivery',
      is_active: true,
    },
    {
      name: 'PT Mayora Indah',
      phone: '021-54321234',
      email: 'supply@mayora.co.id',
      address: 'Jl. Tomang Raya No. 11-13, Jakarta',
      pic_name: 'Dewi Lestari',
      pic_mobile: '081234567893',
      category: 'Confectionery',
      moq_amount: 4000000,
      moq_unit: 'Rp',
      payment_terms: 'net 45',
      performance_notes: 'Wide product range, good support',
      is_active: true,
    },
    {
      name: 'PT Garudafood',
      phone: '021-65432109',
      email: 'vendor@garudafood.com',
      address: 'Jl. Bintaro Raya No. 9, Tangerang Selatan',
      pic_name: 'Eko Prasetyo',
      pic_mobile: '081234567894',
      category: 'Snacks',
      moq_amount: 2500000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Popular brands, reliable supply',
      is_active: true,
    },
    {
      name: 'PT Frisian Flag Indonesia',
      phone: '021-87654321',
      email: 'business@frisianflag.com',
      address: 'Jl. Raya Bogor Km. 28, Jakarta',
      pic_name: 'Fajar Nugraha',
      pic_mobile: '081234567895',
      category: 'Dairy',
      moq_amount: 6000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Premium dairy products, cold chain maintained',
      is_active: true,
    },
    {
      name: 'PT Unilever Indonesia',
      phone: '021-23456789',
      email: 'b2b@unilever.com',
      address: 'Jl. Gatot Subroto Kav. 15, Jakarta',
      pic_name: 'Gita Permata',
      pic_mobile: '081234567896',
      category: 'Cleaning Supplies',
      moq_amount: 10000000,
      moq_unit: 'Rp',
      payment_terms: 'net 60',
      performance_notes: 'Global quality standards, bulk discounts available',
      is_active: true,
    },
    {
      name: 'PT Heinz ABC Indonesia',
      phone: '021-34567890',
      email: 'sales@heinzabc.com',
      address: 'Jl. Daan Mogot Km. 12, Jakarta',
      pic_name: 'Hadi Kusuma',
      pic_mobile: '081234567897',
      category: 'Condiments',
      moq_amount: 3500000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Trusted brand, consistent quality',
      is_active: true,
    },
    // New suppliers
    {
      name: 'PT Bogasari Flour Mills',
      phone: '021-69876543',
      email: 'sales@bogasari.co.id',
      address: 'Jl. Kyai Maja No. 5, Jakarta',
      pic_name: 'Indah Sari',
      pic_mobile: '081234567898',
      category: 'Bakery',
      moq_amount: 8000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Premium flour quality, consistent protein content',
      is_active: true,
    },
    {
      name: 'CV Segar Jaya',
      phone: '081-987654321',
      email: 'order@segarjaya.com',
      address: 'Pasar Induk Kramat Jati, Jakarta',
      pic_name: 'Joko Anwar',
      pic_mobile: '081234567899',
      category: 'Vegetables',
      moq_amount: 1000000,
      moq_unit: 'Rp',
      payment_terms: 'cod',
      performance_notes: 'Fresh daily produce, competitive prices',
      is_active: true,
    },
    {
      name: 'PT Daging Indonesia',
      phone: '021-54321098',
      email: 'sales@dagingindo.com',
      address: 'Jl. Raya Bogor Km. 20, Jakarta',
      pic_name: 'Kartika Sari',
      pic_mobile: '081234567900',
      category: 'Meat',
      moq_amount: 15000000,
      moq_unit: 'Rp',
      payment_terms: 'net 14',
      performance_notes: 'Halal certified, cold chain delivery',
      is_active: true,
    },
    {
      name: 'UD Ikan Segar',
      phone: '081-234567890',
      email: 'ikansegar@gmail.com',
      address: 'Pasar Ikan Muara Baru, Jakarta',
      pic_name: 'Lukman Hakim',
      pic_mobile: '081234567901',
      category: 'Seafood',
      moq_amount: 2000000,
      moq_unit: 'Rp',
      payment_terms: 'cod',
      performance_notes: 'Daily catch, very fresh seafood',
      is_active: true,
    },
    {
      name: 'PT Rempah Wangi',
      phone: '022-12345678',
      email: 'spices@rempahwangi.com',
      address: 'Jl. Braga No. 10, Bandung',
      pic_name: 'Maya Sari',
      pic_mobile: '081234567902',
      category: 'Spices',
      moq_amount: 1500000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'High quality spices, aromatic products',
      is_active: true,
    },
    {
      name: 'PT Minyak Goreng Sehat',
      phone: '021-76543210',
      email: 'order@minyaksehat.com',
      address: 'Jl. Industri No. 25, Jakarta',
      pic_name: 'Rudi Hartono',
      pic_mobile: '081234567903',
      category: 'Oils & Fats',
      moq_amount: 5000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Various oil types, bulk packaging',
      is_active: true,
    },
    {
      name: 'CV Ayam Berkah',
      phone: '081-345678901',
      email: 'ayamberkah@gmail.com',
      address: 'Jl. Poultry No. 15, Jakarta',
      pic_name: 'Sri Mulyani',
      pic_mobile: '081234567904',
      category: 'Poultry',
      moq_amount: 3000000,
      moq_unit: 'Rp',
      payment_terms: 'net 14',
      performance_notes: 'Free-range chicken, organic options',
      is_active: true,
    },
    {
      name: 'PT Buah Segar Abadi',
      phone: '021-87654322',
      email: 'fruits@buahsegar.com',
      address: 'Jl. Fruit Garden No. 8, Jakarta',
      pic_name: 'Dedi Cahyono',
      pic_mobile: '081234567905',
      category: 'Fruits',
      moq_amount: 2500000,
      moq_unit: 'Rp',
      payment_terms: 'net 7',
      performance_notes: 'Seasonal fruits, imported options',
      is_active: true,
    },
    {
      name: 'PT Frozen Food Indonesia',
      phone: '021-23456788',
      email: 'frozen@frozenfood.com',
      address: 'Jl. Cold Storage No. 12, Jakarta',
      pic_name: 'Rina Wati',
      pic_mobile: '081234567906',
      category: 'Frozen Foods',
      moq_amount: 4000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Wide frozen food range, maintained cold chain',
      is_active: true,
    },
    {
      name: 'PT Equipment Pro',
      phone: '021-34567891',
      email: 'equipment@pro.com',
      address: 'Jl. Industrial No. 30, Jakarta',
      pic_name: 'Agus Setiawan',
      pic_mobile: '081234567907',
      category: 'Equipment',
      moq_amount: 20000000,
      moq_unit: 'Rp',
      payment_terms: 'net 60',
      performance_notes: 'Commercial kitchen equipment, warranty included',
      is_active: true,
    },
    {
      name: 'CV Kemasan Plastik',
      phone: '031-23456789',
      email: 'packaging@plastik.com',
      address: 'Jl. Packaging No. 5, Surabaya',
      pic_name: 'Bambang Sutrisno',
      pic_mobile: '081234567908',
      category: 'Packaging',
      moq_amount: 1000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Custom packaging, eco-friendly options',
      is_active: true,
    },
    {
      name: 'PT Sweet Treats',
      phone: '021-56789012',
      email: 'sweets@sweettreats.com',
      address: 'Jl. Dessert Street No. 8, Jakarta',
      pic_name: 'Ani Susanti',
      pic_mobile: '081234567909',
      category: 'Confectionery',
      moq_amount: 2000000,
      moq_unit: 'Rp',
      payment_terms: 'net 30',
      performance_notes: 'Premium chocolates and confectionery',
      is_active: true,
    },
  ];

  const createdSuppliers = await prisma.supplier.createMany({
    data: supplierData,
    skipDuplicates: true,
  });

  return await prisma.supplier.findMany();
}

async function createIngredientCategories() {
  const categories = [
    { name: 'Proteins', color: '#ef4444' },
    { name: 'Dairy', color: '#3b82f6' },
    { name: 'Vegetables', color: '#22c55e' },
    { name: 'Fruits', color: '#f97316' },
    { name: 'Grains', color: '#eab308' },
    { name: 'Spices', color: '#a855f7' },
    { name: 'Oils', color: '#f59e0b' },
    { name: 'Beverages', color: '#06b6d4' },
    { name: 'Bakery', color: '#ec4899' },
    { name: 'Packaging', color: '#64748b' },
  ];

  await prisma.ingredientCategory.createMany({
    data: categories,
    skipDuplicates: true,
  });

  return await prisma.ingredientCategory.findMany();
}

async function createComprehensiveIngredients(suppliers: any[], warehouse: any, categories: any[]) {
  const categoryMap = new Map(categories.map(c => [c.name, c.id]));
  
  const ingredientData = [
    // Proteins
    { name: 'Daging Sapi', unit: 'kg', unit_price: 120000, current_stock: 20, min_stock: 5, category: 'Proteins', supplier: 'PT Daging Indonesia' },
    { name: 'Daging Ayam', unit: 'kg', unit_price: 45000, current_stock: 30, min_stock: 8, category: 'Proteins', supplier: 'CV Ayam Berkah' },
    { name: 'Ikan Tuna', unit: 'kg', unit_price: 85000, current_stock: 15, min_stock: 3, category: 'Proteins', supplier: 'UD Ikan Segar' },
    { name: 'Ikan Kakap Merah', unit: 'kg', unit_price: 95000, current_stock: 12, min_stock: 3, category: 'Proteins', supplier: 'UD Ikan Segar' },
    { name: 'Udang', unit: 'kg', unit_price: 150000, current_stock: 10, min_stock: 2, category: 'Proteins', supplier: 'UD Ikan Segar' },
    { name: 'Telur Ayam', unit: 'kg', unit_price: 32000, current_stock: 25, min_stock: 5, category: 'Proteins', supplier: 'CV Ayam Berkah' },
    { name: 'Tahu', unit: 'pcs', unit_price: 3000, current_stock: 50, min_stock: 10, category: 'Proteins', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Tempe', unit: 'pcs', unit_price: 4000, current_stock: 40, min_stock: 8, category: 'Proteins', supplier: 'PT Indofood Sukses Makmur' },
    
    // Dairy
    { name: 'Susu UHT', unit: 'liter', unit_price: 22000, current_stock: 20, min_stock: 5, category: 'Dairy', supplier: 'PT Frisian Flag Indonesia' },
    { name: 'Susu Segar', unit: 'liter', unit_price: 18000, current_stock: 15, min_stock: 4, category: 'Dairy', supplier: 'PT Ultra Jaya' },
    { name: 'Keju Cheddar', unit: 'kg', unit_price: 85000, current_stock: 15, min_stock: 3, category: 'Dairy', supplier: 'PT Frisian Flag Indonesia' },
    { name: 'Keju Mozzarella', unit: 'kg', unit_price: 120000, current_stock: 8, min_stock: 2, category: 'Dairy', supplier: 'PT Frisian Flag Indonesia' },
    { name: 'Butter', unit: 'kg', unit_price: 95000, current_stock: 10, min_stock: 2, category: 'Dairy', supplier: 'PT Frisian Flag Indonesia' },
    { name: 'Krim Kental Manis', unit: 'kaleng', unit_price: 15000, current_stock: 30, min_stock: 6, category: 'Dairy', supplier: 'PT Ultra Jaya' },
    { name: 'Yogurt', unit: 'cup', unit_price: 8000, current_stock: 25, min_stock: 5, category: 'Dairy', supplier: 'PT Ultra Jaya' },
    
    // Vegetables
    { name: 'Sayur Bayam', unit: 'kg', unit_price: 12000, current_stock: 10, min_stock: 3, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Tomat', unit: 'kg', unit_price: 15000, current_stock: 12, min_stock: 3, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Bawang Merah', unit: 'kg', unit_price: 35000, current_stock: 8, min_stock: 2, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Bawang Putih', unit: 'kg', unit_price: 40000, current_stock: 6, min_stock: 2, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Wortel', unit: 'kg', unit_price: 18000, current_stock: 15, min_stock: 3, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Kentang', unit: 'kg', unit_price: 20000, current_stock: 20, min_stock: 4, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Cabai Merah', unit: 'kg', unit_price: 45000, current_stock: 5, min_stock: 1, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    { name: 'Sawi', unit: 'kg', unit_price: 10000, current_stock: 12, min_stock: 3, category: 'Vegetables', supplier: 'CV Segar Jaya' },
    
    // Fruits
    { name: 'Apel', unit: 'kg', unit_price: 35000, current_stock: 15, min_stock: 3, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    { name: 'Pisang', unit: 'kg', unit_price: 25000, current_stock: 20, min_stock: 4, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    { name: 'Jeruk', unit: 'kg', unit_price: 30000, current_stock: 18, min_stock: 4, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    { name: 'Mangga', unit: 'kg', unit_price: 40000, current_stock: 12, min_stock: 2, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    { name: 'Anggur', unit: 'kg', unit_price: 60000, current_stock: 8, min_stock: 2, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    { name: 'Strawberry', unit: 'kg', unit_price: 80000, current_stock: 6, min_stock: 1, category: 'Fruits', supplier: 'PT Buah Segar Abadi' },
    
    // Grains
    { name: 'Tepung Terigu', unit: 'kg', unit_price: 15000, current_stock: 50, min_stock: 10, category: 'Grains', supplier: 'PT Bogasari Flour Mills' },
    { name: 'Tepung Beras', unit: 'kg', unit_price: 18000, current_stock: 40, min_stock: 8, category: 'Grains', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Beras', unit: 'kg', unit_price: 16000, current_stock: 60, min_stock: 12, category: 'Grains', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Gula Pasir', unit: 'kg', unit_price: 18000, current_stock: 30, min_stock: 5, category: 'Grains', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Gula Merah', unit: 'kg', unit_price: 25000, current_stock: 15, min_stock: 3, category: 'Grains', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Mie Instan', unit: 'pcs', unit_price: 3500, current_stock: 100, min_stock: 20, category: 'Grains', supplier: 'PT Indofood Sukses Makmur' },
    
    // Spices
    { name: 'Lada Hitam', unit: 'kg', unit_price: 150000, current_stock: 5, min_stock: 1, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Lada Putih', unit: 'kg', unit_price: 180000, current_stock: 4, min_stock: 1, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Ketumbar', unit: 'kg', unit_price: 80000, current_stock: 8, min_stock: 2, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Jinten', unit: 'kg', unit_price: 120000, current_stock: 6, min_stock: 1, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Kayu Manis', unit: 'kg', unit_price: 200000, current_stock: 3, min_stock: 1, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Cengkeh', unit: 'kg', unit_price: 250000, current_stock: 2, min_stock: 1, category: 'Spices', supplier: 'PT Rempah Wangi' },
    { name: 'Kecap Manis', unit: 'liter', unit_price: 25000, current_stock: 20, min_stock: 4, category: 'Spices', supplier: 'PT Heinz ABC Indonesia' },
    { name: 'Kecap Asin', unit: 'liter', unit_price: 22000, current_stock: 15, min_stock: 3, category: 'Spices', supplier: 'PT Heinz ABC Indonesia' },
    { name: 'Saus Tomat', unit: 'liter', unit_price: 30000, current_stock: 12, min_stock: 2, category: 'Spices', supplier: 'PT Heinz ABC Indonesia' },
    { name: 'Saus Sambal', unit: 'liter', unit_price: 35000, current_stock: 10, min_stock: 2, category: 'Spices', supplier: 'PT Heinz ABC Indonesia' },
    
    // Oils
    { name: 'Minyak Goreng', unit: 'liter', unit_price: 25000, current_stock: 40, min_stock: 10, category: 'Oils', supplier: 'PT Minyak Goreng Sehat' },
    { name: 'Minyak Zaitun', unit: 'liter', unit_price: 150000, current_stock: 8, min_stock: 2, category: 'Oils', supplier: 'PT Minyak Goreng Sehat' },
    { name: 'Mentega', unit: 'kg', unit_price: 90000, current_stock: 12, min_stock: 2, category: 'Oils', supplier: 'PT Frisian Flag Indonesia' },
    { name: 'Minyak Kelapa', unit: 'liter', unit_price: 35000, current_stock: 15, min_stock: 3, category: 'Oils', supplier: 'PT Minyak Goreng Sehat' },
    
    // Beverages
    { name: 'Kopi Bubuk', unit: 'kg', unit_price: 95000, current_stock: 25, min_stock: 5, category: 'Beverages', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Teh Hitam', unit: 'kg', unit_price: 45000, current_stock: 30, min_stock: 6, category: 'Beverages', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Teh Hijau', unit: 'kg', unit_price: 55000, current_stock: 20, min_stock: 4, category: 'Beverages', supplier: 'PT Indofood Sukses Makmur' },
    { name: 'Coklat Bubuk', unit: 'kg', unit_price: 75000, current_stock: 10, min_stock: 2, category: 'Beverages', supplier: 'PT Sweet Treats' },
    { name: 'Soda', unit: 'kaleng', unit_price: 8000, current_stock: 50, min_stock: 10, category: 'Beverages', supplier: 'PT Ultra Jaya' },
    { name: 'Jus Buah', unit: 'liter', unit_price: 35000, current_stock: 15, min_stock: 3, category: 'Beverages', supplier: 'PT Ultra Jaya' },
    
    // Bakery
    { name: 'Ragi', unit: 'kg', unit_price: 45000, current_stock: 8, min_stock: 2, category: 'Bakery', supplier: 'PT Bogasari Flour Mills' },
    { name: 'Garam Halus', unit: 'kg', unit_price: 8000, current_stock: 20, min_stock: 4, category: 'Bakery', supplier: 'PT Bogasari Flour Mills' },
    { name: 'Baking Powder', unit: 'kg', unit_price: 35000, current_stock: 10, min_stock: 2, category: 'Bakery', supplier: 'PT Bogasari Flour Mills' },
    { name: 'Soda Kue', unit: 'kg', unit_price: 25000, current_stock: 12, min_stock: 2, category: 'Bakery', supplier: 'PT Bogasari Flour Mills' },
    { name: 'Vanilla Essence', unit: 'liter', unit_price: 120000, current_stock: 5, min_stock: 1, category: 'Bakery', supplier: 'PT Sweet Treats' },
    
    // Packaging
    { name: 'Plastik Kemasan', unit: 'roll', unit_price: 45000, current_stock: 30, min_stock: 6, category: 'Packaging', supplier: 'CV Kemasan Plastik' },
    { name: 'Box Kardus', unit: 'pcs', unit_price: 3000, current_stock: 100, min_stock: 20, category: 'Packaging', supplier: 'CV Kemasan Plastik' },
    { name: 'Cup Plastik', unit: 'pcs', unit_price: 500, current_stock: 500, min_stock: 100, category: 'Packaging', supplier: 'CV Kemasan Plastik' },
    { name: 'Sendok Garpu', unit: 'pcs', unit_price: 200, current_stock: 200, min_stock: 40, category: 'Packaging', supplier: 'CV Kemasan Plastik' },
    { name: 'Tisu', unit: 'pack', unit_price: 15000, current_stock: 50, min_stock: 10, category: 'Packaging', supplier: 'PT Unilever Indonesia' },
  ];

  const createdIngredients = [];
  for (const ingredient of ingredientData) {
    const supplier = suppliers.find(s => s.name === ingredient.supplier);
    const category = categoryMap.get(ingredient.category);
    
    const created = await prisma.ingredient.create({
      data: {
        id: randomUUID(),
        name: ingredient.name,
        unit: ingredient.unit,
        unit_price: ingredient.unit_price,
        current_stock: ingredient.current_stock,
        min_stock: ingredient.min_stock,
        restock_quantity: ingredient.min_stock * 2,
        supplier_id: supplier?.id,
        warehouse_id: warehouse?.id,
        category_id: category,
      },
    });
    createdIngredients.push(created);
  }

  return createdIngredients;
}

async function generateStockRequests(ingredients: any[], suppliers: any[]) {
  const stockRequests = [];
  const statuses = ['pending_supervisor', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'cancelled'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const adminUser = await prisma.profile.findFirst({ where: { username: 'admin' } });

  for (let i = 0; i < 50; i++) {
    const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const requestDate = new Date(startDate);
    requestDate.setDate(requestDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const quantity = (Math.random() * 20 + 5).toFixed(1); // 5-25 units
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const stockRequest = await prisma.stockRequest.create({
      data: {
        id: randomUUID(),
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity_requested: parseFloat(quantity),
        unit: ingredient.unit,
        supplier_id: supplier.id,
        status,
        requested_by: adminUser!.id,
        requested_by_name: adminUser!.full_name,
        requested_at: requestDate,
        notes: `Stock request for ${ingredient.name}`,
      },
    });
    stockRequests.push(stockRequest);
  }

  return stockRequests;
}

async function generateQuotations(stockRequests: any[], suppliers: any[]) {
  const quotationRequests = [];
  const quotations = [];
  const quotationStatuses = ['received', 'selected', 'rejected'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  // Create quotation requests from approved stock requests
  const approvedStockRequests = stockRequests.filter(sr => sr.status === 'approved');
  
  for (const stockRequest of approvedStockRequests) {
    const qrDate = new Date(startDate);
    qrDate.setDate(qrDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const quotationRequest = await prisma.quotationRequest.create({
      data: {
        id: randomUUID(),
        stock_request_id: stockRequest.id,
        status: 'open',
        sent_at: qrDate,
        notes: 'Request for quotation',
      },
    });
    quotationRequests.push(quotationRequest);

    // Generate 2-4 quotations per request from different suppliers
    const numQuotations = 2 + Math.floor(Math.random() * 3);
    const shuffledSuppliers = [...suppliers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numQuotations; i++) {
      const supplier = shuffledSuppliers[i];
      const basePrice = Math.random() * 50000 + 10000; // 10k-60k
      const quotedPrice = basePrice * (0.8 + Math.random() * 0.4); // 80%-120% variation
      
      const quotation = await prisma.quotation.create({
        data: {
          id: randomUUID(),
          quotation_request_id: quotationRequest.id,
          supplier_id: supplier.id,
          status: quotationStatuses[Math.floor(Math.random() * quotationStatuses.length)],
          quoted_price: quotedPrice,
          quoted_unit: 'Rp',
          delivery_date: new Date(qrDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
          payment_terms: 'net 30',
          valid_until: new Date(qrDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days later
          received_at: qrDate,
          notes: `Quotation from ${supplier.name}`,
        },
      });
      quotations.push(quotation);
    }

    // Close some quotation requests
    if (Math.random() > 0.3) {
      await prisma.quotationRequest.update({
        where: { id: quotationRequest.id },
        data: {
          status: 'closed',
          closed_at: new Date(qrDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return { quotationRequests, quotations };
}

async function generatePurchaseOrders(quotations: any[], ingredients: any[]) {
  const purchaseOrders = [];
  const poStatuses = ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const selectedQuotations = quotations.filter(q => q.status === 'selected');
  
  for (const quotation of selectedQuotations) {
    const orderDate = new Date(startDate);
    orderDate.setDate(orderDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const status = poStatuses[Math.floor(Math.random() * poStatuses.length)];
    
    // Generate PO number
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const po_number = `PO-${year}${month}-${random}`;

    // Calculate totals
    const subtotal = quotation.quoted_price;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Generate 1-3 items per PO
    const numItems = 1 + Math.floor(Math.random() * 3);
    const poItems = [];
    for (let i = 0; i < numItems; i++) {
      const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = quotation.quoted_price / numItems; // Distribute price across items
      
      poItems.push({
        id: randomUUID(),
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity,
        unit: ingredient.unit,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
      });
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        id: randomUUID(),
        po_number,
        quotation_id: quotation.id,
        supplier_id: quotation.supplier_id,
        status,
        order_date: orderDate,
        expected_delivery: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        payment_terms: 'net 30',
        subtotal,
        tax,
        total,
        notes: `PO from quotation ${quotation.id}`,
        reviewed_at: status !== 'draft' ? new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null,
        sent_at: ['sent', 'acknowledged', 'partially_received', 'received'].includes(status) ? new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        acknowledged_at: ['acknowledged', 'partially_received', 'received'].includes(status) ? new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
        items: {
          create: poItems,
        },
      },
    });
    purchaseOrders.push(purchaseOrder);
  }

  return purchaseOrders;
}

async function generatePurchaseRequisitions(ingredients: any[], suppliers: any[]) {
  const purchaseRequisitions = [];
  const prStatuses = ['Pending Approval', 'Approved', 'Rejected', 'Converted to PO'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const adminUser = await prisma.profile.findFirst({ where: { username: 'admin' } });

  // Get the last PR number to start from
  const lastPR = await prisma.purchaseRequisition.findFirst({
    orderBy: { created_at: 'desc' }
  });

  let nextNumber = 1;
  if (lastPR && lastPR.pr_number) {
    const lastNum = parseInt(lastPR.pr_number.replace('#PR-', ''));
    nextNumber = lastNum + 1;
  }

  for (let i = 0; i < 30; i++) {
    const prDate = new Date(startDate);
    prDate.setDate(prDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const status = prStatuses[Math.floor(Math.random() * prStatuses.length)];
    
    // Generate unique PR number
    const pr_number = `#PR-${String(nextNumber).padStart(3, '0')}`;
    nextNumber++;

    // Generate items
    const numItems = 1 + Math.floor(Math.random() * 4); // 1-4 items
    const items = [];
    let totalEstimated = 0;

    for (let j = 0; j < numItems; j++) {
      const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const itemEstimatedPrice = quantity * ingredient.unit_price;
      totalEstimated += itemEstimatedPrice;

      items.push({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity,
        unit: ingredient.unit,
        estimated_price: itemEstimatedPrice,
        supplier_id: supplier.id,
      });
    }

    const pr = await prisma.purchaseRequisition.create({
      data: {
        id: randomUUID(),
        pr_number,
        status,
        requested_by: adminUser!.username,
        total_estimated: totalEstimated,
        notes: 'Purchase requisition for restock',
        approved_at: ['Approved', 'Converted to PO'].includes(status) ? new Date(prDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null,
        approved_by: ['Approved', 'Converted to PO'].includes(status) ? adminUser!.full_name : null,
        created_at: prDate,
        prItems: {
          create: items,
        },
      },
    });
    purchaseRequisitions.push(pr);
  }

  return purchaseRequisitions;
}

async function generateGoodsReceivedNotes(purchaseOrders: any[], ingredients: any[]) {
  const goodsReceivedNotes = [];
  const grnStatuses = ['pending', 'quality_check', 'completed', 'cancelled'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const adminUser = await prisma.profile.findFirst({ where: { username: 'admin' } });

  const processablePOs = purchaseOrders.filter(po => 
    ['sent', 'acknowledged', 'partially_received', 'received'].includes(po.status)
  );

  for (const po of processablePOs) {
    const grnDate = new Date(startDate);
    grnDate.setDate(grnDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const status = grnStatuses[Math.floor(Math.random() * grnStatuses.length)];

    // Generate GRN number
    const year = grnDate.getFullYear();
    const month = String(grnDate.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const grn_number = `GRN-${year}${month}-${random}`;

    const grn = await prisma.goodsReceivedNote.create({
      data: {
        id: randomUUID(),
        grn_number,
        purchase_order_id: po.id,
        supplier_id: po.supplier_id,
        status,
        received_date: grnDate,
        received_by: adminUser!.id,
        received_by_name: adminUser!.full_name,
        delivery_note: `DN-${random}`,
        quality_checked_by: ['quality_check', 'completed'].includes(status) ? adminUser!.id : null,
        quality_checked_at: ['quality_check', 'completed'].includes(status) ? new Date(grnDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null,
        quality_notes: ['quality_check', 'completed'].includes(status) ? 'Quality check passed' : null,
        items: {
          create: (po.items || []).map((item: any) => ({
            id: randomUUID(),
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
            ordered_qty: item.quantity,
            received_qty: item.quantity * (0.9 + Math.random() * 0.2), // 90%-110% of ordered
            unit: item.unit,
            quality_status: ['quality_check', 'completed'].includes(status) ? 'approved' : 'pending',
            batch_number: `BATCH-${year}${month}${Math.floor(Math.random() * 1000)}`,
            expiry_date: new Date(grnDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            stock_updated: ['completed'].includes(status),
          })),
        },
      },
    });
    goodsReceivedNotes.push(grn);

    // Update stock for completed GRNs
    if (status === 'completed' && po.items) {
      for (const item of po.items) {
        const previousStock = await prisma.ingredient.findUnique({
          where: { id: item.ingredient_id }
        });
        
        await prisma.ingredient.update({
          where: { id: item.ingredient_id },
          data: { current_stock: { increment: item.quantity } },
        });

        // Create stock adjustment log
        await prisma.stockAdjustmentLog.create({
          data: {
            id: randomUUID(),
            ingredient_id: item.ingredient_id,
            previous_stock: previousStock?.current_stock || 0,
            new_stock: (previousStock?.current_stock || 0) + item.quantity,
            adjustment_type: 'purchase',
            reason: `Stock received via GRN ${grn.grn_number}`,
            user_id: adminUser!.id,
          },
        });

        // Create stock log
        await createStockLog({
          ingredientId: item.ingredient_id,
          quantity: item.quantity,
          type: 'STOCK_IN',
          referenceId: grn.id,
          referenceType: 'goods_received_note',
          notes: `Stock received via GRN ${grn.grn_number}`,
        });
      }
    }
  }

  return goodsReceivedNotes;
}

async function generateInvoices(goodsReceivedNotes: any[]) {
  const invoices = [];
  const invoiceStatuses = ['pending', 'verified', 'partially_paid', 'paid', 'overdue'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const adminUser = await prisma.profile.findFirst({ where: { username: 'admin' } });

  const completedGRNs = goodsReceivedNotes.filter(grn => grn.status === 'completed');

  for (const grn of completedGRNs) {
    const invoiceDate = new Date(startDate);
    invoiceDate.setDate(invoiceDate.getDate() + Math.floor(Math.random() * daysToCover));
    
    const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];

    // Generate invoice number
    const year = invoiceDate.getFullYear();
    const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const invoice_number = `INV-${year}${month}-${random}`;

    const subtotal = Math.random() * 1000000 + 100000; // 100k-1.1M
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        id: randomUUID(),
        invoice_number,
        grn_id: grn.id,
        supplier_id: grn.supplier_id,
        status,
        invoice_date: invoiceDate,
        due_date: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal,
        tax,
        total,
        payment_terms: 'net 30',
        verified_by: ['verified', 'partially_paid', 'paid', 'overdue'].includes(status) ? adminUser!.id : null,
        verified_at: ['verified', 'partially_paid', 'paid', 'overdue'].includes(status) ? new Date(invoiceDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null,
        notes: `Invoice for GRN ${grn.grn_number}`,
      },
    });
    invoices.push(invoice);
  }

  return invoices;
}

async function generateSupplierPayments(invoices: any[]) {
  const payments = [];
  const paymentStatuses = ['pending', 'completed', 'cancelled'];
  const paymentMethods = ['transfer', 'cash', 'check'];
  const daysToCover = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToCover);

  const adminUser = await prisma.profile.findFirst({ where: { username: 'admin' } });

  const payableInvoices = invoices.filter(inv => 
    ['verified', 'partially_paid', 'paid', 'overdue'].includes(inv.status)
  );

  for (const invoice of payableInvoices) {
    // Generate 1-3 payments per invoice
    const numPayments = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numPayments; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * daysToCover));
      
      const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Partial payments for some invoices
      const amount = i === numPayments - 1 ? 
        invoice.total - payments.filter(p => p.invoice_id === invoice.id).reduce((sum, p) => sum + p.amount, 0) :
        invoice.total / numPayments * (0.8 + Math.random() * 0.4);

      const payment = await prisma.payment.create({
        data: {
          id: randomUUID(),
          invoice_id: invoice.id,
          supplier_id: invoice.supplier_id,
          status,
          payment_date: paymentDate,
          amount: Math.max(0, amount),
          payment_method: paymentMethod,
          reference_number: `REF-${Math.floor(Math.random() * 1000000)}`,
          notes: `Payment for invoice ${invoice.invoice_number}`,
          processed_by: ['completed'].includes(status) ? adminUser!.id : null,
          processed_at: ['completed'].includes(status) ? new Date(paymentDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null,
        },
      });
      payments.push(payment);
    }
  }

  return payments;
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
