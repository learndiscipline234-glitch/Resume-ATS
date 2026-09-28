import { useState } from "react"
import { ExternalLink, BookOpen, GraduationCap, Star, Bookmark } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CourseResource {
  title: string
  provider: string
  url: string
  type: "free" | "paid"
  description: string
  rating?: number
  price?: string
}

interface SkillCourseData {
  skill: string
  description: string
  free: CourseResource
  paid: CourseResource
  persuasiveMessage: string
}

// Course database - modular and expandable with affordable pricing
const skillCoursesDb: Record<string, SkillCourseData> = {
  "React": {
    skill: "React",
    description: "Master the most popular frontend library",
    free: {
      title: "React Crash Course",
      provider: "freeCodeCamp",
      url: "https://www.freecodecamp.org/learn/front-end-development-libraries/#react",
      type: "free",
      description: "Free comprehensive React tutorial"
    },
    paid: {
      title: "React - The Complete Guide",
      provider: "Udemy",
      url: "https://www.udemy.com/course/react-the-complete-guide/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Complete React course with real-world projects",
      rating: 4.8,
      price: "₹449 (on sale)"
    },
    persuasiveMessage: "Free tutorials are great for a start, but affordable paid courses (just ₹449) give you structured learning, real-world projects, and certificates. Think of it as a small investment that can 10x your career opportunities."
  },
  "React Hooks": {
    skill: "React Hooks",
    description: "Master modern React with Hooks",
    free: {
      title: "React Hooks Crash Course",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=f687hBjwFcM",
      type: "free",
      description: "Free React Hooks tutorial"
    },
    paid: {
      title: "Complete React Hooks Course",
      provider: "Udemy",
      url: "https://www.udemy.com/course/react-hooks/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Deep dive into React Hooks with projects",
      rating: 4.7,
      price: "₹399-₹499"
    },
    persuasiveMessage: "Hooks are core to modern React. While free crash courses show basics, this affordable paid course gives deep dive projects and lifetime access for under ₹500."
  },
  "TypeScript": {
    skill: "TypeScript",
    description: "Add type safety to your JavaScript projects",
    free: {
      title: "TypeScript Handbook",
      provider: "TypeScript.org",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      type: "free",
      description: "Official TypeScript documentation"
    },
    paid: {
      title: "Understanding TypeScript",
      provider: "Udemy",
      url: "https://www.udemy.com/course/understanding-typescript/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Master TypeScript from basics to advanced",
      rating: 4.8,
      price: "₹449 (on sale)"
    },
    persuasiveMessage: "TypeScript is in high demand. Free docs are helpful, but this affordable course builds confidence with step-by-step projects, for less than a weekend pizza bill."
  },
  "Node.js": {
    skill: "Node.js",
    description: "Build scalable backend applications",
    free: {
      title: "Node.js Crash Course",
      provider: "YouTube",
      url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
      type: "free",
      description: "Free Node.js tutorial for beginners"
    },
    paid: {
      title: "Node.js, Express, MongoDB Bootcamp",
      provider: "Udemy",
      url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Complete backend development bootcamp",
      rating: 4.9,
      price: "₹449 (on sale)"
    },
    persuasiveMessage: "Node.js powers the backend of companies like Netflix. Free tutorials give basics, but this affordable bootcamp (₹449) takes you from zero to building full-stack apps with certificates."
  },
  "Express": {
    skill: "Express",
    description: "Learn the fastest Node.js web framework",
    free: {
      title: "Express.js Tutorial",
      provider: "Express.js.org",
      url: "https://expressjs.com/en/starter/installing.html",
      type: "free",
      description: "Official Express.js getting started guide"
    },
    paid: {
      title: "Node.js, Express, MongoDB Bootcamp",
      provider: "Udemy",
      url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Complete backend development with Express",
      rating: 4.9,
      price: "₹449 (on sale)"
    },
    persuasiveMessage: "Express is the backbone of modern web APIs. This affordable course (₹449) teaches production-ready patterns used by top tech companies."
  },
  "MongoDB": {
    skill: "MongoDB",
    description: "Master NoSQL database development",
    free: {
      title: "MongoDB University",
      provider: "MongoDB",
      url: "https://university.mongodb.com/courses/M001/about",
      type: "free",
      description: "Free MongoDB basics course"
    },
    paid: {
      title: "MongoDB Complete Developer Guide",
      provider: "Udemy",
      url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/?couponCode=AFFILIATE_ID",
      type: "paid",
      description: "Complete MongoDB course with real projects",
      rating: 4.6,
      price: "₹399-₹499"
    },
    persuasiveMessage: "MongoDB skills are highly valued. Free courses cover basics, but this affordable course (under ₹500) teaches advanced querying, indexing, and production deployment."
  }
}

