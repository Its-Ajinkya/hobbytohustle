import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Star, ArrowLeft, Heart, LogIn, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Course {
  id?: number;
  title: string;
  hobby: string;
  provider: string;
  duration: string;
  rating: number;
  students: number;
  price: string;
  level: string;
  description: string;
  url?: string;
}

const Learn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [savedCourses, setSavedCourses] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<string, number>>(new Map());

  // Check authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSavedCourses(session.user.id);
        loadProgress(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadSavedCourses(session.user.id);
        loadProgress(session.user.id);
      } else {
        setSavedCourses(new Set());
        setCourseProgress(new Map());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load initial courses
  useEffect(() => {
    loadDefaultCourses();
  }, []);

  const loadDefaultCourses = () => {
    const defaultCourses: Course[] = [
      {
        id: 1,
        title: "Complete Photography Masterclass",
        hobby: "Photography",
        provider: "Skillshare",
        duration: "8 weeks",
        rating: 4.8,
        students: 12500,
        price: "₹3,999",
        level: "Beginner to Advanced",
        description: "Master photography from basics to advanced techniques including composition, lighting, and editing.",
        url: "https://www.skillshare.com/browse/photography"
      },
      {
        id: 2,
        title: "Web Development Bootcamp 2024",
        hobby: "Coding",
        provider: "Udemy",
        duration: "12 weeks",
        rating: 4.9,
        students: 45000,
        price: "₹6,499",
        level: "Beginner",
        description: "Learn HTML, CSS, JavaScript, React, and Node.js to become a full-stack developer.",
        url: "https://www.udemy.com/topic/web-development/"
      },
      {
        id: 3,
        title: "Digital Marketing Fundamentals",
        hobby: "Marketing",
        provider: "Coursera",
        duration: "6 weeks",
        rating: 4.7,
        students: 8900,
        price: "₹3,199",
        level: "Intermediate",
        description: "Understand SEO, social media marketing, content strategy, and analytics.",
        url: "https://www.coursera.org/courses?query=digital%20marketing"
      }
    ];
    setCourses(defaultCourses);
  };

  const loadSavedCourses = async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_courses')
      .select('course_title')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading saved courses:', error);
      return;
    }

    setSavedCourses(new Set(data?.map(c => c.course_title) || []));
  };

  const loadProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('course_title, progress_percentage')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    const progressMap = new Map();
    data?.forEach(p => progressMap.set(p.course_title, p.progress_percentage));
    setCourseProgress(progressMap);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDefaultCourses();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-course-recommendations', {
        body: { hobby: searchQuery }
      });

      if (error) throw error;

      if (data?.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        toast({
          title: "Recommendations Generated",
          description: `Found ${data.courses.length} personalized courses for ${searchQuery}`,
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Showing default courses.",
        variant: "destructive"
      });
      loadDefaultCourses();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveCourse = async (course: Course) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save courses",
        variant: "destructive"
      });
      return;
    }

    const isSaved = savedCourses.has(course.title);

    if (isSaved) {
      const { error } = await supabase
        .from('saved_courses')
        .delete()
        .eq('user_id', user.id)
        .eq('course_title', course.title);

      if (error) {
        toast({ title: "Error", description: "Failed to remove course", variant: "destructive" });
        return;
      }

      setSavedCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(course.title);
        return newSet;
      });

      toast({ title: "Course Removed", description: "Course removed from favorites" });
    } else {
      const { error } = await supabase
        .from('saved_courses')
        .insert({
          user_id: user.id,
          course_title: course.title,
          course_data: course as any
        });

      if (error) {
        toast({ title: "Error", description: "Failed to save course", variant: "destructive" });
        return;
      }

      setSavedCourses(prev => new Set(prev).add(course.title));
      toast({ title: "Course Saved", description: "Course added to favorites" });
    }
  };

  const startCourse = async (course: Course) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('learning_progress')
      .upsert({
        user_id: user.id,
        course_title: course.title,
        progress_percentage: 0,
        status: 'in_progress',
        started_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_title'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to start course", variant: "destructive" });
      return;
    }

    setCourseProgress(prev => new Map(prev).set(course.title, 0));
    toast({ title: "Course Started", description: "Your learning journey begins!" });
  };

  const filteredCourses = searchQuery && !isLoading
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.hobby.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed Out", description: "You have been signed out successfully" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Learning Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              {user ? `Welcome back, ${user.email?.split('@')[0]}!` : 'Upgrade Your Skills'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {user 
                ? 'Get AI-powered course recommendations tailored to your interests' 
                : 'Sign in to get personalized AI-powered course recommendations and track your progress'}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter a hobby to get AI-powered recommendations..."
                  className="pl-12 pr-4 py-6 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="py-6 px-8"
              >
                {isLoading ? 'Generating...' : 'Get Recommendations'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              {isLoading ? 'Generating AI Recommendations...' : searchQuery ? `AI Recommendations for "${searchQuery}"` : "Popular Courses"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Please wait...' : `${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'} available`}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-lg text-muted-foreground">AI is generating personalized recommendations...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No courses found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const isSaved = savedCourses.has(course.title);
                const progress = courseProgress.get(course.title) || 0;
                const hasProgress = progress > 0;

                return (
                  <Card key={course.id || index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{course.hobby}</Badge>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{course.rating}</span>
                          </div>
                          {user && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleSaveCourse(course)}
                            >
                              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription>{course.provider}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {course.description}
                      </p>
                      {hasProgress && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-semibold">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.students.toLocaleString()} students enrolled</span>
                        </div>
                        <div>
                          <Badge variant="outline">{course.level}</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{course.price}</span>
                      <div className="flex gap-2">
                        {user && !hasProgress && (
                          <Button variant="outline" onClick={() => startCourse(course)}>
                            Start Learning
                          </Button>
                        )}
                        <Button 
                          onClick={() => course.url && window.open(course.url, '_blank')}
                          disabled={!course.url}
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Learn;
