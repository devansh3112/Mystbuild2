import { createClient } from '@supabase/supabase-js';

// Test script to verify storage setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bpllapvarjdtdgwwsaja.supabase.com';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageSetup() {
  console.log('Testing Supabase storage setup...\n');
  
  try {
    // Test 1: Check if buckets exist
    console.log('1. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const manuscriptBucket = buckets.find(b => b.id === 'manuscripts');
    const coversBucket = buckets.find(b => b.id === 'covers');
    
    if (manuscriptBucket) {
      console.log('✅ Manuscripts bucket exists');
      console.log(`   - Public: ${manuscriptBucket.public}`);
      console.log(`   - File size limit: ${manuscriptBucket.file_size_limit} bytes`);
    } else {
      console.log('❌ Manuscripts bucket not found');
    }
    
    if (coversBucket) {
      console.log('✅ Covers bucket exists');
      console.log(`   - Public: ${coversBucket.public}`);
      console.log(`   - File size limit: ${coversBucket.file_size_limit} bytes`);
    } else {
      console.log('❌ Covers bucket not found');
    }
    
    // Test 2: Check database tables
    console.log('\n2. Checking database tables...');
    
    const { data: manuscriptsTest, error: manuscriptsError } = await supabase
      .from('manuscripts')
      .select('count')
      .limit(1);
      
    if (manuscriptsError) {
      console.log('❌ Manuscripts table error:', manuscriptsError.message);
    } else {
      console.log('✅ Manuscripts table accessible');
    }
    
    const { data: uploadsTest, error: uploadsError } = await supabase
      .from('uploads')
      .select('count')
      .limit(1);
      
    if (uploadsError) {
      console.log('❌ Uploads table error:', uploadsError.message);
    } else {
      console.log('✅ Uploads table accessible');
    }
    
    console.log('\n3. Storage setup summary:');
    if (manuscriptBucket && coversBucket) {
      console.log('✅ All storage buckets are configured correctly');
      console.log('✅ Upload functionality should work');
      console.log('\nNext steps:');
      console.log('1. Navigate to http://localhost:8082/upload');
      console.log('2. Log in with your account');
      console.log('3. Try uploading a test document');
    } else {
      console.log('❌ Storage buckets need to be created manually in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageSetup(); 