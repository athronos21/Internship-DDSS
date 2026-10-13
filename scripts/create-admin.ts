import { auth, authDb, hashPassword } from '../src/server/auth.js';
import { db } from '../src/server/db.js';

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  const email = getArg('--email');
  const name = getArg('--name') || 'Production Administrator';
  const password = getArg('--password');
  const role = getArg('--role') || 'STORE_OWNER';

  if (!email || !password) {
    console.error('Usage: bun scripts/create-admin.ts --email <email> --password <password> [--name <name>] [--role <STORE_OWNER|SUPER_ADMIN>]');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check existing
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    console.error(`Error: User with email ${normalizedEmail} already exists in database.`);
    process.exit(1);
  }

  const hashedPassword = hashPassword(password);
  const userId = `u-admin-${Date.now()}`;

  // Insert into memory/db
  db.users.push({
    id: userId,
    name,
    email: normalizedEmail,
    role: role as any,
    isActive: true,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  // Insert into Better Auth
  try {
    await auth.api.signUpEmail({
      body: {
        email: normalizedEmail,
        password,
        name,
        role,
      } as any,
    });
  } catch (err: any) {
    // If table already has entry or SQLite direct
    if (authDb) {
      try {
        authDb.run('UPDATE user SET role = ? WHERE email = ?', [role, normalizedEmail]);
      } catch {}
    }
  }

  console.log(`\n✅ Administrator successfully created!`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Email:   ${normalizedEmail}`);
  console.log(`   Role:    ${role}\n`);
}

main().catch((err) => {
  console.error('Failed to create administrator:', err);
  process.exit(1);
});
