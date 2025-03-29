// src/app/api/describe-image/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // <-- Make sure this env var is defined!
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image in 1 sentence.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Groq API Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({
    description: data.choices?.[0]?.message?.content || "No description returned.",
  });
}
