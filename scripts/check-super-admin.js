const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkSuperAdmin() {
 try {
 // Use env or one-time random; never commit a default password
 const password = process.env.CHECK_SUPER_ADMIN_PASSWORD || crypto.randomBytes(16).toString('base64url');

 console.log('Checking SUPER_ADMIN user...');
 
 const superAdmin = await prisma.user.findUnique({
 where: { email: 'admin@icct.edu.ph' }
 });
 
 if (superAdmin) {
 console.log('SUPER_ADMIN user found:');
 console.log('Email:', superAdmin.email);
 console.log('Role:', superAdmin.role);
 console.log('Status:', superAdmin.status);
 console.log('Failed attempts:', superAdmin.failedLoginAttempts);
 console.log('Email verified:', superAdmin.isEmailVerified);
 
 const isValid = await bcrypt.compare(password, superAdmin.passwordHash);
 console.log('Password verification test (using CHECK_SUPER_ADMIN_PASSWORD or generated):', isValid ? ' PASS' : ' FAIL');
 
 if (!isValid) {
 console.log('\n Fixing password...');
 const newPasswordHash = await bcrypt.hash(password, 10);
 await prisma.user.update({
 where: { email: 'admin@icct.edu.ph' },
 data: { 
 passwordHash: newPasswordHash,
 failedLoginAttempts: 0
 }
 });
 console.log('Password updated successfully!');
 
 const updatedUser = await prisma.user.findUnique({
 where: { email: 'admin@icct.edu.ph' }
 });
 const isValidAfter = await bcrypt.compare(password, updatedUser.passwordHash);
 console.log('Password verification after fix:', isValidAfter ? ' PASS' : ' FAIL');
 }
 } else {
 console.log('SUPER_ADMIN user not found');
 console.log('Creating SUPER_ADMIN user...');
 
 const passwordHash = await bcrypt.hash(password, 10);
 await prisma.user.create({
 data: {
 userName: 'superadmin',
 email: 'admin@icct.edu.ph',
 passwordHash: passwordHash,
 role: 'SUPER_ADMIN',
 status: 'ACTIVE',
 isEmailVerified: true,
 twoFactorEnabled: false
 }
 });
 
 console.log('SUPER_ADMIN user created successfully!');
 console.log('Email: admin@icct.edu.ph');
 console.log('Password: (see FINAL CREDENTIALS below)');
 }
 
 console.log('\n FINAL CREDENTIALS:');
 console.log('Email: admin@icct.edu.ph');
 console.log(`Password: ${password}`);
 console.log('Role: SUPER_ADMIN');
 if (!process.env.CHECK_SUPER_ADMIN_PASSWORD) {
 console.log('Set CHECK_SUPER_ADMIN_PASSWORD in .env to use your own password next time.');
 }
 
 } catch (error) {
 console.error('Error:', error.message);
 } finally {
 await prisma.$disconnect();
 }
}

checkSuperAdmin();
