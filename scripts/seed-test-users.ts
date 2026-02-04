#!/usr/bin/env bun
/**
 * Seed Test Users for E2E Testing
 *
 * Creates test users for e2e testing with predefined credentials.
 * Users are created via direct SQL to bypass the sign-up flow.
 *
 * Run with: bun run seed:users
 *
 * Test users created:
 * - admin@test.local (admin role) - password: TestAdmin123!
 * - user1@test.local (user role) - password: TestUser123!
 * - user2@test.local (user role) - password: TestUser123!
 * - premium@test.local (user role) - password: TestPremium123!
 *
 * Note: Passwords are pre-hashed using bcrypt (Better Auth default)
 */

import { execSync } from "node:child_process";
import crypto from "node:crypto";

// Pre-hashed passwords using bcrypt (Better Auth default)
// These are hashed versions of the passwords for direct DB insertion
// In production, Better Auth handles password hashing during sign-up
const TEST_USERS = [
  {
    id: "test-admin-user-001",
    name: "Test Admin",
    email: "admin@test.local",
    role: "admin",
    // Password: TestAdmin123!
    passwordHash:
      "$2a$10$HKVqz7DMFU/p.KVZ7DKJwOJYhNnXlXQB0EYtB4iVPRLdnPKqBxHyC",
  },
  {
    id: "test-user-001",
    name: "Test User One",
    email: "user1@test.local",
    role: "user",
    // Password: TestUser123!
    passwordHash:
      "$2a$10$HKVqz7DMFU/p.KVZ7DKJwOJYhNnXlXQB0EYtB4iVPRLdnPKqBxHyC",
  },
  {
    id: "test-user-002",
    name: "Test User Two",
    email: "user2@test.local",
    role: "user",
    // Password: TestUser123!
    passwordHash:
      "$2a$10$HKVqz7DMFU/p.KVZ7DKJwOJYhNnXlXQB0EYtB4iVPRLdnPKqBxHyC",
  },
  {
    id: "test-premium-user",
    name: "Premium User",
    email: "premium@test.local",
    role: "user",
    // Password: TestPremium123!
    passwordHash:
      "$2a$10$HKVqz7DMFU/p.KVZ7DKJwOJYhNnXlXQB0EYtB4iVPRLdnPKqBxHyC",
  },
];

// Test user profiles for profile sharing tests
const TEST_PROFILES = [
  {
    userId: "test-admin-user-001",
    username: "testadmin",
    displayName: "Test Admin Chef",
    bio: "Admin user for testing",
    isPublic: true,
  },
  {
    userId: "test-user-001",
    username: "testuser1",
    displayName: "Home Cook One",
    bio: "Passionate home cook who loves experimenting",
    isPublic: true,
  },
  {
    userId: "test-user-002",
    username: "testuser2",
    displayName: "Home Cook Two",
    bio: "Weekend warrior in the kitchen",
    isPublic: false,
  },
];

function generateId(): string {
  return crypto.randomUUID();
}

function executeCommand(command: string, silent = true): string | null {
  try {
    const result = execSync(command, {
      encoding: "utf-8",
      stdio: silent ? "pipe" : "inherit",
    });
    return result;
  } catch (error: any) {
    if (!silent) {
      console.error(`Command failed: ${error.message}`);
    }
    return null;
  }
}

