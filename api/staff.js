// api/staff.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const rawUrl = process.env.SUPABASE_URL;
    const rawKey = process.env.SUPABASE_ANON_KEY;

    if (!rawUrl || !rawKey) {
        return res.status(500).json({ 
            error: 'Server configuration error: SUPABASE_URL or SUPABASE_ANON_KEY environment variable is missing on Vercel.' 
        });
    }

    // Thoroughly clean inputs (remove quotes, whitespace, trailing slashes)
    const cleanKey = rawKey.replace(/['"]/g, '').trim();
    let cleanUrl = rawUrl.replace(/['"]/g, '').trim();

    // Extract ONLY origin (https://ivzrnkdyymngghidqkyd.supabase.co)
    try {
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `https://${cleanUrl}`;
        }
        const parsed = new URL(cleanUrl);
        cleanUrl = parsed.origin;
    } catch (e) {
        return res.status(500).json({ error: `Malformed SUPABASE_URL format: "${rawUrl}"` });
    }

    // Create Supabase client with guaranteed clean URL & key
    const supabase = createClient(cleanUrl, cleanKey);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Convert empty string form inputs to null for optional/date fields
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
