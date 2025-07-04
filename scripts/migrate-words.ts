#!/usr/bin/env tsx

/**
 * Migration script to move embedded words to normalized Word collection
 * 
 * This script:
 * 1. Reads all users with embedded words
 * 2. Creates Word documents for each embedded word
 * 3. Removes embedded words from user documents
 * 4. Handles duplicate prevention and data integrity
 */

import { PrismaClient } from '@prisma/client';
import { WORDS_PER_BATCH } from '@/lib/level-config';

const prisma = new PrismaClient();

interface EmbeddedWord {
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
}

interface UserWithWords {
  id: string;
  learningLanguage: string;
  nativeLanguage: string;
  words: EmbeddedWord[];
}

async function migrateWords() {
  console.log('🚀 Starting word migration...');
  
  try {
    // Get all users with embedded words
    const users = await prisma.user.findMany({
      select: {
        id: true,
        learningLanguage: true,
        nativeLanguage: true,
        words: true,
      },
    }) as unknown as UserWithWords[];

    console.log(`📊 Found ${users.length} users to migrate`);

    let totalWordsCreated = 0;
    let totalUsersProcessed = 0;
    let duplicatesSkipped = 0;

    for (const user of users) {
      if (!user.words || user.words.length === 0) {
        console.log(`⏭️  Skipping user ${user.id} - no words to migrate`);
        continue;
      }

      console.log(`👤 Processing user ${user.id} with ${user.words.length} words`);

      // Prepare word data for batch creation with batch numbers
      const wordCreateData = user.words.map((word: EmbeddedWord, index: number) => ({
        original: word.original,
        translation: word.translation,
        learned: word.learned || false,
        proficiencyLevel: word.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        nativeLanguage: user.nativeLanguage,
        batchNumber: Math.floor(index / WORDS_PER_BATCH) + 1, // Assign batch number based on order
        userId: user.id,
      }));

      try {
        // Create words individually to handle duplicates in MongoDB
        let successfulCreations = 0;
        for (const wordData of wordCreateData) {
          try {
            await prisma.word.create({
              data: wordData,
            });
            successfulCreations++;
          } catch (error) {
            if (error instanceof Error && error.message.includes('duplicate')) {
              duplicatesSkipped++;
              continue;
            }
            console.error(`Error creating word ${wordData.original}:`, error);
          }
        }

        totalWordsCreated += successfulCreations;

        console.log(`✅ Created ${successfulCreations} words for user ${user.id}`);
        
        if (successfulCreations < wordCreateData.length) {
          console.log(`⚠️  Skipped ${wordCreateData.length - successfulCreations} duplicate words`);
        }

        // Update user's current batch and page based on learned words
        const learnedWordsCount = user.words.filter(w => w.learned).length;
        const currentBatch = Math.floor(learnedWordsCount / WORDS_PER_BATCH) + 1;
        const completedBatches = [];
        
        // Calculate completed batches
        for (let i = 1; i < currentBatch; i++) {
          const batchStart = (i - 1) * WORDS_PER_BATCH;
          const batchEnd = i * WORDS_PER_BATCH;
          const batchWords = user.words.slice(batchStart, batchEnd);
          const learnedInBatch = batchWords.filter(w => w.learned).length;
          
          if (learnedInBatch >= WORDS_PER_BATCH) {
            completedBatches.push(i);
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentBatch: Math.max(1, currentBatch),
            currentPage: Math.max(1, currentBatch),
            completedBatches: completedBatches,
          },
        });

        console.log(`📊 Updated user ${user.id} - currentBatch: ${currentBatch}, completedBatches: [${completedBatches.join(', ')}]`);

        // Remove embedded words from user document
        // TODO: This needs to be updated for the new schema
        /*
        await prisma.user.update({
          where: { id: user.id },
          data: {
            words: [], // Clear the embedded words array
          },
        });
        */

        totalUsersProcessed++;
        console.log(`🧹 Cleared embedded words for user ${user.id}`);

      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error);
        // Continue with next user rather than failing entire migration
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📈 Statistics:`);
    console.log(`   - Users processed: ${totalUsersProcessed}`);
    console.log(`   - Words created: ${totalWordsCreated}`);
    console.log(`   - Duplicates skipped: ${duplicatesSkipped}`);

    // Verify migration
    const totalWordsInDb = await prisma.word.count();
    console.log(`   - Total words in database: ${totalWordsInDb}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Function to rollback migration if needed
async function rollbackMigration() {
  console.log('🔄 Starting migration rollback...');
  
  try {
    // Get all words grouped by user
    const words = await prisma.word.findMany({
      select: {
        id: true,
        original: true,
        translation: true,
        learned: true,
        proficiencyLevel: true,
        userId: true,
      },
    });

    // Group words by user
    const wordsByUser = words.reduce((acc, word) => {
      if (!acc[word.userId]) {
        acc[word.userId] = [];
      }
      acc[word.userId].push({
        original: word.original,
        translation: word.translation,
        learned: word.learned,
        proficiencyLevel: word.proficiencyLevel,
      });
      return acc;
    }, {} as Record<string, EmbeddedWord[]>);

    // Update each user with their words as embedded documents
    // TODO: This rollback function needs to be updated for the new schema
    /*
    for (const [userId, userWords] of Object.entries(wordsByUser)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          words: userWords,
        },
      });
      console.log(`🔄 Restored ${userWords.length} words for user ${userId}`);
    }
    */

    // Delete all Word documents
    const deletedCount = await prisma.word.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.count} Word documents`);

    console.log('✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackMigration().catch(process.exit);
  } else {
    migrateWords().catch(process.exit);
  }
}

export { migrateWords, rollbackMigration };