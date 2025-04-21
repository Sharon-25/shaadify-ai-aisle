
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');

async function searchWeb(query: string) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      num: 5
    })
  });
  return await response.json();
}

async function getAIResponse(prompt: string, context: string = "") {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a wedding planning expert. Provide detailed, practical advice based on the context and query provided." },
        { role: "user", content: `Context: ${context}\n\nQuery: ${prompt}` }
      ],
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function processAgentTask(agentKey: string, inputs: any) {
  const { couple_name, wedding_date, city, guest_count, budget, theme } = inputs;
  
  let searchQuery = "";
  let prompt = "";
  
  switch(agentKey) {
    case 'venue_booking':
      searchQuery = `wedding venues in ${city} for ${guest_count} guests`;
      prompt = `Suggest the best wedding venues in ${city} that can accommodate ${guest_count} guests. Consider the ${theme} theme and budget of ${budget}. Include specific venues with brief descriptions and estimated costs.`;
      break;
    case 'catering':
      searchQuery = `wedding catering services ${city} ${theme} cuisine`;
      prompt = `Recommend catering options for a ${theme} themed wedding in ${city} for ${guest_count} guests within a budget of ${budget}. Include menu suggestions and service styles.`;
      break;
    case 'decoration':
      searchQuery = `${theme} wedding decoration ideas trends ${new Date().getFullYear()}`;
      prompt = `Create a decoration plan for a ${theme} themed wedding. Consider the venue type in ${city} and suggest color schemes, floral arrangements, and decor elements within the ${budget} budget.`;
      break;
    // ... Add cases for other agents
    default:
      return "Agent not configured";
  }
  
  try {
    const searchResults = await searchWeb(searchQuery);
    const context = JSON.stringify(searchResults.organic?.slice(0, 3));
    return await getAIResponse(prompt, context);
  } catch (error) {
    console.error(`Error in ${agentKey}:`, error);
    return `Error processing ${agentKey}: ${error.message}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentKey, inputs } = await req.json();
    
    if (!agentKey || !inputs) {
      throw new Error('Missing required parameters');
    }

    const result = await processAgentTask(agentKey, inputs);

    return new Response(JSON.stringify({ output: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
