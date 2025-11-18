console.log("OPENAI_API_KEY LOADED:", !!process.env.OPENAI_API_KEY);
console.log("KEY VALUE:", process.env.OPENAI_API_KEY);

export async function handler(event, context) {
  try {
    const { input } = JSON.parse(event.body);

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
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch from OpenAI API" }),
    };
  }
}
