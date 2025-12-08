import dotenv from 'dotenv';

dotenv.config();

const OpenAI = (await import('openai')).default;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateRFPFromNL = async (naturalLanguageText) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert procurement assistant. Extract structured RFP information from natural language.
Return ONLY valid JSON with this exact structure:
{
  "title": "Brief title for this RFP",
  "description": "Detailed description",
  "budget": number or null,
  "currency": "USD" or other currency,
  "deadline": "YYYY-MM-DD" or null,
  "items": [{"name": "Item name", "quantity": number, "specs": "specifications"}],
  "paymentTerms": "Payment terms if mentioned",
  "warranty": "Warranty requirements if mentioned"
}`
                },
                {
                    role: "user",
                    content: naturalLanguageText
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI Processing Error:', error.message);
        throw error;
    }
};

export const parseVendorResponse = async (emailBody, rfpDetails) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert at extracting structured proposal data from vendor emails.
Return ONLY valid JSON with this exact structure:
{
  "totalPrice": number or null,
  "currency": "USD" or other,
  "items": [{"name": "item", "unitPrice": number, "quantity": number, "totalPrice": number}],
  "deliveryTime": "delivery timeline",
  "paymentTerms": "payment terms",
  "warranty": "warranty details",
  "notes": "any additional notes"
}`
                },
                {
                    role: "user",
                    content: `RFP Requirements:\n${JSON.stringify(rfpDetails, null, 2)}\n\nVendor Email:\n${emailBody}`
                }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI Processing Error:', error.message);
        throw error;
    }
};

export const compareProposals = async (rfpDetails, proposals) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert procurement analyst. Analyze vendor proposals and provide a detailed comparison.
Return ONLY valid JSON with this structure:
{
  "summary": "Overall summary of all proposals",
  "vendorScores": [{"vendorId": "id", "score": 0-100, "strengths": ["..."], "weaknesses": ["..."]}],
  "recommendation": {
    "recommendedVendorId": "id",
    "reasoning": "Detailed explanation of why this vendor is recommended",
    "considerations": ["Important points to consider"]
  }
}`
                },
                {
                    role: "user",
                    content: `RFP Details:\n${JSON.stringify(rfpDetails, null, 2)}\n\nProposals:\n${JSON.stringify(proposals, null, 2)}`
                }
            ],
            temperature: 0.4,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI Processing Error:', error.message);
        throw error;
    }
};
