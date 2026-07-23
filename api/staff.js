// api/staff.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Read Environment Variables inside the request context
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Helpful check if keys are missing on Vercel
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ 
            error: 'Server configuration error: SUPABASE_URL or SUPABASE_ANON_KEY environment variable is missing on Vercel.' 
        });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Clean empty string values to null for optional/date fields
        const cleanedData = {};
        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string' && value.trim() === '') {
                cleanedData[key] = null;
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