// Generic fallback for skills not in database
const getGenericCourseData = (skill: string): SkillCourseData => ({
  skill,
  description: `Learn ${skill} effectively`,
  free: {
    title: `${skill} Documentation`,
    provider: "Official Docs",
    url: `https://www.google.com/search?q=${encodeURIComponent(skill)}+official+documentation`,
    type: "free",
    description: `Official ${skill} documentation and guides`
  },
  paid: {
    title: `Master ${skill} - Complete Course`,
    provider: "Udemy",
    url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}&couponCode=AFFILIATE_ID`,
    type: "paid",
    description: `Comprehensive ${skill} course with projects`,
    rating: 4.5,
    price: "₹449 (on sale)"
  },
  persuasiveMessage: `Free resources help you get started with ${skill}, but this affordable course (₹449) gives you structured learning, real projects, expert guidance, and certificates. A small investment for huge career returns.`
})

interface SkillCourseDrawerProps {
  skill: string
  children: React.ReactNode
}

export function SkillCourseDrawer({ skill, children }: SkillCourseDrawerProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { toast } = useToast()
  
  const courseData = skillCoursesDb[skill] || getGenericCourseData(skill)

  const trackClick = (type: "free" | "paid", skillName: string) => {
    // Analytics tracking
    console.log(`Course click: ${type} - ${skillName}`)
    
    // Here you would send to your analytics service
    // analytics.track('course_click', { skill: skillName, type })
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    toast({
      title: isBookmarked ? "Removed from roadmap" : "Added to roadmap",
      description: `${courseData.skill} course ${isBookmarked ? "removed from" : "added to"} your learning path.`,
    })
  }

  const handleCourseClick = (course: CourseResource) => {
    trackClick(course.type, courseData.skill)
    window.open(course.url, "_blank")
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader className="text-center">
          <DrawerTitle className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Learn {courseData.skill}</span>
          </DrawerTitle>
          <DrawerDescription>
            {courseData.description}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-4 space-y-4">
          {/* Free Resource */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Free – Quick Start
                  </Badge>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{courseData.free.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {courseData.free.description}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleCourseClick(courseData.free)}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Start Free Course
              </Button>
            </CardContent>
          </Card>

          {/* Paid Resource */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-primary" />
                  <Badge className="bg-primary text-primary-foreground">
                    Paid – Deep Dive 🚀
                  </Badge>
                </div>
                {courseData.paid.rating && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{courseData.paid.rating}</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold mb-1">{courseData.paid.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {courseData.paid.description}
              </p>
              {courseData.paid.price && (
                <p className="text-sm font-medium text-primary mb-3">
                  {courseData.paid.price}
                </p>
              )}
              <Button 
                className="w-full gradient-bg"
                onClick={() => handleCourseClick(courseData.paid)}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Deep Dive Course
              </Button>
            </CardContent>
          </Card>

          {/* Persuasive Message */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {courseData.persuasiveMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              className="flex-1"
            >
              <Bookmark className={`h-3 w-3 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}