import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('🔄 Starting Frame Management Migration...\n');

        // Step 1: Add dual-side tracking fields to hive_frame table
        console.log('📝 Step 1: Adding dual-side tracking fields to hive_frame...');

        await prisma.$executeRaw`
      ALTER TABLE hive_frame 
      ADD COLUMN IF NOT EXISTS side_a_honey_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_a_brood_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_a_pollen_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_a_brood_type brood_type,
      ADD COLUMN IF NOT EXISTS side_a_brood_age brood_age,
      ADD COLUMN IF NOT EXISTS side_b_honey_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_b_brood_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_b_pollen_percentage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS side_b_brood_type brood_type,
      ADD COLUMN IF NOT EXISTS side_b_brood_age brood_age;
    `;

        console.log('  ✓ Dual-side fields added successfully\n');

        // Step 2: Create frame_snapshot table
        console.log('📝 Step 2: Creating frame_snapshot table...');

        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS frame_snapshot (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        frame_id UUID NOT NULL,
        
        side_a_honey_percentage INTEGER NOT NULL,
        side_a_brood_percentage INTEGER NOT NULL,
        side_a_pollen_percentage INTEGER NOT NULL,
        side_a_brood_type brood_type,
        side_a_brood_age brood_age,
        
        side_b_honey_percentage INTEGER NOT NULL,
        side_b_brood_percentage INTEGER NOT NULL,
        side_b_pollen_percentage INTEGER NOT NULL,
        side_b_brood_type brood_type,
        side_b_brood_age brood_age,
        
        inspection_id UUID,
        user_id UUID NOT NULL,
        notes TEXT,
        
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        
        CONSTRAINT fk_frame_snapshot_frame FOREIGN KEY (frame_id) 
          REFERENCES hive_frame(id) ON DELETE CASCADE,
        CONSTRAINT fk_frame_snapshot_inspection FOREIGN KEY (inspection_id) 
          REFERENCES inspection(id) ON DELETE SET NULL,
        CONSTRAINT fk_frame_snapshot_user FOREIGN KEY (user_id) 
          REFERENCES user_profile(id) ON DELETE CASCADE
      );
    `;

        console.log('  ✓ frame_snapshot table created successfully\n');

        // Step 3: Create indexes
        console.log('📝 Step 3: Creating indexes...');

        await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_frame_snapshot_frame_id ON frame_snapshot(frame_id);
    `;

        await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_frame_snapshot_frame_recorded ON frame_snapshot(frame_id, recorded_at DESC);
    `;

        await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_frame_snapshot_inspection ON frame_snapshot(inspection_id);
    `;

        console.log('  ✓ Indexes created successfully\n');

        // Step 4: Add comments
        console.log('📝 Step 4: Adding documentation comments...');

        await prisma.$executeRaw`
      COMMENT ON TABLE frame_snapshot IS 'Historical snapshots of frame state for tracking changes over time';
    `;

        console.log('  ✓ Comments added successfully\n');

        // Verify the changes
        console.log('🔍 Verifying changes...');

        const result = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'frame_snapshot'
      ORDER BY ordinal_position;
    `;

        console.log('\n✅ frame_snapshot table created with', result.length, 'columns:');
        result.forEach((col: any) => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n✅ Migration completed successfully!');
        console.log('\nChanges applied:');
        console.log('  ✓ Added 10 dual-side tracking fields to hive_frame table');
        console.log('  ✓ Created frame_snapshot table with 15 columns');
        console.log('  ✓ Created 3 indexes for performance');
        console.log('  ✓ Added documentation comments\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration()
    .then(() => {
        console.log('🎉 Migration process completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration process failed:', error);
        process.exit(1);
    });
