const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

//const supabaseURL = process.env.SUPABASE_URL
//const supabaseKey = process.env.SUPABASE_KEY
const supabaseURL = fs.readFileSync('/run/secrets/supabase_url', 'utf8').trim();
const supabaseKey = fs.readFileSync('/run/secrets/supabase_key', 'utf8').trim();
const supabase = createClient(supabaseURL, supabaseKey)

module.exports = supabase;