// scripts/hash-password.js
// Usage: node scripts/hash-password.js <username> <password> [role] [employee_id]
// Example: node scripts/hash-password.js ModernTech "moderntech$" hr_admin

const bcrypt = require('bcrypt');

async function main() {
  const [username, password, role = 'hr_admin', employeeId = 'NULL'] = process.argv.slice(2);

  if (!username || !password) {
    console.log('Usage: node scripts/hash-password.js <username> <password> [role] [employee_id]');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  console.log('\nHashed password:');
  console.log(hash);

  console.log('\nRun this SQL against your database to create the user:\n');
  console.log(
    `INSERT INTO users (username, password_hash, role, employee_id) VALUES ('${username}', '${hash}', '${role}', ${employeeId});`
  );
}

main();