// api/staff.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const supabaseUrl = 'https://ivzrnkdyymngghidqkyd.supabase.co';
    
    // REPLACE THIS WITH YOUR LONG "service_role" JWT KEY (starts with eyJ...)
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6d2tud29zbXFneHh6bWRoaGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNTg0ODQsImV4cCI6MjA5MjkzNDQ4NH0.-dX_itjfeB4R9wpZO2lypglkuOprjcj5QwzHmFOCK3M'; 

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const cleanedData = {};
        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string' && value.trim() === '') {
                cleanedData[key] = null;
            } else if (typeof value === 'string') {
                cleanedData[key] = value.trim();
            } else {
                cleanedData[key] = value;
            }
        }

        const { data, error } = await supabase
            .from('staff')
            .insert([cleanedData])
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ message: 'Staff record added successfully', data });
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
    }
};
