/**
 * Tag added to every outgoing RFP subject. Mail clients keep it when replying
 * ("Re: RFP: Laptops [Ref: 65f…]"), which lets us match replies to the right RFP.
 */
export const rfpReference = (rfpId) => `[Ref: ${rfpId}]`;

const requireEmailConfig = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email is not configured: set EMAIL_USER and EMAIL_PASS in backend/.env');
    }
};

const formatItem = (item, idx) => {
    const parts = [`${idx + 1}. ${item.name}`];
    if (item.quantity !== undefined && item.quantity !== null) parts.push(`(Qty: ${item.quantity})`);
    let line = parts.join(' ');
    if (item.specs) line += ` - ${item.specs}`;
    return line;
};

export const sendRFPEmail = async (vendorEmail, rfpDetails) => {
    requireEmailConfig();
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const items = rfpDetails.items?.length
        ? rfpDetails.items.map(formatItem).join('\n')
        : 'See description above.';

    const lines = [
        'Dear Vendor,',
        '',
        'We are pleased to share the following Request for Proposal (RFP):',
        '',
        `Title: ${rfpDetails.title}`,
        `Description: ${rfpDetails.description}`,
        `Budget: ${rfpDetails.budget ? `${rfpDetails.currency || 'USD'} ${Number(rfpDetails.budget).toLocaleString()}` : 'Not specified'}`,
        `Deadline: ${rfpDetails.deadline ? new Date(rfpDetails.deadline).toLocaleDateString() : 'Not specified'}`,
    ];
    if (rfpDetails.paymentTerms) lines.push(`Payment terms: ${rfpDetails.paymentTerms}`);
    if (rfpDetails.warranty) lines.push(`Warranty: ${rfpDetails.warranty}`);
    lines.push(
        '',
        'Items Required:',
        items,
        '',
        'Please submit your proposal including:',
        '- Itemized pricing',
        '- Delivery timeline',
        '- Payment terms',
        '- Warranty details',
        '',
        'Please reply to this email with your proposal and keep the subject line unchanged.',
        '',
        'Best regards,',
        'Procurement Team'
    );

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: vendorEmail,
        subject: `RFP: ${rfpDetails.title} ${rfpReference(rfpDetails._id)}`,
        text: lines.join('\n'),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
};

/**
 * Fetch emails with progress callbacks for SSE streaming
 * @param {string} searchCriteria - IMAP search criteria
 * @param {function} onProgress - Callback function (stage, percentage, message, data?)
 */
export const fetchEmailsWithProgress = async (searchCriteria = 'UNSEEN', onProgress = () => { }) => {
    requireEmailConfig();
    const imaps = (await import('imap-simple')).default;
    const { simpleParser } = await import('mailparser');

    const host = process.env.IMAP_HOST || 'imap.gmail.com';
    const config = {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host,
            port: Number(process.env.IMAP_PORT) || 993,
            tls: true,
            authTimeout: 10000,
            // Certificate verification stays ON — this connection carries the mailbox password
            tlsOptions: { servername: host },
        },
    };

    const ownAddress = process.env.EMAIL_USER.toLowerCase();
    let connection;

    try {
        onProgress('connecting', 5, 'Connecting to mail server...');
        connection = await imaps.connect(config);
        onProgress('connecting', 15, 'Connected to mail server');

        await connection.openBox('INBOX');
        onProgress('connecting', 20, 'Opened inbox');

        const since = new Date();
        since.setDate(since.getDate() - 7);

        onProgress('searching', 25, 'Searching for vendor replies...');
        const messages = await connection.search([searchCriteria, ['SINCE', since]], {
            bodies: [''],
            markSeen: false,
        });

        const totalFound = messages.length;
        onProgress('searching', 35, `Found ${totalFound} unread messages`);

        const limitedMessages = messages.reverse().slice(0, 50);
        const totalToProcess = limitedMessages.length;
        onProgress('searching', 40, `Processing ${totalToProcess} newest emails...`);

        onProgress('parsing', 45, 'Parsing email content...');

        let parsedCount = 0;
        const results = await Promise.all(
            limitedMessages.map(async (message) => {
                const all = message.parts.find((part) => part.which === '');
                const parsed = await simpleParser(all.body);

                parsedCount++;
                const parseProgress = 45 + Math.round((parsedCount / Math.max(totalToProcess, 1)) * 40);
                onProgress('parsing', parseProgress, `Parsed ${parsedCount} of ${totalToProcess} emails`);

                const subject = parsed.subject || '';
                const fromAddress = (parsed.from?.value?.[0]?.address || '').toLowerCase();
                const isReply = /^\s*(re|aw|sv)\s*:/i.test(subject);

                if (!isReply || !fromAddress || fromAddress === ownAddress) return null;

                return {
                    uid: message.attributes.uid,
                    from: parsed.from?.text || fromAddress,
                    fromAddress,
                    subject,
                    date: parsed.date,
                    text: parsed.text,
                };
            })
        );

        const emails = results.filter(Boolean);
        onProgress('complete', 100, `Found ${emails.length} vendor replies`, { count: emails.length });
        return emails;
    } catch (error) {
        console.error('Error fetching emails:', error.message);
        onProgress('error', 0, 'Could not read the inbox');

        if (error.message.includes('Invalid credentials') || error.message.includes('AUTHENTICATIONFAILED')) {
            console.error('Check EMAIL_USER and EMAIL_PASS in .env - use an App Password for Gmail');
        } else if (error.message.includes('IMAP')) {
            console.error('Enable IMAP in Gmail Settings -> Forwarding and POP/IMAP');
        }

        throw error;
    } finally {
        try {
            connection?.end();
        } catch {
            // ignore
        }
    }
};
