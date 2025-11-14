import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { FilterSidebar } from "@/components/FilterSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const opportunities = [
  {
    id: 1,
    title: "Photographer Needed",
    description: "Looking for a photographer for a birthday party this weekend in Koregaon Park.",
    location: "koregaon-park",
    category: "photography",
    budget: 5000,
    datePosted: "today",
  },
  {
    id: 2,
    title: "Custom Cake Request",
    description: "Need a home baker for a themed cake for a child's birthday. Hinjewadi area.",
    location: "hinjewadi",
    category: "baking",
    budget: 3000,
    datePosted: "week",
  },
  {
    id: 3,
    title: "Logo Design for a New Cafe",
    description: "A new cafe in Viman Nagar is looking for a freelance graphic designer to create a logo.",
    location: "viman-nagar",
    category: "design",
    budget: 8000,
    datePosted: "week",
  },
  {
    id: 4,
    title: "Personal Fitness Trainer",
    description: "Looking for a certified fitness trainer for home sessions in Wakad area.",
    location: "wakad",
    category: "fitness",
    budget: 12000,
    datePosted: "today",
  },
  {
    id: 5,
    title: "Handmade Jewelry for Wedding",
    description: "Need a craftsperson to create custom jewelry pieces for a wedding in Kothrud.",
    location: "kothrud",
    category: "crafts",
    budget: 15000,
    datePosted: "month",
  },
  {
    id: 6,
    title: "Social Media Content Creator",
    description: "Small business in Koregaon Park needs monthly content creation for Instagram and Facebook.",
    location: "koregaon-park",
    category: "content",
    budget: 20000,
    datePosted: "week",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [hobby, setHobby] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [trendingHobbies, setTrendingHobbies] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  
  // Filter states
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");
  const [budget, setBudget] = useState([0, 50000]);
  const [datePosted, setDatePosted] = useState("all");

  // Load trending hobbies on mount
  useEffect(() => {
    // Only load trending hobbies once on mount
    if (trendingHobbies.length === 0) {
      loadTrendingHobbies();
    }
  }, []);

  const loadTrendingHobbies = async () => {
    setLoadingTrending(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-trending-hobbies');
      
      if (error) throw error;
      
      if (data?.trendingHobbies) {
        setTrendingHobbies(data.trendingHobbies);
      }
    } catch (error) {
      console.error('Error loading trending hobbies:', error);
      toast.error('Failed to load trending hobbies');
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleResetFilters = () => {
    setLocation("all");
    setCategory("all");
    setBudget([0, 50000]);
    setDatePosted("all");
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesLocation = location === "all" || opp.location === location;
    const matchesCategory = category === "all" || opp.category === category;
    const matchesBudget = opp.budget >= budget[0] && opp.budget <= budget[1];
    const matchesDate = datePosted === "all" || opp.datePosted === datePosted;

    return matchesLocation && matchesCategory && matchesBudget && matchesDate;
  });

  const handleGenerateIdeas = async () => {
    if (!hobby.trim()) {
      toast.error("Please enter your hobby first! 🎯");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-hobby-ideas', {
        body: { hobby: hobby.trim() }
      });
      
      if (error) throw error;
      
      if (data?.ideas) {
        setGeneratedIdeas(data.ideas);
        toast.success("AI-powered ideas generated! 🤖✨");
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error("Error generating ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Hobby to Hustle
            </h1>
            <nav className="flex items-center gap-12">
              <button 
                onClick={() => scrollToSection('trending')}
                className="text-foreground hover:text-foreground/80 transition-colors text-base"
              >
                Trending
              </button>
              <button 
                onClick={() => scrollToSection('live-opportunities')}
                className="text-foreground hover:text-foreground/80 transition-colors text-base"
              >
                Live Opportunities
              </button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/learn")}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Learn
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Turn Your Passion into Profit
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Discover trending business ideas and find live opportunities in your area.
          </p>
          <Button 
            size="lg"
            className="rounded-full px-16 text-base h-14 font-medium shadow-lg"
            onClick={() => scrollToSection('trending')}
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Trending Income Opportunities Section */}
      <section id="trending" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 text-foreground">
            Trending Income Opportunities
          </h2>

          {/* Get Personalized Hustle Ideas Card */}
          <Card className="max-w-5xl mx-auto mb-20 shadow-md">
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-3xl lg:text-4xl mb-4 flex items-center justify-center gap-3 font-bold">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                Get Personalized Hustle Ideas
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Have a hobby but not sure how to monetize it? Let our AI help you!
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-10 px-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
                <Input
                  placeholder="Enter your hobby (e.g., painting, coding, baking)"
                  value={hobby}
                  onChange={(e) => setHobby(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                  className="flex-1 h-14 text-base"
                />
                <Button 
                  onClick={handleGenerateIdeas}
                  disabled={isLoading}
                  size="lg"
                  className="px-10 h-14 whitespace-nowrap text-base font-medium"
                >
                  {isLoading ? "Generating..." : "Generate Ideas"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Ideas Display */}
          {generatedIdeas.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
              {generatedIdeas.map((idea, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      {idea.icon && <span>{idea.icon}</span>}
                      {idea.method}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {idea.description}
                    </p>
                    {idea.tools && (
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="text-xs">Tools</Badge>
                        <span className="text-sm text-muted-foreground">{idea.tools}</span>
                      </div>
                    )}
                    {idea.earnings && (
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="text-xs">Earnings</Badge>
                        <span className="text-sm font-semibold text-foreground">{idea.earnings}</span>
                      </div>
                    )}
                    {idea.source && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        onClick={() => window.open(idea.source, '_blank')}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Learn More
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Static Opportunity Cards - Only show if no generated ideas */}
          {generatedIdeas.length === 0 && (
            <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Home Baker/Specialty Chef</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Specialize in niche cuisines and sell through social media.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Handmade Crafts & Jewelry</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Sell unique, handmade items on e-commerce platforms.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Freelance Content Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Provide writing, design, and video editing services to businesses.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Personal Fitness Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Offer online classes or personalized fitness plans.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Graphic Designer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Design logos and marketing materials for startups.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">Pet Grooming and Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Offer pet sitting, grooming, and homemade pet treats.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Live Opportunities Section */}
      <section id="live-opportunities" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-center mb-20 text-foreground">
            Live Opportunities in Pune
          </h2>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar */}
            <aside className="lg:col-span-1">
              <FilterSidebar
                location={location}
                category={category}
                budget={budget}
                datePosted={datePosted}
                onLocationChange={setLocation}
                onCategoryChange={setCategory}
                onBudgetChange={setBudget}
                onDatePostedChange={setDatePosted}
                onReset={handleResetFilters}
              />
            </aside>

            {/* Opportunities List */}
            <div className="lg:col-span-3 space-y-8">
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold mb-2">{opportunity.title}</CardTitle>
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        {opportunity.description}
                      </CardDescription>
                      <div className="flex gap-2 mt-3 text-sm text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded">₹{opportunity.budget.toLocaleString()}</span>
                        <span className="bg-muted px-2 py-1 rounded capitalize">{opportunity.location.replace('-', ' ')}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="default" 
                        className="bg-teal-600 hover:bg-teal-700 text-white h-11 px-6"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Tips to Stand Out
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center">
                    <p className="text-lg text-muted-foreground">No opportunities match your filters. Try adjusting your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-24">
        <div className="container mx-auto px-6 text-center">
          <p className="text-base">
            © 2025 Hobby to Hustle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
