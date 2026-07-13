# Kitchen POS - Handover Document

## Project Overview
Kitchen POS is a modern Point of Sale system built with Next.js, TypeScript, and Supabase. It features offline-first capabilities, split bill functionality, table merging, and dynamic product modifiers based on categories.

## Tech Stack
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Offline Storage**: IndexedDB (Dexie.js)
- **Icons**: Lucide React

## Project Structure
```
kitchen-pos-new/
├── app/
│   ├── pos/
│   │   └── page.tsx              # Main POS page
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Header with table merge
│   │   │   ├── Sidebar.tsx      # Category sidebar
│   │   │   └── TableMergeModal.tsx
│   │   └── pos/
│   │       ├── CartPanel.tsx    # Shopping cart
│   │       ├── ModifierModal.tsx # Product modifier selection
│   │       ├── EditProductModal.tsx # Admin product editing
│   │       ├── ProductCard.tsx  # Product display card
│   │       └── Receipt.tsx      # Receipt printing
│   ├── data/
│   │   └── modifiers.ts         # Category-based modifier mapping
│   ├── features/
│   │   ├── pos/
│   │   │   └── components/      # POS-specific components
│   │   └── reports/             # Reporting features
│   ├── hooks/
│   │   ├── useProducts.ts       # Product data fetching
│   │   ├── useSyncManager.ts    # Offline sync management
│   │   └── useOrders.ts         # Order management
│   ├── lib/
│   │   ├── supabaseClient.ts    # Supabase client & API functions
│   │   ├── db.ts                # IndexedDB setup
│   │   ├── database.sql         # Database schema
│   │   └── seedData.ts          # Dummy data seeding
│   ├── store/
│   │   └── useCartStore.ts      # Cart state management
│   └── types/
│       └── database.types.ts    # TypeScript interfaces
```

## Key Features Implemented

### 1. Split Bill
- **Location**: `src/features/pos/components/SplitBillModal.tsx`
- **Function**: `splitBill` in `useCartStore.ts`
- **UI**: Purple "Split Bill" button in CartPanel
- **Flow**: Select items → Split to new transaction → Create separate orders

### 2. Table Merging
- **Location**: `src/components/layout/TableMergeModal.tsx`
- **Function**: `mergeTable` in `useCartStore.ts`
- **UI**: Users icon in Header (Gabung Meja)
- **Flow**: Select source table → Select target table → Move orders

### 3. Dynamic Modifiers by Category
- **Location**: `src/data/modifiers.ts`
- **Categories**:
  - `makanan`: Level Pedas, Topping Makanan
  - `minuman`: Level Gula, Es Batu, Topping Minuman
  - `snack`: Topping Snack
- **Integration**: ModifierModal uses `getModifiersByCategory()`

### 4. Product Management (Admin Only)
- **Location**: `src/features/pos/components/EditProductModal.tsx`
- **Features**:
  - Edit name, description, price
  - Upload/change product image
  - Modifier Manager (add/remove modifiers)
- **Access**: Role-based (admin only)
- **UI**: Edit icon (pencil) in ProductCard

### 5. Offline-First Architecture
- **IndexedDB**: Caches products, categories, modifiers
- **Sync Manager**: Queues changes when offline, syncs when online
- **Cache-First**: Loads from cache, updates from Supabase when online

### 6. Receipt Printing
- **Location**: `src/components/pos/Receipt.tsx`
- **Features**:
  - Thermal printer optimized (300px width)
  - Black text for readability
  - ASCII separators instead of CSS borders
  - UUID order ID (first 4 chars)
  - Date format: dd/mm/yyyy HH:mm

## Environment Setup

### Required Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Database Schema

### Key Tables
- `products`: Product catalog with category_id, price, image_url, description
- `categories`: Product categories
- `modifiers`: Product-specific modifiers
- `orders`: Order records with table_number, payment_method, status
- `order_items`: Order line items with modifiers_applied (JSONB)
- `sync_queue`: Offline sync queue

### Important Notes
- UUID-based schema for scalability
- JSONB for flexible modifier storage
- Row Level Security (RLS) for multi-tenant support

## State Management

### useCartStore (Zustand)
- **Location**: `src/store/useCartStore.ts`
- **State**:
  - `items`: Cart items
  - `tableNumber`: Current table
  - `notes`: Order notes
  - `paymentMethod`: CASH, QRIS, DEBIT
- **Actions**:
  - `addToCart`, `removeFromCart`, `updateQuantity`
  - `processPayment`, `clearCart`
  - `splitBill`, `mergeTable`
  - `assignSplitGroup`, `removeSplitGroup`

## Important Functions

### updateProduct (supabaseClient.ts)
```typescript
updateProduct(productId, { name, description, price, image_url })
```
Updates product in Supabase with auto-timestamp.

### getModifiersByCategory (modifiers.ts)
```typescript
getModifiersByCategory(category: string): ModifierGroup[]
```
Returns modifiers based on product category.

### processPayment (useCartStore.ts)
Handles payment processing with rounding support.

## Known Issues & TODOs

### TODOs
1. **Authentication**: Implement proper user authentication (currently hardcoded role)
2. **Image Upload**: Integrate with Supabase Storage for real image uploads
3. **Modifier Persistence**: Save modifier changes to database (currently UI only)
4. **Error Handling**: Improve error messages and user feedback
5. **Testing**: Add unit and E2E tests

### Known Issues
- CSS lint warning: Unknown at rule @theme (Tailwind CSS v4)
- Modifier type inference warning in useProducts.ts (line 282)
- Role toggle is in Dev Tools (should be in proper auth system)

## Development Notes

### CSS Styling
- All text forced to black (#000000) for readability
- Input borders forced to black for visibility
- Thermal printer CSS reset in @media print

### Role-Based Access
- Admin role: Can edit products
- Cashier role: Can only process orders
- Toggle role in Dev Tools for testing

### Modifier Logic
- Category-based filtering in `getModifiersByCategory()`
- Supports variations: 'makanan'/'food', 'minuman'/'drink'/'beverage'
- Returns empty array for unknown categories

## Git Workflow

### Branch Strategy
- `main`: Production branch
- Feature branches: `feature/feature-name`

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `style:` CSS/styling changes
- `test:` Testing
- `chore:` Maintenance

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Add environment variables
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm start
```

## Contact & Support
- For issues: Check GitHub Issues
- For questions: Contact development team

## Recent Changes (This Session)
1. ✅ Implemented Split Bill feature
2. ✅ Implemented Table Merging feature
3. ✅ Added dynamic modifiers by category
4. ✅ Created EditProductModal for admin
5. ✅ Added role-based access control
6. ✅ Enhanced CSS for black text contrast
7. ✅ Improved receipt printing for thermal printers
8. ✅ Added role toggle in Dev Tools for testing

## Next Steps
1. Implement proper authentication system
2. Integrate Supabase Storage for image uploads
3. Add comprehensive error handling
4. Write unit and E2E tests
5. Optimize offline sync performance
6. Add reporting dashboard
