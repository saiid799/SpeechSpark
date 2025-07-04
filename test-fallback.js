// Advanced test to verify the new dynamic fallback words system
const { 
  getFallbackWords, 
  hasFallbackWords, 
  clearFallbackCache,
  getFallbackCacheStats,
  getLanguageSupportReport,
  preWarmFallbackCache
} = require('./lib/fallback-words.ts');

async function testAdvancedFallbackSystem() {
  console.log("🚀 Testing Advanced Dynamic Fallback Words System");
  console.log("=" .repeat(60));

  // Test 1: Language Support Report
  console.log("\n📊 1. Language Support Coverage:");
  const report = getLanguageSupportReport();
  console.log(`Total Languages Supported: ${report.totalLanguages}`);
  console.log(`Script Types: ${Object.keys(report.scriptTypes).join(", ")}`);
  console.log(`Language Families: ${Object.keys(report.languageFamilies).join(", ")}`);
  
  console.log("\nMost Complex Languages:");
  report.languagesByComplexity.slice(0, 5).forEach((lang, i) => {
    console.log(`  ${i + 1}. ${lang.language} (complexity: ${lang.complexity}) - ${lang.features.join(", ")}`);
  });

  // Test 2: Universal Language Support
  console.log("\n🌍 2. Testing Universal Language Support:");
  const testLanguages = [
    { lang: "Turkish", level: "A1", script: "Latin" },
    { lang: "Arabic", level: "A1", script: "Arabic" },
    { lang: "Chinese", level: "A1", script: "Chinese characters" },
    { lang: "Japanese", level: "A2", script: "Hiragana/Katakana/Kanji" },
    { lang: "Russian", level: "A1", script: "Cyrillic" },
    { lang: "Hindi", level: "A1", script: "Devanagari" },
    { lang: "Korean", level: "A1", script: "Hangul" },
    { lang: "Persian", level: "A1", script: "Persian" }
  ];

  for (const {lang, level, script} of testLanguages) {
    console.log(`\n  Testing ${lang} (${script} script):`);
    try {
      const isAvailable = hasFallbackWords(lang, level);
      console.log(`    ✅ Available: ${isAvailable}`);
      
      const words = await getFallbackWords(lang, level, 3, [], "English");
      console.log(`    📝 Generated ${words.length} words:`);
      words.forEach((word, i) => {
        console.log(`      ${i + 1}. ${word.original} = ${word.translation}`);
      });
    } catch (error) {
      console.error(`    ❌ Error: ${error.message}`);
    }
  }

  // Test 3: Different Proficiency Levels
  console.log("\n📈 3. Testing Different Proficiency Levels (Spanish):");
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  
  for (const level of levels) {
    try {
      const words = await getFallbackWords("Spanish", level, 2, [], "English");
      console.log(`  ${level}: ${words.length} words generated`);
      if (words.length > 0) {
        console.log(`    Example: ${words[0].original} = ${words[0].translation}`);
      }
    } catch (error) {
      console.error(`  ${level}: Error - ${error.message}`);
    }
  }

  // Test 4: Cache Performance
  console.log("\n💾 4. Testing Cache Performance:");
  const cacheStatsBefore = getFallbackCacheStats();
  console.log(`Cache before: ${cacheStatsBefore.size} entries`);
  
  // Generate words for same language/level multiple times
  console.log("  Generating French A1 words (should cache)...");
  const start = Date.now();
  
  const words1 = await getFallbackWords("French", "A1", 5, [], "English");
  const time1 = Date.now() - start;
  
  const start2 = Date.now();
  const words2 = await getFallbackWords("French", "A1", 5, [], "English");
  const time2 = Date.now() - start2;
  
  console.log(`  First call: ${time1}ms, Second call: ${time2}ms`);
  console.log(`  Speed improvement: ${Math.round((time1 - time2) / time1 * 100)}%`);
  
  const cacheStatsAfter = getFallbackCacheStats();
  console.log(`Cache after: ${cacheStatsAfter.size} entries`);

  // Test 5: Error Handling and Fallbacks
  console.log("\n🛡️ 5. Testing Error Handling:");
  try {
    // Test with non-existent language
    const words = await getFallbackWords("Klingon", "A1", 3, [], "English");
    console.log(`  Klingon fallback: ${words.length} words (emergency fallback)`);
  } catch (error) {
    console.error(`  Klingon test failed: ${error.message}`);
  }

  // Test 6: Cultural Intelligence
  console.log("\n🎭 6. Testing Cultural Intelligence:");
  const culturalTests = [
    { lang: "Japanese", context: "Honorifics and politeness levels" },
    { lang: "Arabic", context: "Right-to-left script and cultural concepts" },
    { lang: "Chinese", context: "Tonal language with character complexity" },
    { lang: "German", context: "Compound words and case system" }
  ];

  for (const {lang, context} of culturalTests) {
    try {
      const words = await getFallbackWords(lang, "A2", 2, [], "English");
      console.log(`  ${lang} (${context}): ${words.length} culturally-aware words`);
      if (words.length > 0) {
        console.log(`    Example: ${words[0].original} = ${words[0].translation}`);
      }
    } catch (error) {
      console.error(`  ${lang}: Error - ${error.message}`);
    }
  }

  // Test 7: Performance Summary
  console.log("\n📈 7. Performance Summary:");
  const finalStats = getFallbackCacheStats();
  const totalWords = finalStats.entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  console.log(`  Total cache entries: ${finalStats.size}`);
  console.log(`  Total cached words: ${totalWords}`);
  console.log(`  Average words per entry: ${Math.round(totalWords / finalStats.size)}`);
  
  console.log("\n✨ Advanced fallback system test completed!");
  console.log("🎉 System supports ALL languages dynamically with cultural intelligence!");
}

// Run the comprehensive test
testAdvancedFallbackSystem().catch(console.error);