"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Calendar, Award, BookOpen, Menu, Settings, User as UserIcon, Trophy } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/user-nav"

interface SemesterRecord {
  id: string
  year: string
  semester: string
  gpa: number
  courses: any[]
  created_at: string
}

interface HomePageProps {
  user: User
}

export function HomePage({ user }: HomePageProps) {
  const [semesterRecords, setSemesterRecords] = useState<SemesterRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setUserProfile(profile)

      // Load semester records
      const { data: records, error } = await supabase
        .from("semester_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      setSemesterRecords(records || [])
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getChartData = () => {
    return semesterRecords.map((record, index) => ({
      name: `${record.year} ${record.semester}`,
      GPA: record.gpa,
      semester: index + 1,
    }))
  }

  const getCumulativeGPA = () => {
    if (semesterRecords.length === 0) return 0

    const totalPoints = semesterRecords.reduce((sum, record) => {
      const semesterCredits = record.courses.reduce(
        (credits: number, course: any) => credits + course.creditHours,
        0,
      )
      return sum + record.gpa * semesterCredits
    }, 0)

    const totalCredits = semesterRecords.reduce((sum, record) => {
      return sum + record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
    }, 0)

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  const getTotalCredits = () => {
    return semesterRecords.reduce((sum, record) => {
      return sum + record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
    }, 0)
  }

  const getAcademicStanding = (gpa: number) => {
    if (gpa >= 3.7) return "Excellent"
    if (gpa >= 3.0) return "Good"
    if (gpa >= 2.0) return "Fair"
    return "Needs Improvement"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayName = userProfile?.full_name || user.email?.split('@')[0] || 'Student'
  const cumulativeGPA = getCumulativeGPA()
  const totalCredits = getTotalCredits()
  const chartData = getChartData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">GPA Tracker</h1>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/standings">
                <Trophy className="h-4 w-4 mr-2" />
                Standings
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/profile">
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </nav>
          <UserNav user={user} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Here's your academic performance overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cumulativeGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {getAcademicStanding(cumulativeGPA)} standing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground">
                {semesterRecords.length} semesters completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest GPA</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {semesterRecords.length > 0 ? semesterRecords[semesterRecords.length - 1].gpa.toFixed(2) : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {semesterRecords.length > 0 
                  ? `${semesterRecords[semesterRecords.length - 1].year} ${semesterRecords[semesterRecords.length - 1].semester}`
                  : "No semesters yet"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>GPA Performance Over Time</CardTitle>
            <CardDescription>Your semester-by-semester GPA progression</CardDescription>
          </CardHeader>
          <CardContent>
            {semesterRecords.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      domain={[0, 4.5]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), "GPA"]}
                      labelFormatter={(label) => `Semester: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="GPA" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No GPA data yet</p>
                  <p className="text-sm">Start by adding your first semester GPA</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <TrendingUp className="h-5 w-5" />
              Calculate New GPA
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/dashboard/standings">
              <Award className="h-5 w-5" />
              View Standings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 