# Kitchen POS System

<div align="center">

![Kitchen POS](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A modern, offline-first Point of Sale system built with Next.js 15, featuring real-time synchronization, split bill functionality, and dynamic product modifiers.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

## 🚀 Features

### Core Functionality
- ✅ **Offline-First Architecture** - Works without internet, syncs when online
- ✅ **Split Bill** - Split orders into separate transactions
- ✅ **Table Merging** - Combine orders from multiple tables
- ✅ **Dynamic Modifiers** - Category-based product modifiers (food/drink/snack)
- ✅ **Product Management** - Admin-only product editing interface
- ✅ **Receipt Printing** - Thermal printer optimized receipts
- ✅ **Multi-Cashier Support** - Role-based access control

### Technical Features
- 🎯 **UUID-Based Schema** - Scalable distributed system design
- 🔄 **Automatic Sync** - Seamless offline-to-online synchronization
- 💾 **IndexedDB Storage** - Local caching with Dexie.js
- 🎨 **Tailwind CSS** - Modern, responsive UI
- 🔒 **Type-Safe** - Full TypeScript implementation
- 📱 **PWA Ready** - Progressive Web App support

## 📦 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Zustand** - State management

### Backend & Database
- **PostgreSQL** - Primary database (via Supabase)
- **IndexedDB (Dexie.js)** - Offline local storage
- **Supabase** - Backend-as-a-Service

### Why PostgreSQL?
- 30% better concurrent writes than MySQL
- 3.7x faster JSON queries with JSONB + GIN indexes
- Full ACID compliance and strong data typing
- Native UUID support and Row Level Security

## 📁 Project Structure

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
│   │       ├── Receipt.tsx      # Receipt printing
│   │       └── SplitBillModal.tsx # Split bill interface
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
├── HANDOVER.md                  # Detailed handover document
└── README.md                   # This file
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (via Supabase or self-hosted)
- Supabase project (if using Supabase)

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd kitchen-pos-new
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up the database**
Execute the SQL schema from `src/lib/database.sql` in your PostgreSQL database:
```bash
# If using Supabase, run the SQL in the Supabase SQL Editor
# If using self-hosted PostgreSQL:
psql -U your_user -d your_database -f src/lib/database.sql
```

5. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### Basic Workflow
1. **Select Category** - Choose from sidebar (Makanan, Minuman, Snack)
2. **Add Products** - Click products to add to cart
3. **Select Modifiers** - Choose modifiers based on product category
4. **Set Table** - Enter table number for the order
5. **Add Notes** - Optional order notes
6. **Process Payment** - Select payment method (Cash, QRIS, Debit)
7. **Print Receipt** - Automatic receipt generation

### Advanced Features

#### Split Bill
1. Click "Split Bill" button in CartPanel
2. Select items to split
3. Confirm to create separate transaction

#### Table Merging
1. Click Users icon in Header (Gabung Meja)
2. Select source table
3. Select target table
4. Confirm to merge orders

#### Product Management (Admin Only)
1. Toggle role to "Admin" in Dev Tools
2. Click Edit icon (pencil) on any product
3. Edit name, description, price, or image
4. Manage modifiers
5. Save changes

## 🏗️ Architecture

### Offline-First Architecture

#### Online Mode
- Data stored directly in PostgreSQL via Supabase
- Real-time updates across all connected clients
- No local storage required

#### Offline Mode
- Data stored in IndexedDB (Dexie.js)
- Transactions marked as 'pending'
- UI shows offline status indicator

#### Synchronization
- Automatic sync when device comes online
- Pending orders sent to PostgreSQL
- Status updated from 'pending' to 'synced'
- Manual sync trigger available

### State Management
- **Zustand** for cart state
- **React Context** for user authentication
- **IndexedDB** for offline data persistence

### Database Schema

#### Key Tables
- **profiles** - User/cashier information
- **categories** - Product categories
- **products** - Product catalog with SKU support
- **modifiers** - Product modifiers (extra items)
- **orders** - Transaction records with table number and notes
- **order_items** - Order line items with modifiers (JSONB)
- **sync_queue** - Offline transaction queue

#### UUID-Based Design
- All primary keys use UUIDs for global uniqueness
- Supports distributed systems and future scaling
- Aligns with PostgreSQL best practices

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Development Tools
- **Role Toggle**: Switch between Admin/Cashier in Dev Tools
- **Seed Data**: Populate database with dummy data
- **Clear Data**: Reset database to empty state

## 🚢 Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 📝 Development Plan

### Completed Features
- ✅ Database schema design with UUID-based structure
- ✅ TypeScript types for all database entities
- ✅ Dexie.js IndexedDB setup
- ✅ React hooks for data fetching
- ✅ Zustand cart store with offline support
- ✅ Sync manager for automatic offline-to-online synchronization
- ✅ Payment logic with online/offline handling
- ✅ UI components (ProductCard, CartPanel, ModifierModal)
- ✅ Table number and order notes functionality
- ✅ Split Bill feature
- ✅ Table Merging feature
- ✅ Dynamic modifiers by category
- ✅ Product management (Admin)
- ✅ Receipt printing optimization

### Current Status
- All core features implemented
- Offline-first architecture fully functional
- Database schema aligned with PostgreSQL best practices
- Ready for testing and deployment

### TODO
- [ ] Implement proper authentication system
- [ ] Integrate Supabase Storage for image uploads
- [ ] Add comprehensive error handling
- [ ] Write unit and E2E tests
- [ ] Add reporting dashboard
- [ ] Optimize offline sync performance

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `style:` CSS/styling changes
- `test:` Testing
- `chore:` Maintenance

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the excellent backend-as-a-service
- Dexie.js for the IndexedDB wrapper
- Lucide for the beautiful icons

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**
