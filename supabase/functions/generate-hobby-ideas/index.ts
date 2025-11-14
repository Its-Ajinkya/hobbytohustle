import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { hobby } = await req.json()
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured')
    }

    console.log('Generating 10 money-making ideas for hobby:', hobby)

    const prompt = `You are a creative business advisor specialized in monetizing hobbies. Generate 10 diverse, realistic money-making ideas for the hobby: "${hobby}". 

Include both traditional and modern/trending approaches. Make them actionable and beginner-friendly.

For each idea, provide:
1. A catchy method name
2. Clear description (2-3 sentences)
3. Specific tools/platforms
4. Realistic earning potential in INR (Indian Rupees)
5. An appropriate emoji
6. A relevant source URL (learning resource, platform, or tutorial)

Return ONLY a JSON array with this exact structure:
[
  {
    "method": "Method Name",
    "description": "Clear description of the opportunity",
    "tools": "Specific platforms or tools",
    "earnings": "₹X,XXX-₹X,XXX/month",
    "icon": "🎯",
    "source": "https://example.com/relevant-guide"
  }
]`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a creative business advisor. Always return valid JSON arrays as requested.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      console.log('Using default ideas due to API error')
      return new Response(
        JSON.stringify({ ideas: getDefaultIdeas(hobby) }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    console.log('Gemini API response received')

    // Parse the JSON response or create structured response if it's not JSON
    let ideas;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : content
      ideas = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // If not JSON, create structured response from text
      ideas = parseTextToIdeas(content, hobby)
    }

    // Validate we have an array
    if (!Array.isArray(ideas) || ideas.length === 0) {
      ideas = getDefaultIdeas(hobby)
    }

    return new Response(
      JSON.stringify({ ideas }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    console.error('Error in generate-hobby-ideas:', error)
    console.log('Using default ideas due to error')
    // Return default ideas instead of error (better UX)
    return new Response(
      JSON.stringify({ ideas: getDefaultIdeas(hobby || 'your hobby') }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function parseTextToIdeas(content: string, hobby: string) {
  // Fallback parser if OpenAI doesn't return JSON
  const lines = content.split('\n').filter(line => line.trim())
  const ideas = []
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i]
    ideas.push({
      method: `${hobby} Opportunity ${i + 1}`,
      description: line.replace(/^\d+\.?\s*/, '').trim(),
      tools: "Various platforms",
      earnings: "$50-$500/month",
      icon: getRandomIcon()
    })
  }
  
  return ideas.length > 0 ? ideas : getDefaultIdeas(hobby)
}

function getRandomIcon() {
  const icons = ["💡", "🚀", "💰", "🎯", "✨", "🔥", "💎", "🌟", "🎨", "📱"]
  return icons[Math.floor(Math.random() * icons.length)]
}

function getDefaultIdeas(hobby: string) {
  return [
    {
      method: "Content Creation",
      description: `Start a social media presence showcasing your ${hobby} skills and build an audience.`,
      tools: "Instagram, TikTok, YouTube",
      earnings: "₹8,000-₹1,60,000/month",
      icon: "📱"
    },
    {
      method: "Online Courses",
      description: `Teach others your ${hobby} through structured online courses.`,
      tools: "Udemy, Skillshare, Teachable",
      earnings: "₹16,000-₹2,40,000/month",
      icon: "🎓"
    },
    {
      method: "Freelance Services",
      description: `Offer your ${hobby} skills as services to clients.`,
      tools: "Fiverr, Upwork, Facebook",
      earnings: "₹2,000-₹16,000/hour",
      icon: "💼"
    },
    {
      method: "Local Workshops",
      description: `Host in-person ${hobby} workshops in your community.`,
      tools: "Community centers, Eventbrite",
      earnings: "₹4,000-₹24,000/workshop",
      icon: "🏫"
    },
    {
      method: "Digital Products",
      description: `Create and sell templates, guides, or tools related to ${hobby}.`,
      tools: "Etsy, Gumroad, own website",
      earnings: "₹24,000-₹2,40,000/month",
      icon: "💾"
    },
    {
      method: "Affiliate Marketing",
      description: `Review ${hobby} products and earn commissions through affiliate links.`,
      tools: "Blog, YouTube, Amazon Associates",
      earnings: "₹16,000-₹1,60,000/month",
      icon: "⭐"
    },
    {
      method: "Coaching & Consulting",
      description: `Offer one-on-one coaching sessions to help others advance in ${hobby}.`,
      tools: "Zoom, Calendly, social media",
      earnings: "₹4,000-₹24,000/hour",
      icon: "🎯"
    },
    {
      method: "Custom Products",
      description: `Design and sell custom ${hobby}-related products using print-on-demand.`,
      tools: "Printful, Teespring, Etsy",
      earnings: "₹24,000-₹2,00,000/month",
      icon: "🛍️"
    },
    {
      method: "Subscription Service",
      description: `Create monthly boxes or content subscriptions for ${hobby} enthusiasts.`,
      tools: "Cratejoy, Shopify, social media",
      earnings: "₹80,000-₹8,00,000/month",
      icon: "📦"
    },
    {
      method: "Event Hosting",
      description: `Organize ${hobby}-themed events, meetups, or experiences.`,
      tools: "Eventbrite, Meetup, social media",
      earnings: "₹16,000-₹1,60,000/event",
      icon: "🎉"
    }
  ]
}