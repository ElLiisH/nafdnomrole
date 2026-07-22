// api/staff.js (Vercel Serverless Function)
import { createClient } from '@supabase/supabase-js'; // or pg client

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    const { method } = req;

    // Handle ADD STAFF
    if (method === 'POST') {
        const { data, error } = await supabase
            .from('staff')
            .insert([req.body]);

        if (error) return res.status(400).json({ message: error.message });
        return res.status(200).json({ message: "Staff added", data });
    }

    // Handle DELETE STAFF
    if (method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: "Missing staff ID" });

        const { data, error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({ message: error.message });
        return res.status(200).json({ message: "Staff deleted", data });
    }

    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
}
