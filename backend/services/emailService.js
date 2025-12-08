import dotenv from 'dotenv';

dotenv.config();

export const sendRFPEmail = async (vendorEmail, rfpDetails) => {
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const emailContent = `
Dear Vendor,

We are pleased to share the following Request for Proposal (RFP):

Title: ${rfpDetails.title}
Description: ${rfpDetails.description}
Budget: ${rfpDetails.budget ? `${rfpDetails.currency} ${rfpDetails.budget}` : 'Not specified'}
Deadline: ${rfpDetails.deadline ? new Date(rfpDetails.deadline).toLocaleDateString() : 'Not specified'}

Items Required:
${rfpDetails.items.map((item, idx) => `${idx + 1}. ${item.name} (Qty: ${item.quantity}) - ${item.specs}`).join('\n')}

Please submit your proposal including:
- Itemized pricing
- Delivery timeline
- Payment terms
- Warranty details

Please reply to this email with your proposal.

Best regards,
Procurement Team
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: vendorEmail,
        subject: `RFP: ${rfpDetails.title}`,
        text: emailContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const fetchEmails = async (searchCriteria = 'UNSEEN') => {
    const imaps = (await import('imap-simple')).default;
    const { simpleParser } = await import('mailparser');

    const config = {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 10000,
            tlsOptions: {
                rejectUnauthorized: false,
                servername: 'imap.gmail.com'
            }
        }
    };

    try {
        console.log('Connecting to Gmail IMAP...');
        const connection = await imaps.connect(config);
        console.log('IMAP connection successful');

        await connection.openBox('INBOX');

        const since = new Date();
        since.setDate(since.getDate() - 7);

        console.log('Searching for emails from last 7 days...');
        const searchCriteriaArray = ['UNSEEN', ['SINCE', since]];

        const messages = await connection.search(searchCriteriaArray, {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false
        });

        console.log(`Found ${messages.length} unread messages`);

        const reversedMessages = messages.reverse();
        const limitedMessages = reversedMessages.slice(0, 20);
        console.log(`Processing ${limitedMessages.length} newest emails...`);

        const emails = [];
        for (const message of limitedMessages) {
            const all = message.parts.find(part => part.which === '');
            const id = message.attributes.uid;
            const idHeader = "Imap-Id: " + id + "\r\n";

            const parsed = await simpleParser(idHeader + all.body);

            const subject = parsed.subject || '';
            const isReply = subject.toLowerCase().startsWith('re:') ||
                subject.toLowerCase().includes('re: rfp');

            const fromAddress = parsed.from?.text?.toLowerCase() || '';
            const isSentByUs = fromAddress.includes(process.env.EMAIL_USER.toLowerCase());

            if (isReply && !isSentByUs) {
                emails.push({
                    uid: id,
                    from: parsed.from.text,
                    subject: parsed.subject,
                    date: parsed.date,
                    text: parsed.text,
                    html: parsed.html
                });
                console.log(`Vendor reply from: ${parsed.from.text}`);
            }
        }

        connection.end();
        console.log(`Successfully fetched ${emails.length} RFP-related emails`);
        return emails;
    } catch (error) {
        console.error('Error fetching emails:', error.message);

        if (error.message.includes('Invalid credentials') || error.message.includes('AUTHENTICATIONFAILED')) {
            console.error('Check EMAIL_USER and EMAIL_PASS in .env - use App Password for Gmail');
        } else if (error.message.includes('IMAP')) {
            console.error('Enable IMAP in Gmail Settings -> Forwarding and POP/IMAP');
        }

        throw error;
    }
};
