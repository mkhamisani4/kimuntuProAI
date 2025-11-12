/**
 * Prisma Seed Script
 * Creates sample data for development and testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a sample tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'seed-tenant-001' },
    update: {},
    create: {
      id: 'seed-tenant-001',
      name: 'Kimuntu Demo Tenant',
    },
  });

  console.log('✓ Created tenant:', tenant.name);

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@kimuntupro.com' },
    update: {},
    create: {
      email: 'demo@kimuntupro.com',
      tenantId: tenant.id,
    },
  });

  console.log('✓ Created user:', user.email);

  // Create global feature flags
  const featureFlags = [
    { flagName: 'ai_assistant_enabled', enabled: true },
    { flagName: 'streamlined_plan_enabled', enabled: true },
    { flagName: 'exec_summary_enabled', enabled: true },
    { flagName: 'market_analysis_enabled', enabled: true },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: {
        flagName_tenantId: {
          flagName: flag.flagName,
          tenantId: null,
        },
      },
      update: { enabled: flag.enabled },
      create: {
        flagName: flag.flagName,
        enabled: flag.enabled,
        tenantId: null,
      },
    });
    console.log(`✓ Created feature flag: ${flag.flagName}`);
  }

  // Create a sample document for RAG testing
  const document = await prisma.document.create({
    data: {
      tenantId: tenant.id,
      title: 'Sample Business Plan Guide',
      url: 'https://example.com/business-plan-guide',
      tags: ['business', 'planning', 'startup'],
    },
  });

  console.log('✓ Created sample document:', document.title);

  // Create a sample chunk
  const chunk = await prisma.chunk.create({
    data: {
      documentId: document.id,
      tenantId: tenant.id,
      content:
        'A business plan is a written document that describes your business. It covers objectives, strategies, sales, marketing and financial forecasts. A good business plan will include an executive summary, company description, market analysis, organization structure, product line description, marketing and sales strategy, funding requirements, and financial projections.',
      tokenCount: 65,
    },
  });

  console.log('✓ Created sample chunk for document');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nSample credentials:');
  console.log('  Email: demo@kimuntupro.com');
  console.log('  Tenant ID:', tenant.id);
  console.log('  User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
