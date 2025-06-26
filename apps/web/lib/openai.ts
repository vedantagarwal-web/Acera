import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAiInsights(symbol: string, data: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst providing insights about stocks. Be concise and focus on key metrics and trends."
        },
        {
          role: "user",
          content: `Analyze this stock data for ${symbol}: ${JSON.stringify(data)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return 'Unable to generate AI insights at this time.';
  }
} 