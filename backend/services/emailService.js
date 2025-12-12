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



/**
 * Fetch emails with progress callbacks for SSE streaming
 * @param {string} searchCriteria - IMAP search criteria
 * @param {function} onProgress - Callback function (stage, percentage, message, data?)
 */
export const fetchEmailsWithProgress = async (searchCriteria = 'UNSEEN', onProgress = () => { }) => {
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
        // Stage 1: Connecting
        onProgress('connecting', 5, 'Connecting to mail server...');
        console.log('Connecting to Gmail IMAP...');
        const connection = await imaps.connect(config);
        console.log('IMAP connection successful');
        onProgress('connecting', 15, 'Connected to mail server');

        await connection.openBox('INBOX');
        onProgress('connecting', 20, 'Opened inbox');

        const since = new Date();
        since.setDate(since.getDate() - 7);

        // Stage 2: Searching
        onProgress('searching', 25, 'Searching for vendor replies...');
        console.log('Searching for emails from last 7 days...');
        const searchCriteriaArray = ['UNSEEN', ['SINCE', since]];

        const messages = await connection.search(searchCriteriaArray, {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: false
        });

        const totalFound = messages.length;
        onProgress('searching', 35, `Found ${totalFound} unread messages`);
        console.log(`Found ${totalFound} unread messages`);

        const reversedMessages = messages.reverse();
        const limitedMessages = reversedMessages.slice(0, 20);
        const totalToProcess = limitedMessages.length;
        onProgress('searching', 40, `Processing ${totalToProcess} newest emails...`);
        console.log(`Processing ${totalToProcess} newest emails...`);

        // Stage 3: Parsing - Use parallel processing with Promise.all
        onProgress('parsing', 45, 'Parsing email content...');

        // Parse all emails in parallel for faster processing
        const parsePromises = limitedMessages.map(async (message, index) => {
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
                return {
                    uid: id,
                    from: parsed.from.text,
                    subject: parsed.subject,
                    date: parsed.date,
                    text: parsed.text,
                    html: parsed.html
                };
            }
            return null;
        });

        // Track progress as emails are parsed
        let parsedCount = 0;
        const results = await Promise.all(
            parsePromises.map(async (promise) => {
                const result = await promise;
                parsedCount++;
                const parseProgress = 45 + Math.round((parsedCount / totalToProcess) * 40);
                onProgress('parsing', parseProgress, `Parsed ${parsedCount} of ${totalToProcess} emails`);
                return result;
            })
        );

        // Filter out null results (non-RFP emails)
        const emails = results.filter(email => email !== null);

        emails.forEach(email => {
            console.log(`Vendor reply from: ${email.from}`);
        });

        connection.end();

        // Stage 4: Complete
        onProgress('complete', 100, `Found ${emails.length} vendor replies`, { count: emails.length });
        console.log(`Successfully fetched ${emails.length} RFP-related emails`);

        return emails;
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        onProgress('error', 0, error.message);

        if (error.message.includes('Invalid credentials') || error.message.includes('AUTHENTICATIONFAILED')) {
            console.error('Check EMAIL_USER and EMAIL_PASS in .env - use App Password for Gmail');
        } else if (error.message.includes('IMAP')) {
            console.error('Enable IMAP in Gmail Settings -> Forwarding and POP/IMAP');
        }

        throw error;
    }
};
