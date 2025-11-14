import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating trending hobbies with income potential');

    const prompt = `You are a market trends analyst specializing in hobby monetization and side hustles.

Generate a list of the TOP 6 CURRENTLY TRENDING hobbies that have strong income potential in 2024-2025.

Focus on:
- Emerging trends and popular interests
- Hobbies with proven monetization opportunities
- Realistic income ranges in INR (Indian Rupees)
- Current market demand

Return ONLY a JSON array with this exact structure:
[
  {
    "title": "Hobby name",
    "description": "Brief description of why it's trending and its income potential (2-3 sentences)",
    "category": "Category (e.g., Creative, Tech, Lifestyle, etc.)",
    "incomeRange": "₹X,XXX-₹X,XX,XXX/month",
    "trend": "rising/hot/stable",
    "icon": "🎯"
  }
]

Make sure all hobbies are currently relevant and have real market demand.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      console.log('Using default trending hobbies due to API error');
      return new Response(
        JSON.stringify({ trendingHobbies: getDefaultTrendingHobbies() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('Gemini API response received');

    let trendingHobbies;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      trendingHobbies = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      trendingHobbies = getDefaultTrendingHobbies();
    }

    // Validate we have an array
    if (!Array.isArray(trendingHobbies) || trendingHobbies.length === 0) {
      trendingHobbies = getDefaultTrendingHobbies();
    }

    return new Response(
      JSON.stringify({ trendingHobbies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-trending-hobbies:', error);
    console.log('Using default trending hobbies due to error');
    // Return default hobbies instead of error (better UX)
    return new Response(
      JSON.stringify({ trendingHobbies: getDefaultTrendingHobbies() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultTrendingHobbies() {
  return [
    {
      title: "Content Creation & Social Media",
      description: "Create engaging content on platforms like Instagram, YouTube, and TikTok. Monetize through brand partnerships, ads, and sponsorships.",
      category: "Digital",
      incomeRange: "₹20,000-₹5,00,000/month",
      trend: "hot",
      icon: "📱"
    },
    {
      title: "Digital Art & NFTs",
      description: "Create and sell digital artwork, illustrations, and NFTs. High demand for unique digital assets and custom commissions.",
      category: "Creative",
      incomeRange: "₹30,000-₹3,00,000/month",
      trend: "rising",
      icon: "🎨"
    },
    {
      title: "Fitness Coaching",
      description: "Online personal training, yoga instruction, or fitness consulting. Growing health consciousness drives demand.",
      category: "Lifestyle",
      incomeRange: "₹25,000-₹2,00,000/month",
      trend: "hot",
      icon: "💪"
    },
    {
      title: "Tech Tutorial & Coding",
      description: "Teach programming, web development, or tech skills through courses and tutorials. Ever-growing demand for tech education.",
      category: "Tech",
      incomeRange: "₹40,000-₹4,00,000/month",
      trend: "stable",
      icon: "💻"
    },
    {
      title: "Sustainable Crafts",
      description: "Create eco-friendly products like upcycled fashion, sustainable home decor. Rising environmental awareness fuels demand.",
      category: "Crafts",
      incomeRange: "₹15,000-₹1,50,000/month",
      trend: "rising",
      icon: "♻️"
    },
    {
      title: "Gaming & Streaming",
      description: "Stream gameplay, create gaming content, compete in esports. Massive and growing gaming industry with multiple revenue streams.",
      category: "Entertainment",
      incomeRange: "₹25,000-₹10,00,000/month",
      trend: "hot",
      icon: "🎮"
    }
  ];
}
