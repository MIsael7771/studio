import OpenAI from "openai";

export async function POST(request) {
  const { message } = await request.json();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente experto en programación" },
        { role: "user", content: message }
      ]
    });

    return new Response(
      JSON.stringify({ respuesta: respuesta.choices[0].message.content }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error en la API" }), {
      status: 500
    });
  }
}
