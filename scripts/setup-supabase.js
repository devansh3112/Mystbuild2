#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQL(filePath) {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf8');
    
    console.log(`Running SQL from ${filePath}...`);
    
    // Execute SQL against Supabase
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully executed SQL from ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error executing SQL from ${filePath}:`, error);
    return false;
  }
}

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Run profiles schema first
  const profilesSchemaResult = await runSQL('supabase/profiles_schema.sql');
  
  if (profilesSchemaResult) {
    // Then run main schema
    const schemaResult = await runSQL('supabase/schema.sql');
    
    if (schemaResult) {
      // Finally run seed data
      const seedResult = await runSQL('supabase/seed.sql');
      if (seedResult) {
        console.log('Database setup completed successfully!');
      } else {
        console.log('Database schema created, but seeding failed.');
      }
    } else {
      console.log('Profiles schema created, but main schema failed.');
    }
  } else {
    console.log('Failed to create profiles schema.');
  }
}

setupDatabase().catch(console.error); 