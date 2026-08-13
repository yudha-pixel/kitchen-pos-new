# Database Context

- Database: PostgreSQL via Prisma ORM
- Database name: `kitchen_pos`
- Schema file: `prisma/schema.prisma`
- The user model is `Profile` (mapped to `profiles` table), not `User`
- Preferences are stored as JSON in `Profile.preferences`
- All user authentication goes through `Profile` with `password_hash` (bcrypt)
- Role-based permissions via `Role` → `RolePermission` → `Permission` chain
