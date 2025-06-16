const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

/* This is for PRODUCTION!!!*/

const supabaseURL = fs.readFileSync('/run/secrets/supabase_url', 'utf8').trim();
const supabaseKey = fs.readFileSync('/run/secrets/supabase_key', 'utf8').trim();


/* Below 5 lines are for DEV!!!

const path = require('path');
const secretPath1 = path.join(__dirname, '..', '..', 'secrets', 'supabase_url');
const supabaseURL = fs.readFileSync(secretPath1, 'utf8').trim();
const secretPath2 = path.join(__dirname, '..', '..', 'secrets', 'supabase_key');
const supabaseKey = fs.readFileSync(secretPath2, 'utf8').trim();
*/

const supabase = createClient(supabaseURL, supabaseKey)

module.exports = supabase;