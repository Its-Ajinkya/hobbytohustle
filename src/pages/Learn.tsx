import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Learn = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample learning opportunities data
  const courses = [
    {
      id: 1,
      title: "Complete Photography Masterclass",
      hobby: "Photography",
      provider: "Skillshare",
      duration: "8 weeks",
      rating: 4.8,
      students: 12500,
      price: "$49",
      level: "Beginner to Advanced",
      description: "Master photography from basics to advanced techniques including composition, lighting, and editing."
    },
    {
      id: 2,
      title: "Web Development Bootcamp 2024",
      hobby: "Coding",
      provider: "Udemy",
      duration: "12 weeks",
      rating: 4.9,
      students: 45000,
      price: "$79",
      level: "Beginner",
      description: "Learn HTML, CSS, JavaScript, React, and Node.js to become a full-stack developer."
    },
    {
      id: 3,
      title: "Digital Marketing Fundamentals",
      hobby: "Marketing",
      provider: "Coursera",
      duration: "6 weeks",
      rating: 4.7,
      students: 8900,
      price: "$39",
      level: "Intermediate",
      description: "Understand SEO, social media marketing, content strategy, and analytics."
    },
    {
      id: 4,
      title: "Graphic Design for Beginners",
      hobby: "Design",
      provider: "LinkedIn Learning",
      duration: "4 weeks",
      rating: 4.6,
      students: 15600,
      price: "$29",
      level: "Beginner",
      description: "Learn Adobe Photoshop, Illustrator, and design principles to create stunning visuals."
    },
    {
      id: 5,
      title: "Content Writing & Copywriting",
      hobby: "Writing",
      provider: "Skillshare",
      duration: "5 weeks",
      rating: 4.8,
      students: 9200,
      price: "$35",
      level: "All Levels",
      description: "Master the art of persuasive writing, blog posts, and engaging copy for businesses."
    },
    {
      id: 6,
      title: "Video Editing Pro Course",
      hobby: "Video Editing",
      provider: "Udemy",
      duration: "10 weeks",
      rating: 4.9,
      students: 23400,
      price: "$59",
      level: "Beginner to Advanced",
      description: "Learn Adobe Premiere Pro, After Effects, and create professional-quality videos."
    }
  ];

  const filteredCourses = searchQuery
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.hobby.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

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
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Upgrade Your Skills
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Find courses and classes to master your hobby or start a new side hustle
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for courses, hobbies, or skills..."
                className="pl-12 pr-4 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : "Popular Courses"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
            </p>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No courses found. Try a different search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">{course.hobby}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription>{course.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {course.description}
                    </p>
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
                    <Button>Enroll Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Learn;
