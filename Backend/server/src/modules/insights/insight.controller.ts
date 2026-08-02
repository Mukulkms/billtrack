import { Request, Response } from "express";
import axios from "axios";
import prisma from "../../config/prisma";

// Kitne din overdue / upcoming ka window
const UPCOMING_WINDOW_DAYS = 7;

function daysBetween(a: Date, b: Date) {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export const getPaymentInsights = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const upcomingEnd = new Date();
    upcomingEnd.setDate(upcomingEnd.getDate() + UPCOMING_WINDOW_DAYS);

    const bills = await prisma.bill.findMany({
      where: { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
      include: { shop: { select: { id: true, shopName: true, ownerName: true, whatsapp: true, phone: true } } },
      orderBy: { dueDate: "asc" },
    });

    // Shop-wise group karo
    type ShopGroup = {
      shopId: string;
      shopName: string;
      ownerName: string;
      whatsapp: string | null;
      phone: string;
      pendingAmount: number;
      maxDaysOverdue: number; // sabse purana overdue bill
      billCount: number;
      nearestDueDate: string | null;
    };

    const overdueMap = new Map<string, ShopGroup>();
    const upcomingMap = new Map<string, ShopGroup>();

    for (const b of bills) {
      const due = new Date(b.dueDate);
      const daysOverdue = daysBetween(now, due); // negative means overdue
      const pending = Number(b.pendingAmount);
      if (pending <= 0) continue;

      const shopId = b.shopId;
      const base = () => ({
        shopId,
        shopName: b.shop?.shopName || "Unknown",
        ownerName: b.shop?.ownerName || "",
        whatsapp: b.shop?.whatsapp || null,
        phone: b.shop?.phone || "",
        pendingAmount: 0,
        maxDaysOverdue: 0,
        billCount: 0,
        nearestDueDate: null as string | null,
      });

      if (due < now) {
        const g = overdueMap.get(shopId) || base();
        g.pendingAmount += pending;
        g.billCount += 1;
        g.maxDaysOverdue = Math.max(g.maxDaysOverdue, Math.abs(daysOverdue));
        overdueMap.set(shopId, g);
      } else if (due <= upcomingEnd) {
        const g = upcomingMap.get(shopId) || base();
        g.pendingAmount += pending;
        g.billCount += 1;
        if (!g.nearestDueDate || due < new Date(g.nearestDueDate)) {
          g.nearestDueDate = due.toISOString();
        }
        upcomingMap.set(shopId, g);
      }
    }

    const overdue = [...overdueMap.values()].sort((a, b) => b.maxDaysOverdue - a.maxDaysOverdue);
    const upcoming = [...upcomingMap.values()].sort(
      (a, b) => new Date(a.nearestDueDate!).getTime() - new Date(b.nearestDueDate!).getTime()
    );

    const totalOverdueAmount = overdue.reduce((s, g) => s + g.pendingAmount, 0);
    const totalUpcomingAmount = upcoming.reduce((s, g) => s + g.pendingAmount, 0);

    // Gemini se ek chota sa "bot" style hinglish summary bulwao
    let summary = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && (overdue.length > 0 || upcoming.length > 0)) {
      try {
        const compact = {
          overdue: overdue.slice(0, 8).map(g => ({
            shop: g.shopName, amount: g.pendingAmount, daysOverdue: g.maxDaysOverdue,
          })),
          upcoming: upcoming.slice(0, 8).map(g => ({
            shop: g.shopName, amount: g.pendingAmount, dueIn: Math.max(0, daysBetween(new Date(g.nearestDueDate!), now)),
          })),
        };

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [{
              parts: [{
                text: `Tu ek payment collection assistant hai jo ek chote business owner ko uske pending payments ke baare mein casual Hinglish mein 2-3 short lines mein bata raha hai, jaise koi bot alert bhej raha ho. Seedha, to-the-point, thoda urgency ke saath par polite. Numbers/amounts zaroor use karo. Koi markdown nahi, sirf plain text, max 3 short lines.

Data (JSON):
${JSON.stringify(compact)}

Sabse zyada overdue wale shop ka naam zaroor lo pehli line mein agar overdue list khali nahi hai. Agar overdue list khali hai par upcoming hai, to sirf upcoming ke baare mein bata. Agar dono khali hain to bol "Sab clear hai, koi bhi payment due ya overdue nahi hai abhi."`
              }]
            }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 200, thinkingConfig: { thinkingBudget: 0 } },
          },
          { timeout: 15000 }
        );

        summary = geminiRes.data?.candidates?.[0]?.content?.parts
          ?.filter((p: any) => !p.thought)
          ?.map((p: any) => p.text || "")
          ?.join("")
          ?.trim() || "";
      } catch {
        // Gemini fail ho jaye to bhi fallback summary neeche bana denge
        summary = "";
      }
    }

    if (!summary) {
      if (overdue.length === 0 && upcoming.length === 0) {
        summary = "Sab clear hai, koi bhi payment due ya overdue nahi hai abhi.";
      } else if (overdue.length > 0) {
        const top = overdue[0];
        summary = `${overdue.length} shops se total ₹${totalOverdueAmount.toLocaleString("en-IN")} overdue hai. Sabse zyada ${top.shopName} pe, ${top.maxDaysOverdue} din se. Pehle inhe follow up karo.`;
      } else {
        summary = `${upcoming.length} shops ki payment agle ${UPCOMING_WINDOW_DAYS} din mein due hai, total ₹${totalUpcomingAmount.toLocaleString("en-IN")}. Time pe reminder bhej do.`;
      }
    }

    res.json({
      success: true,
      data: {
        summary,
        totalOverdueAmount,
        totalUpcomingAmount,
        overdue,
        upcoming,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || "Insights fetch failed" });
  }
};
