import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions
  const permissionsList = [
    // Users
    { name: 'users.view', module: 'users', action: 'view', description: 'View users' },
    { name: 'users.create', module: 'users', action: 'create', description: 'Create users' },
    { name: 'users.update', module: 'users', action: 'update', description: 'Update users' },
    { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
    // Roles
    { name: 'roles.view', module: 'roles', action: 'view', description: 'View roles' },
    { name: 'roles.create', module: 'roles', action: 'create', description: 'Create roles' },
    { name: 'roles.update', module: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },
    // Employees
    { name: 'employees.view', module: 'employees', action: 'view', description: 'View employees' },
    { name: 'employees.create', module: 'employees', action: 'create', description: 'Create employees' },
    { name: 'employees.update', module: 'employees', action: 'update', description: 'Update employees' },
    { name: 'employees.delete', module: 'employees', action: 'delete', description: 'Delete employees' },
    // Departments
    { name: 'departments.view', module: 'departments', action: 'view', description: 'View departments' },
    { name: 'departments.create', module: 'departments', action: 'create', description: 'Create departments' },
    { name: 'departments.update', module: 'departments', action: 'update', description: 'Update departments' },
    { name: 'departments.delete', module: 'departments', action: 'delete', description: 'Delete departments' },
    // Attendance
    { name: 'attendance.view', module: 'attendance', action: 'view', description: 'View attendance' },
    { name: 'attendance.create', module: 'attendance', action: 'create', description: 'Create attendance' },
    { name: 'attendance.update', module: 'attendance', action: 'update', description: 'Update attendance' },
    { name: 'attendance.delete', module: 'attendance', action: 'delete', description: 'Delete attendance' },
    // Leaves
    { name: 'leaves.view', module: 'leaves', action: 'view', description: 'View leaves' },
    { name: 'leaves.create', module: 'leaves', action: 'create', description: 'Create leaves' },
    { name: 'leaves.update', module: 'leaves', action: 'update', description: 'Update leaves' },
    { name: 'leaves.delete', module: 'leaves', action: 'delete', description: 'Delete leaves' },
    { name: 'leaves.approve', module: 'leaves', action: 'approve', description: 'Approve leaves' },
    // Payroll
    { name: 'payroll.view', module: 'payroll', action: 'view', description: 'View payroll' },
    { name: 'payroll.create', module: 'payroll', action: 'create', description: 'Create payroll' },
    { name: 'payroll.update', module: 'payroll', action: 'update', description: 'Update payroll' },
    { name: 'payroll.delete', module: 'payroll', action: 'delete', description: 'Delete payroll' },
    { name: 'payroll.process', module: 'payroll', action: 'process', description: 'Process payroll' },
    // Master Data
    { name: 'master.view', module: 'master', action: 'view', description: 'View master data' },
    { name: 'master.create', module: 'master', action: 'create', description: 'Create master data' },
    { name: 'master.update', module: 'master', action: 'update', description: 'Update master data' },
    { name: 'master.delete', module: 'master', action: 'delete', description: 'Delete master data' },
    // Activity Logs
    { name: 'activity_logs.view', module: 'activity_logs', action: 'view', description: 'View activity logs' },
    // Settings
    { name: 'settings.view', module: 'settings', action: 'view', description: 'View settings' },
    { name: 'settings.update', module: 'settings', action: 'update', description: 'Update settings' },
    // Reports
    { name: 'reports.view', module: 'reports', action: 'view', description: 'View reports' },
    { name: 'reports.export', module: 'reports', action: 'export', description: 'Export reports' },
  ];

  console.log('📝 Creating permissions...');
  const permissions = [];
  for (const perm of permissionsList) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(permission);
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Admin Role with all permissions
  console.log('👑 Creating admin role...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
      isSystem: true,
    },
  });

  // Assign all permissions to admin role
  console.log('🔗 Assigning permissions to admin role...');
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create HR Role
  console.log('👤 Creating HR role...');
  const hrRole = await prisma.role.upsert({
    where: { name: 'hr' },
    update: {},
    create: {
      name: 'hr',
      description: 'HR Manager',
      isSystem: true,
    },
  });

  const hrPermissions = permissions.filter(p => 
    ['employees', 'departments', 'attendance', 'leaves'].includes(p.module)
  );
  for (const permission of hrPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: hrRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: hrRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create Employee Role
  console.log('👤 Creating employee role...');
  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Regular Employee',
      isSystem: true,
    },
  });

  const employeePermissions = permissions.filter(p => 
    p.name === 'attendance.view' || 
    p.name === 'leaves.view' || 
    p.name === 'leaves.create'
  );
  for (const permission of employeePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: employeeRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: employeeRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@speedlimit.com' },
    update: {
      password: hashedPassword,
      roleId: adminRole.id,
    },
    create: {
      email: 'admin@speedlimit.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      phone: '0300-0000000',
      status: 'active',
      roleId: adminRole.id,
    },
  });

  // Seed countries
  console.log('🌍 Seeding countries...');
  const countriesPath = join(__dirname, '..', 'country.json');
  const countriesData = JSON.parse(readFileSync(countriesPath, 'utf-8'));
  
  for (const item of countriesData) {
    await prisma.country.upsert({
      where: { name: item.country },
      update: {},
      create: {
        name: item.country,
        code: item.calling_code?.toString(),
      },
    });
  }
  console.log(`   ✓ ${countriesData.length} countries seeded`);

  // Seed cities (Pakistan)
  console.log('🏙️  Seeding cities...');
  const citiesPath = join(__dirname, '..', 'city.json');
  const citiesData = JSON.parse(readFileSync(citiesPath, 'utf-8'));
  
  const pakistan = await prisma.country.findUnique({ where: { name: 'Pakistan' } });
  if (pakistan) {
    for (const city of citiesData) {
      await prisma.city.upsert({
        where: { name_countryId: { name: city.name, countryId: pakistan.id } },
        update: { lat: city.lat, lng: city.lng },
        create: {
          name: city.name,
          lat: city.lat,
          lng: city.lng,
          countryId: pakistan.id,
        },
      });
    }
    console.log(`   ✓ ${citiesData.length} cities seeded for Pakistan`);
  } else {
    console.log('   ⚠️ Pakistan not found, skipping cities');
  }

  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('✅ Database seeded successfully!');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('🔐 Admin Login Credentials:');
  console.log('   Email:    admin@speedlimit.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  Please change the password after first login!');
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

