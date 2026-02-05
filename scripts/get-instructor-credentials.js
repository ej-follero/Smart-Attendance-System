/**
 * SECURITY AUDIT / DEV ONLY: Lists instructors and tests for common weak passwords.
 * Never use these passwords as real credentials. For production, no account should match.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function getInstructorCredentials() {
 try {
 console.log('Querying database for instructor credentials...\n');

 // Get all instructors
 const instructors = await prisma.instructor.findMany({
 include: {
 Department: {
 select: {
 departmentName: true,
 departmentCode: true
 }
 }
 },
 orderBy: {
 email: 'asc'
 }
 });

 if (instructors.length === 0) {
 console.log('No instructors found in the database.');
 return;
 }

 console.log(`Found ${instructors.length} instructor(s) in database\n`);
 console.log('═'.repeat(80));

 for (const instructor of instructors) {
 // Get the user record for this instructor
 const user = await prisma.user.findUnique({
 where: { userId: instructor.instructorId },
 select: {
 userId: true,
 userName: true,
 email: true,
 role: true,
 status: true,
 isEmailVerified: true,
 failedLoginAttempts: true,
 createdAt: true
 }
 });

 if (!user) {
 console.log(`Instructor ${instructor.email} has no associated user record.\n`);
 continue;
 }

 console.log('INSTRUCTOR CREDENTIALS');
 console.log('─'.repeat(80));
 console.log(`Email: ${user.email}`);
 console.log(`Username: ${user.userName}`);
 console.log(`Employee ID: ${instructor.employeeId}`);
 console.log(`Name: ${instructor.firstName} ${instructor.middleName} ${instructor.lastName}`);
 console.log(`Department: ${instructor.Department?.departmentName || 'N/A'} (${instructor.Department?.departmentCode || 'N/A'})`);
 console.log(`RFID Tag: ${instructor.rfidTag}`);
 console.log(`Phone: ${instructor.phoneNumber}`);
 console.log(`Office: ${instructor.officeLocation || 'N/A'}`);
 console.log(`Office Hours: ${instructor.officeHours || 'N/A'}`);
 console.log(`Specialization: ${instructor.specialization || 'N/A'}`);
 console.log(`Type: ${instructor.instructorType}`);
 console.log(`Status: ${user.status}`);
 console.log(`Email Verified: ${user.isEmailVerified ? 'Yes' : 'No'}`);
 console.log(`Failed Login Attempts: ${user.failedLoginAttempts}`);
 console.log(`Created: ${user.createdAt.toLocaleString()}`);
 
 // Test common passwords
 const testPasswords = ['Instructor123!', 'instructor123', 'password', 'admin123'];
 console.log(`\n Password Testing:`);
 
 let passwordFound = false;
 for (const testPass of testPasswords) {
 // We can't decrypt the hash, but we can test if it matches
 // We'll need to get the actual password hash from the user
 const userWithHash = await prisma.user.findUnique({
 where: { userId: instructor.instructorId },
 select: { passwordHash: true }
 });
 
 if (userWithHash) {
 const matches = await bcrypt.compare(testPass, userWithHash.passwordHash);
 if (matches) {
 console.log(`Password: ${testPass}`);
 passwordFound = true;
 break;
 }
 }
 }
 
 if (!passwordFound) {
 console.log(`Password: Unknown (not matching common defaults)`);
 console.log(`Run 'node temp/set-sample-credentials.js' to set password to 'Instructor123!'`);
 }
 
 console.log(`\n Login Options:`);
 console.log(`• Email: ${user.email}`);
 console.log(`• Employee ID: ${instructor.employeeId}`);
 console.log(`• Password: ${passwordFound ? 'Instructor123!' : 'Set using script'}`);
 console.log('\n' + '═'.repeat(80) + '\n');
 }

 } catch (error) {
 console.error('Error querying database:', error);
 } finally {
 await prisma.$disconnect();
 }
}

getInstructorCredentials()
 .catch((error) => {
 console.error('Script failed:', error);
 process.exit(1);
 });


