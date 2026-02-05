const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetAdminPassword() {
 console.log('Resetting admin password...\n');

 try {
 // Use env or generate a one-time random password (never commit a default)
 const newPassword = process.env.RESET_ADMIN_PASSWORD || crypto.randomBytes(16).toString('base64url');
 const hashedPassword = await bcrypt.hash(newPassword, 10);

 // Update the admin user password
 const updatedUser = await prisma.user.update({
 where: { email: 'admin1@icct.edu.ph' },
 data: {
 passwordHash: hashedPassword,
 failedLoginAttempts: 0,
 lastPasswordChange: new Date()
 }
 });

 console.log('Admin password reset successfully!');
 console.log('New credentials:');
 console.log(`- Email: admin1@icct.edu.ph`);
 console.log(`- Password: ${newPassword}`);
 console.log(`- Role: ${updatedUser.role}`);
 console.log(`- Status: ${updatedUser.status}`);

 // Test the new password
 console.log('\n Testing new password...');
 const testUser = await prisma.user.findUnique({
 where: { email: 'admin1@icct.edu.ph' }
 });

 const passwordValid = await bcrypt.compare(newPassword, testUser.passwordHash);
 console.log(`Password verification: ${passwordValid ? 'SUCCESS' : 'FAILED'}`);

 console.log('\n Admin login should now work!');
 console.log('Use these credentials to log in:');
 console.log('Email: admin1@icct.edu.ph');
 console.log('Password: (see above; set RESET_ADMIN_PASSWORD in .env to choose your own)');

 } catch (error) {
 console.error('Failed to reset password:', error);
 } finally {
 await prisma.$disconnect();
 }
}

resetAdminPassword();
