const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

function cleanJson(text) {
  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeAmount(value) {
  if (value === null || value === undefined) return "";

  const s = String(value).replace(",", ".").trim();
  const m = s.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  if (!m) return "";

  return Number(m[1]).toFixed(2);
}

function normalizeDate(value) {
  if (!value) return "";

  const s = String(value).trim();
  const m = s.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
  if (!m) return "";

  return `${m[1]}.${m[2]}.${m[3]}`;
}

app.get("/", (req, res) => {
  res.send("OCR server running");
});

app.post("/ocr", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const prompt = `
Privește bonul fiscal și extrage exact aceste 3 câmpuri.
Răspunde DOAR JSON valid, fără text în plus:

{
  "store": "...",
  "amount": "...",
  "date": "..."
}

Reguli:
1. "amount" = totalul final plătit de pe bon.
2. Caută indicii precum: SUMME, TOTAL, BRUTTO, BETRAG, EUR.
3. Nu lua prețul unui produs individual.
4. Dacă vezi mai multe sume, alege suma finală de plată.
5. "date" trebuie în format DD.MM.YYYY.
6. "store" trebuie să fie numele magazinului sau firmei.
7. Dacă nu e sigur, încearcă cea mai bună valoare observabilă.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${image}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    const text =
      data.output_text ||
      data.output?.flatMap((item) => item.content || [])
        ?.find((c) => c.type === "output_text")
        ?.text ||
      "";

    console.log("OCR RAW:", text);

    const parsed = cleanJson(text);

    if (!parsed) {
      return res.status(500).json({
        error: "Could not parse OCR JSON",
        raw: text,
      });
    }

    const result = {
      store: String(parsed.store || "").trim(),
      amount: normalizeAmount(parsed.amount),
      date: normalizeDate(parsed.date),
    };

    console.log("OCR PARSED:", result);

    return res.json(result);
  } catch (error) {
    console.error("OCR ERROR:", error);
    return res.status(500).json({
      error: "OCR server error",
      details: String(error),
    });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("OCR server running on port 3001");
});
