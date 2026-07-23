// api/staff.js
module.exports = async function handler(req, res) {
    // Enable CORS headers immediately
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Require Supabase inside handler to capture module load issues cleanly
        const { createClient } = require('@supabase/supabase-js');

        const supabaseUrl = 'https://ivzrnkdyymngghidqkyd.supabase.co';
        
        // PASTE YOUR LONG service_role JWT KEY HERE (must start with eyJ...)
        const supabaseKey = 'YOUR_LONG_SERVICE_ROLE_JWT_KEY_HERE';

        const supabase = createClient(supabaseUrl, supabaseKey);

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
        return res.status(500).json({ error: 'Server Handler Crash: ' + err.message });
    }
};
