// api/staff.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Enable CORS for frontend requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Restrict endpoint to POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Direct Supabase Credentials
    const supabaseUrl = 'https://ivzrnkdyymngghidqkyd.supabase.co';
    const supabaseKey = 'sb_publishable_-A8sW_NQysSl-kN6GD9byA_0q-b96Q1';

    // Initialize Supabase Client
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Parse JSON body if passed as string
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Clean empty string inputs to null so SQL date/optional fields don't throw syntax errors
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

        // Insert new staff record into the public.staff table
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
