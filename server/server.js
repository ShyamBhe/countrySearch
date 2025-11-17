import express from "express";
import cors from "cors";
import fetch from "node-fetch"; 

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { input } = req.body;

    const prompt = `Give me a short description of ${input}.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with ${response.status}`);
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "No response generated.";

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to fetch from OpenAI API" });
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
