import { Request, Response } from "express";
import axios from "axios";
import prisma from "../../config/prisma";

export const scanBillController = async (req: Request, res: Response) => {
  const { base64, mimeType } = req.body;

  if (!base64) {
    return res.status(400).json({ success: false, message: "No image provided" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: "GEMINI_API_KEY not set" });
  }

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: base64
              }
            },
            {
              text: `You are a bill/invoice data extractor. Extract data from this bill image and return ONLY a valid JSON object, no markdown, no explanation.

Return this exact structure:
{
  "shopName": "exact shop/vendor name from bill header",
  "invoiceNumber": "invoice or bill number",
  "totalAmount": 1234.50,
  "date": "YYYY-MM-DD",
  "remarks": "comma separated list of main items purchased (max 5 items, max 100 chars)"
}

Rules:
- totalAmount must be a number (the final payable amount including taxes)
- date must be YYYY-MM-DD format, if not found use null
- if any field not found, use null
- remarks should be actual item names from the bill`
            }
          ]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 512,
          thinkingConfig: { thinkingBudget: 0 }
        }
      },
      { timeout: 25000 }
    );

    const rawText: string =
      geminiRes.data?.candidates?.[0]?.content?.parts
        ?.filter((p: any) => !p.thought)
        ?.map((p: any) => p.text || '')
        ?.join('') || '';

    if (!rawText.trim()) {
      return res.status(422).json({ success: false, message: "No data extracted. Try a clearer photo." });
    }

    let extracted: any = {};
    try {
      const clean = rawText.replace(/```json|```/g, '').trim();
      extracted = JSON.parse(clean);
    } catch {
      return res.status(422).json({ success: false, message: "Could not parse bill data. Try a clearer photo." });
    }

    // Shop find or auto-create using Prisma
    let shopId: string | null = null;
    let shopCreated = false;
    const userId = (req as any).user.id; // authenticate middleware se

    if (extracted.shopName) {
      const q = extracted.shopName.trim();

      const existing = await prisma.shop.findFirst({
        where: {
          isActive: true,
          shopName: { contains: q.split(' ')[0], mode: 'insensitive' }
        }
      });

      if (existing) {
        shopId = existing.id;
      } else {
    const newShop = await prisma.shop.create({
      data: {
        shopName: q,
        ownerName: '',   
        phone: '',       
        address: '',     
        createdById: userId,
      }
    });
    shopId = newShop.id;
    shopCreated = true;
   }
  }

return res.json({
  success: true,
  shopId,
  shopName: extracted.shopName || null,
  shopCreated,
  invoiceNumber: extracted.invoiceNumber || null,
  totalAmount: extracted.totalAmount || null,
  date: extracted.date || null,
  remarks: extracted.remarks || null,
});

  } catch (err: any) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ success: false, message: "Gemini timeout — try again." });
    }
    const msg = err?.response?.data?.error?.message || err?.message || 'Scan failed';
    return res.status(500).json({ success: false, message: msg });
  }
};