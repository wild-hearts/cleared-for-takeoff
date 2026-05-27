// Vercel serverless function — handles C4TO enquiry form
// Adds the contact to MailerLite "C4TO Enquiries" group (ID: 188610012205024402)
//
// Required Vercel environment variable:
//   MAILERLITE_API_KEY  →  your MailerLite API token
//   (Settings → Integrations → API in your MailerLite dashboard)

module.exports = async function handler(req, res) {
    // Only accept POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, role, enquiry_type, challenge } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!apiKey) {
        console.error('MAILERLITE_API_KEY environment variable is not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Split full name into first + last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Map enquiry type to a readable label for MailerLite
    const enquiryLabels = {
        'academy-standard': 'Academy Standard ($2,997)',
        'academy-vip': 'Academy VIP ($4,997)',
        'consulting': 'Consulting / Organisation Training',
        'corporate': 'Corporate Package ($12,997)',
        'general': 'General Enquiry'
    };
    const enquiryLabel = enquiryLabels[enquiry_type] || enquiry_type || 'Unknown';

    try {
        const mlResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email,
                fields: {
                    name: firstName,
                    last_name: lastName,
                    company: role || '',
                    // Store enquiry type and challenge in MailerLite's text fields
                    // (set up matching custom fields in your MailerLite account if needed)
                    city: enquiryLabel          // repurposed until custom fields are set up
                },
                groups: ['188610012205024402'],  // C4TO Enquiries group
                status: 'active'
            })
        });

        if (!mlResponse.ok) {
            const errorText = await mlResponse.text();
            console.error('MailerLite API error:', errorText);
            // Still return success to the user — we don't want to alarm them
            // but log the error for debugging
        }

        // Log the challenge text to Vercel function logs
        // (visible in Vercel dashboard → Functions → Logs)
        console.log(`New C4TO enquiry from ${email} | Type: ${enquiryLabel} | Challenge: ${challenge}`);

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Contact form handler error:', err);
        return res.status(500).json({ error: 'Server error — please try again or email us directly' });
    }
}