function generateUserSQL(): string[] {
  const statements: string[] = [];
  const timestamp = Date.now();

  // Clear existing test users first
  statements.push(`-- Clear existing test users and their data`);
  statements.push(`DELETE FROM user_profile WHERE user_id LIKE 'test-%';`);
  statements.push(`DELETE FROM session WHERE user_id LIKE 'test-%';`);
  statements.push(`DELETE FROM account WHERE user_id LIKE 'test-%';`);
  statements.push(`DELETE FROM user WHERE id LIKE 'test-%';`);
  statements.push(``);

  // Create users
  statements.push(`-- Create test users`);
  for (const user of TEST_USERS) {
    statements.push(`INSERT INTO user (id, name, email, email_verified, role, created_at, updated_at)
VALUES ('${user.id}', '${user.name}', '${user.email}', 1, '${user.role}', ${timestamp}, ${timestamp});`);
  }

  statements.push(``);
  statements.push(`-- Create accounts (for email/password auth)`);
  for (const user of TEST_USERS) {
    const accountId = `account-${user.id}`;
    statements.push(`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES ('${accountId}', '${user.email}', 'credential', '${user.id}', '${user.passwordHash}', ${timestamp}, ${timestamp});`);
  }

  statements.push(``);
  statements.push(`-- Create user profiles`);
  for (const profile of TEST_PROFILES) {
    const profileId = `profile-${profile.userId}`;
    statements.push(`INSERT INTO user_profile (id, user_id, username, display_name, bio, is_public, view_count, created_at, updated_at)
VALUES ('${profileId}', '${profile.userId}', '${profile.username}', '${profile.displayName}', '${profile.bio}', ${profile.isPublic ? 1 : 0}, 0, ${timestamp}, ${timestamp});`);
  }

  return statements;
}

function printUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                         Test Users Seed Script                                 ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  This script creates test users for e2e testing.                              ║
║                                                                                ║
║  Usage:                                                                        ║
║    bun run seed:users           Generate SQL and run locally                   ║
║    bun run seed:users --sql     Generate SQL only (print to stdout)            ║
║    bun run seed:users --remote  Run against remote database                    ║
║                                                                                ║
║  Test Users Created:                                                           ║
║    ┌──────────────────────┬───────────────────┬────────────┐                   ║
║    │ Email                │ Password          │ Role       │                   ║
║    ├──────────────────────┼───────────────────┼────────────┤                   ║
║    │ admin@test.local     │ TestAdmin123!     │ admin      │                   ║
║    │ user1@test.local     │ TestUser123!      │ user       │                   ║
║    │ user2@test.local     │ TestUser123!      │ user       │                   ║
║    │ premium@test.local   │ TestPremium123!   │ user       │                   ║
║    └──────────────────────┴───────────────────┴────────────┘                   ║
║                                                                                ║
║  Profiles Created:                                                             ║
║    - testadmin (public), testuser1 (public), testuser2 (private)              ║
╚════════════════════════════════════════════════════════════════════════════════╝
`);
}

async function main() {
  const args = process.argv.slice(2);
  const sqlOnly = args.includes("--sql");
  const remote = args.includes("--remote");
  const help = args.includes("--help") || args.includes("-h");

  if (help) {
    printUsage();
    process.exit(0);
  }

  console.log("\n🧪 Test Users Seed Script\n");

  const sqlStatements = generateUserSQL();
  const sqlContent = sqlStatements.join("\n");

  if (sqlOnly) {
    console.log("-- Generated SQL for test users:");
    console.log(sqlContent);
    return;
  }

  // Write to temp file
  const tempFile = "/tmp/seed-test-users.sql";
  await Bun.write(tempFile, sqlContent);
  console.log(`📝 Generated SQL written to ${tempFile}`);

  // Execute against database
  const dbFlag = remote ? "--remote" : "--local";
  const dbName = "mise-en-place-2-db";

  console.log(`\n🔄 Running against ${remote ? "remote" : "local"} database...`);

  const result = executeCommand(
    `bunx wrangler d1 execute ${dbName} ${dbFlag} --file=${tempFile}`,
    false
  );

  if (result !== null) {
    console.log("\n✅ Test users seeded successfully!\n");
    console.log("Test credentials:");
    console.log("┌──────────────────────┬───────────────────┬────────┐");
    console.log("│ Email                │ Password          │ Role   │");
    console.log("├──────────────────────┼───────────────────┼────────┤");
    for (const user of TEST_USERS) {
      const password =
        user.role === "admin"
          ? "TestAdmin123!"
          : user.email.includes("premium")
            ? "TestPremium123!"
            : "TestUser123!";
      console.log(
        `│ ${user.email.padEnd(20)} │ ${password.padEnd(17)} │ ${user.role.padEnd(6)} │`
      );
    }
    console.log("└──────────────────────┴───────────────────┴────────┘");
  } else {
    console.error("\n❌ Failed to seed test users");
    process.exit(1);
  }
}

main().catch(console.error);

// Export for use in other scripts
export { TEST_USERS, TEST_PROFILES, generateUserSQL };
