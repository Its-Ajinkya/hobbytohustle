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
    const { hobby } = await req.json();
    
    if (!hobby) {
      return new Response(
        JSON.stringify({ error: 'Hobby is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating course recommendations for hobby:', hobby);

    const prompt = `You are an expert educational advisor specializing in online learning and skill development. 
Generate personalized FREE course recommendations for someone interested in: ${hobby}.

IMPORTANT: Focus on FREE learning resources, especially YouTube channels, playlists, and free online courses.

Return EXACTLY 6 high-quality, diverse FREE course/resource recommendations in valid JSON format.
Each course should be realistic and tailored to different skill levels.

For each recommendation, provide:
- YouTube channel or playlist URL (if available)
- Free course platform links (Coursera free courses, edX, Khan Academy, freeCodeCamp, etc.)
- Quality free tutorials

Return ONLY a JSON array with this structure:
[
  {
    "title": "Course/Resource title",
    "hobby": "${hobby}",
    "provider": "YouTube / Coursera (Free) / edX / Khan Academy / etc.",
    "duration": "Time to complete (e.g., 8 weeks, 12 hours)",
    "rating": 4.5-5.0,
    "students": 1000-50000,
    "price": "Free",
    "level": "Beginner/Intermediate/Advanced/All Levels",
    "description": "Compelling 1-2 sentence description",
    "url": "Direct YouTube or course URL"
  }
]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert educational advisor. Always return valid JSON arrays as requested.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ courses: getDefaultCourses(hobby) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI Response:', content);

    // Parse the response - handle both JSON and text responses
    let courses;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      courses = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback to default courses if parsing fails
      courses = getDefaultCourses(hobby);
    }

    // Validate courses array
    if (!Array.isArray(courses) || courses.length === 0) {
      courses = getDefaultCourses(hobby);
    }

    return new Response(
      JSON.stringify({ courses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-course-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultCourses(hobby: string) {
  return [
    {
      title: `Complete ${hobby} Masterclass`,
      hobby: hobby,
      provider: "Udemy",
      duration: "8 weeks",
      rating: 4.7,
      students: 12500,
      price: "₹3,999",
      level: "Beginner to Advanced",
      description: `Master ${hobby} from basics to advanced techniques with hands-on projects.`,
      url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(hobby)}`
    },
    {
      title: `${hobby} Fundamentals`,
      hobby: hobby,
      provider: "Coursera",
      duration: "6 weeks",
      rating: 4.6,
      students: 8900,
      price: "₹3,199",
      level: "Beginner",
      description: `Learn the essential foundations of ${hobby} with expert instructors.`,
      url: `https://www.coursera.org/courses?query=${encodeURIComponent(hobby)}`
    },
    {
      title: `Advanced ${hobby} Techniques`,
      hobby: hobby,
      provider: "Skillshare",
      duration: "10 weeks",
      rating: 4.8,
      students: 15600,
      price: "₹4,799",
      level: "Advanced",
      description: `Take your ${hobby} skills to the next level with advanced strategies.`,
      url: `https://www.skillshare.com/browse/${encodeURIComponent(hobby)}`
    }
  ];
}
