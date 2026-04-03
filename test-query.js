const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pnrfjfvagwlxfxzucdhp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucmZqZnZhZ3dseGZ4enVjZGhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDc4NzAsImV4cCI6MjA4NzA4Mzg3MH0.gsf2qA0LK0X2R7bA41qTZAIk9Xi3tPpwmwa5T6sJhII';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const { data: invitations, error } = await supabase
      .from("family_invitations")
      .select("*, families(name, profiles(full_name))");
      
    if (error) {
        console.error("Query Error:", error.message);
    } else {
        console.log("Query Success! Rows:", invitations?.length);
        if (invitations?.length > 0) {
            console.log("First row families structure:", JSON.stringify(invitations[0].families, null, 2));
        }
    }
}

testQuery();
