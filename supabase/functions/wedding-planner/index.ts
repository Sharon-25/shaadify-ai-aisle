
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || "AIzaSyAitLCIHdv2itbuN0LC48t1UtfhfUEBWwY";
const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');

async function searchWeb(query: string) {
  console.log(`Searching web for: ${query}`);
  try {
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
  } catch (error) {
    console.error("Error in searchWeb:", error);
    return { error: error.message, organic: [] };
  }
}

async function getGeminiResponse(prompt: string, context: string = "") {
  console.log(`Getting Gemini response for prompt: ${prompt.substring(0, 100)}...`);
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `You are a wedding planning expert. Provide detailed, practical advice based on the following context and query:\n\nContext: ${context}\n\nQuery: ${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        }
      })
    });
    
    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data).substring(0, 500) + "...");
    
    if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
      return data.candidates[0].content.parts[0].text || "No content generated.";
    }
    
    if (data.error) {
      console.error("Gemini API error:", data.error);
      return `Error from Gemini API: ${data.error.message || JSON.stringify(data.error)}`;
    }
    
    return "Unable to generate response from Gemini API.";
  } catch (error) {
    console.error("Error in getGeminiResponse:", error);
    return `Error generating response: ${error.message}`;
  }
}

async function processAgentTask(agentKey: string, inputs: any) {
  console.log(`Processing agent task: ${agentKey}`);
  console.log("Inputs received:", JSON.stringify(inputs));

  if (!inputs || typeof inputs !== 'object') {
    return "Error: Invalid inputs provided";
  }

  const { couple_name, wedding_date, city, guest_count, budget, theme, culture, catering_type, 
          travel_accommodation_count, wedding_time, invite_count, current_date } = inputs;
  
  let searchQuery = "";
  let prompt = "";
  
  switch(agentKey) {
    case 'venue_booking':
      searchQuery = `wedding venues in ${city} for ${guest_count} guests`;
      prompt = `As a Venue Research Bot, suggest the best wedding venues in ${city} that can accommodate ${guest_count} guests for ${couple_name}'s wedding on ${wedding_date}. Consider their budget of ${budget} and preferences. Include specific venues with brief descriptions, estimated costs, and availability information.`;
      break;
    case 'catering':
      searchQuery = `wedding catering services ${city} ${catering_type} cuisine`;
      prompt = `As a Wedding Catering Planner, recommend catering options for a ${culture} themed wedding in ${city} for ${guest_count} guests within a budget of ${budget}. The couple prefers ${catering_type} food. Include menu suggestions, service styles, and estimated per-plate costs.`;
      break;
    case 'decoration':
      searchQuery = `${culture} wedding decoration ideas ${theme || ''} trends ${new Date().getFullYear()}`;
      prompt = `As a Wedding Decoration Planning Agent, create a decoration plan for a ${culture} themed wedding. Consider the venue in ${city} and suggest color schemes, floral arrangements, mandap designs, and decor elements within the ${budget} budget for ${couple_name}'s wedding on ${wedding_date}.`;
      break;
    case 'stylists':
      searchQuery = `bridal groom stylists ${city} ${culture} wedding`;
      prompt = `As a Bridal & Groom Stylist Recommendation Agent, suggest 3-5 stylists in ${city} who specialize in ${culture} wedding attire. Include their contact information, social media links, service types, and price ranges for ${couple_name}'s wedding on ${wedding_date}.`;
      break;
    case 'accommodation':
      searchQuery = `hotels wedding guest accommodation ${city} near wedding venues`;
      prompt = `As an Accommodation & Stay Logistics Agent, recommend lodging options for ${travel_accommodation_count || guest_count / 2} outstation guests in ${city} for ${couple_name}'s wedding on ${wedding_date}. Include hotel names, price ranges, amenities, and proximity to the venue within ${budget} budget.`;
      break;
    case 'priest':
      searchQuery = `${culture} wedding priest officiant ${city}`;
      prompt = `As a Wedding Priest Finder Agent, suggest 2-3 priests or officiants who can perform a ${culture} wedding ceremony in ${city} on ${wedding_date} at ${wedding_time || 'the scheduled time'}. Include their languages spoken, rituals supported, and contact information.`;
      break;
    case 'dress':
      searchQuery = `${culture} wedding attire shops ${city}`;
      prompt = `As a Wedding Dress & Attire Assistant, recommend where ${couple_name} can shop for wedding attire that reflects ${culture} traditions within their ${budget} budget in ${city}. Include stores or websites, sample images, price ranges, and delivery timeframes.`;
      break;
    case 'transportation':
      searchQuery = `wedding guest transportation services ${city}`;
      prompt = `As a Wedding Transport Manager, plan transportation for ${guest_count} guests in ${city} on ${wedding_date}. Include suggested vehicle types, pickup/drop-off logistics, estimated costs, and reliable vendors that can accommodate the wedding party.`;
      break;
    case 'invitation':
      searchQuery = `${culture} wedding invitation designs digital print`;
      prompt = `As an Invitation Design & Print Agent, suggest designs for ${invite_count || guest_count} wedding invitations for ${couple_name}'s ${culture} wedding on ${wedding_date}. Include both physical and digital options, printing vendors, cost estimates, and delivery timelines.`;
      break;
    case 'photographer':
      searchQuery = `wedding photographers videographers ${city}`;
      prompt = `As a Wedding Photography Coordinator, recommend 3-5 photography teams in ${city} available for ${couple_name}'s wedding on ${wedding_date}. Include portfolio links, package details, pricing information, and contact methods within the ${budget} budget.`;
      break;
    case 'budget':
      searchQuery = `wedding budget allocation ${culture} wedding ${city}`;
      prompt = `As a Wedding Budget Allocation Planner, divide the total budget of ${budget} for ${couple_name}'s wedding with ${guest_count} guests. Provide a detailed breakdown for venue, catering, decoration, attire, accommodation, transportation, photography, and other essential categories.`;
      break;
    case 'checklist':
      searchQuery = `wedding planning timeline checklist ${culture} wedding`;
      prompt = `As a Wedding Planning Timeline Generator, create a comprehensive timeline from ${current_date || 'today'} until ${wedding_date} for ${couple_name}'s ${culture} wedding. Include monthly, weekly, and daily tasks with vendor booking deadlines and preparation milestones.`;
      break;
    case 'rituals':
      searchQuery = `${culture} wedding rituals ceremonies traditions`;
      prompt = `As a Cultural & Religious Ritual Advisor, provide detailed guidance on essential rituals for a ${culture} wedding ceremony on ${wedding_date}. Include the order of ceremonies, their significance, required items, and recommended timing for each ritual.`;
      break;
    case 'guest_support':
      searchQuery = `wedding guest information package ${city}`;
      prompt = `As a Guest Support Chat Concierge, create a comprehensive information guide for ${guest_count} guests attending ${couple_name}'s wedding in ${city} on ${wedding_date}. Include travel information, venue details, accommodation options, event timeline, dress code, and emergency contacts.`;
      break;
    case 'weather':
      searchQuery = `${city} weather forecast ${wedding_date} wedding season`;
      prompt = `As a Wedding Weather Monitor, provide a weather forecast for ${city} on and around ${wedding_date}. Include contingency suggestions for outdoor events, recommendations for guest comfort, and any seasonal considerations for ${couple_name}'s wedding.`;
      break;
    default:
      return `Agent '${agentKey}' not configured`;
  }
  
  try {
    console.log(`Search query: ${searchQuery}`);
    const searchResults = await searchWeb(searchQuery);
    console.log(`Search results: ${searchResults.organic ? searchResults.organic.length : 0} items`);
    
    const context = JSON.stringify(searchResults.organic?.slice(0, 3) || []);
    const response = await getGeminiResponse(prompt, context);
    console.log(`Generated response for ${agentKey}`);
    return response;
  } catch (error) {
    console.error(`Error in ${agentKey}:`, error);
    return `Error processing ${agentKey}: ${error.message}`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function called");
    const { agentKey, inputs } = await req.json();
    
    if (!agentKey) {
      throw new Error('Missing required parameter: agentKey');
    }

    console.log(`Processing request for agent: ${agentKey}`);
    
    const result = await processAgentTask(agentKey, inputs || {});

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
