require("dotenv").config();

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    //Safely decode Base64 if sent by Netlify/Lambda CLI
    let rawBody = event.body || "";
    if (event.isBase64Encoded) {
      rawBody = Buffer.from(rawBody, "base64").toString("utf-8");
    }

    // Safely parse JSON payload
    let parsedBody = {};
    if (rawBody) {
      try {
        parsedBody = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
      } catch (e) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid JSON format in request body" }),
        };
      }
    }

    const input = parsedBody?.input;

    if (!input || typeof input !== "string" || !input.trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Input is required" }),
      };
    }

    // Clean environment variable reading
    const rawKey = process.env.GEMINI_API_KEY || "";
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from process.env");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Gemini API key is not configured" }),
      };
    }

    const prompt = `You are a helpful Country Assistant.

Answer the user's question clearly, accurately, and well-structured using proper Markdown syntax.

When listing facts, place headers (###) on new lines and keep bullet points (*) clearly separated on individual lines.

User question:
${input.trim()}`;

    // 4. API fetch request
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data?.error?.message || "Gemini API request failed",
        }),
      };
    }

    let rawReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    const reply = rawReply
      .replace(/\s*(###+|\*\*)/g, "\n\n$1")
      .replace(/\s*\*\s+/g, "\n* ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error("Fatal lambda execution error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.message || "Internal server error",
      }),
    };
  }
};