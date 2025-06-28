"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Calculator, Trophy, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  name: string
  grade: string
  creditHours: number
}

const gradePoints: Record<string, number> = {
  "A+": 4.50,
  A: 4.00,
  "B+": 3.50,
  B: 3.00,
  "C+": 2.50,
  C: 2.00,
  "D+": 1.50,
  D: 1.00,
  F: 0.00,
}

const presetCourses: Record<string, Record<string, { name: string; creditHours: number }[]>> = {
  "Freshman": {
    "Fall": [
      { name: "Academic English 1", creditHours: 2 },
      { name: "Academic English Reading", creditHours: 2 },
      { name: "Calculus 1", creditHours: 3 },
      { name: "Introduction to IT", creditHours: 3 },
      { name: "Physics 1", creditHours: 3 },
      { name: "Physics Experiments 1", creditHours: 1 },
      { name: "Object Oriented Programming 1", creditHours: 3 },
    ],
    "Spring": [
      { name: "Academic English 2", creditHours: 2 },
      { name: "Academic English Writing", creditHours: 2 },
      { name: "Calculus 2", creditHours: 3 },
      { name: "Creative Engineering Design", creditHours: 3 },
      { name: "Physics 2", creditHours: 3 },
      { name: "Physics Experiments 2", creditHours: 1 },
      { name: "Object Oriented Programming 2", creditHours: 3 },
    ],
  },
  "Sophomore": {
    "Fall": [
      { name: "Academic English 3", creditHours: 2 },
      { name: "Basic Korean 1", creditHours: 2 },
      { name: "Linear Algebra", creditHours: 3 },
      { name: "Engineering Maths", creditHours: 3 },
      { name: "Application Programming in Java", creditHours: 3 },
      { name: "Data Structure", creditHours: 3 },
      { name: "Circuit and Lab", creditHours: 3 },
    ],
    "Spring": [
      { name: "Academic English 4", creditHours: 2 },
      { name: "Basic Korean 2", creditHours: 2 },
      { name: "Discrete Mathematics", creditHours: 3 },
      { name: "Digital Logic & Circuit", creditHours: 3 },
      { name: "System Programming", creditHours: 3 },
      { name: "Computer Architecture", creditHours: 3 },
      { name: "History 1", creditHours: 1 },
    ],
  },
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [calculatedGPA, setCalculatedGPA] = useState<number | null>(null)
  const [userRank, setUserRank] = useState<{ rank: number; totalUsers: number; cumulativeGPA: number } | null>(null)
  const [isEditingRank, setIsEditingRank] = useState(false)
  const [manualRank, setManualRank] = useState("")
  const [manualTotalUsers, setManualTotalUsers] = useState("")
  const [savedSemesters, setSavedSemesters] = useState<any[]>([])
  const [selectedSavedSemester, setSelectedSavedSemester] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const addCourse = () => {
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      grade: "",
      creditHours: 3,
    }
    setCourses([...courses, newCourse])
  }

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id))
  }

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map((course) => (course.id === id ? { ...course, [field]: value } : course)))
  }

  const loadPresetCourses = () => {
    if (selectedYear && selectedSemester && presetCourses[selectedYear]?.[selectedSemester]) {
      const presetCourseList = presetCourses[selectedYear][selectedSemester]
      const newCourses = presetCourseList.map((presetCourse) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: presetCourse.name,
        grade: "",
        creditHours: presetCourse.creditHours,
      }))
      setCourses(newCourses)
      setCalculatedGPA(null) // Reset calculated GPA when courses change
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setSelectedSemester("")
    setCourses([])
    setCalculatedGPA(null)
  }

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester)
    // Load preset courses when semester is selected
    setTimeout(() => {
      if (selectedYear && semester && presetCourses[selectedYear]?.[semester]) {
        loadPresetCourses()
      }
    }, 100)
  }

  const calculateGPA = () => {
    if (courses.length === 0) {
      toast({
        title: "No courses added",
        description: "Please add at least one course to calculate GPA.",
        variant: "destructive",
      })
      return
    }

    const validCourses = courses.filter((course) => course.name.trim() && course.grade && course.creditHours > 0)

    if (validCourses.length === 0) {
      toast({
        title: "Invalid course data",
        description: "Please ensure all courses have valid names, grades, and credit hours.",
        variant: "destructive",
      })
      return
    }

    const totalPoints = validCourses.reduce((sum, course) => sum + gradePoints[course.grade] * course.creditHours, 0)
    const totalCredits = validCourses.reduce((sum, course) => sum + course.creditHours, 0)
    const gpa = totalPoints / totalCredits

    setCalculatedGPA(gpa)
  }

  const loadUserRank = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load all semester records for the user
      const { data: userRecords, error: userError } = await supabase
        .from("semester_records")
        .select("*")
        .eq("user_id", user.id)

      if (userError) throw userError

      if (userRecords && userRecords.length > 0) {
        // Calculate cumulative GPA
        const totalPoints = userRecords.reduce((sum, record) => {
          const semesterCredits = record.courses.reduce(
            (credits: number, course: any) => credits + course.creditHours,
            0,
          )
          return sum + record.gpa * semesterCredits
        }, 0)

        const totalCredits = userRecords.reduce((sum, record) => {
          return sum + record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
        }, 0)

        const cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0

        // Get all users' data for ranking
        const { data: allUsers, error: rankingError } = await supabase
          .from("semester_records")
          .select("user_id, gpa, courses")

        if (!rankingError && allUsers) {
          // Calculate cumulative GPAs for all users
          const userGPAs = new Map<string, { totalPoints: number; totalCredits: number }>()

          allUsers.forEach((record) => {
            const userId = record.user_id
            const semesterCredits = record.courses.reduce(
              (credits: number, course: any) => credits + course.creditHours,
              0,
            )
            const semesterPoints = record.gpa * semesterCredits

            if (!userGPAs.has(userId)) {
              userGPAs.set(userId, { totalPoints: 0, totalCredits: 0 })
            }

            const userData = userGPAs.get(userId)!
            userData.totalPoints += semesterPoints
            userData.totalCredits += semesterCredits
          })

          const sortedUsers = Array.from(userGPAs.entries())
            .map(([userId, data]) => ({
              userId,
              cumulativeGPA: data.totalCredits > 0 ? data.totalPoints / data.totalCredits : 0,
            }))
            .sort((a, b) => b.cumulativeGPA - a.cumulativeGPA)

          const userRank = sortedUsers.findIndex((u) => u.userId === user.id) + 1

          setUserRank({
            rank: userRank,
            totalUsers: sortedUsers.length,
            cumulativeGPA: cumulativeGPA,
          })
        }
      }
    } catch (error) {
      console.error("Error loading user rank:", error)
    }
  }

  const loadSavedSemesters = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: semesters, error } = await supabase
        .from("semester_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setSavedSemesters(semesters || [])
    } catch (error) {
      console.error("Error loading saved semesters:", error)
    }
  }

  const viewSavedSemester = (semester: any) => {
    setSelectedSavedSemester(semester)
    // Convert saved courses to the format expected by the UI
    const savedCourses = semester.courses.map((course: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: course.name,
      grade: course.grade,
      creditHours: course.creditHours,
    }))
    setCourses(savedCourses)
    setCalculatedGPA(semester.gpa)
    setSelectedYear(semester.year)
    setSelectedSemester(semester.semester)
  }

  const saveGPA = async () => {
    if (!selectedYear || !selectedSemester || calculatedGPA === null) {
      toast({
        title: "Missing information",
        description: "Please select year, semester, and calculate GPA first.",
        variant: "destructive",
      })
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("semester_records").upsert({
        user_id: user.id,
        year: selectedYear,
        semester: selectedSemester,
        gpa: calculatedGPA,
        courses: courses.filter((c) => c.name.trim() && c.grade && c.creditHours > 0),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "GPA saved successfully",
        description: `${selectedYear} ${selectedSemester} GPA: ${calculatedGPA.toFixed(2)}`,
      })

      // Reload user rank and saved semesters after saving
      await loadUserRank()
      await loadSavedSemesters()
    } catch (error) {
      toast({
        title: "Error saving GPA",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const saveManualRank = () => {
    const rank = parseInt(manualRank)
    const totalUsers = parseInt(manualTotalUsers)
    
    if (!rank || !totalUsers || rank < 1 || totalUsers < 1 || rank > totalUsers) {
      toast({
        title: "Invalid rank data",
        description: "Please enter valid rank and total users numbers.",
        variant: "destructive",
      })
      return
    }

    setUserRank({
      rank: rank,
      totalUsers: totalUsers,
      cumulativeGPA: userRank?.cumulativeGPA || 0,
    })
    
    setIsEditingRank(false)
    setManualRank("")
    setManualTotalUsers("")
    
    toast({
      title: "Rank updated successfully",
      description: `Your rank has been set to #${rank} out of ${totalUsers} students.`,
    })
  }

  // Load user rank on component mount
  useEffect(() => {
    loadUserRank()
    loadSavedSemesters()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Calculate and track your semester GPA</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Semester Selection</CardTitle>
            <CardDescription>Choose the year and semester for GPA calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={handleSemesterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GPA Result</CardTitle>
            <CardDescription>Your calculated semester GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {calculatedGPA !== null ? calculatedGPA.toFixed(2) : "--"}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedYear && selectedSemester
                  ? `${selectedYear} ${selectedSemester}`
                  : "Select semester to calculate"}
              </p>
              <div className="space-x-2">
                <Button onClick={calculateGPA} className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculate GPA
                </Button>
                {calculatedGPA !== null && (
                  <Button onClick={saveGPA} variant="outline">
                    Save GPA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {userRank && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingRank(!isEditingRank)}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingRank ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="manual-rank" className="text-xs">Rank</Label>
                      <Input
                        id="manual-rank"
                        type="number"
                        min="1"
                        placeholder={userRank.rank.toString()}
                        value={manualRank}
                        onChange={(e) => setManualRank(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-total" className="text-xs">Total Students</Label>
                      <Input
                        id="manual-total"
                        type="number"
                        min="1"
                        placeholder={userRank.totalUsers.toString()}
                        value={manualTotalUsers}
                        onChange={(e) => setManualTotalUsers(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveManualRank} size="sm" className="flex-1">
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditingRank(false)
                        setManualRank("")
                        setManualTotalUsers("")
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">#{userRank.rank}</div>
                  <p className="text-xs text-muted-foreground">out of {userRank.totalUsers} students</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userRank.cumulativeGPA.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Overall academic performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Standing</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userRank.cumulativeGPA >= 3.7 ? "Excellent" : 
                 userRank.cumulativeGPA >= 3.0 ? "Good" : 
                 userRank.cumulativeGPA >= 2.0 ? "Fair" : "Needs Improvement"}
              </div>
              <p className="text-xs text-muted-foreground">Performance level</p>
            </CardContent>
          </Card>
        </div>
      )}

      {savedSemesters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Semesters</CardTitle>
            <CardDescription>Click on a semester to view your grades and GPA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {savedSemesters.map((semester) => (
                <div
                  key={semester.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSavedSemester?.id === semester.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => viewSavedSemester(semester)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">
                      {semester.year} {semester.semester}
                    </h3>
                    <div className="text-lg font-bold text-primary">
                      {semester.gpa.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {semester.courses.length} courses • {semester.courses.reduce((sum: number, course: any) => sum + course.creditHours, 0)} credits
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {semester.courses.slice(0, 3).map((course: any, index: number) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.grade === "A+" || course.grade === "A"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : course.grade === "B+" || course.grade === "B"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : course.grade === "C+" || course.grade === "C"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {course.grade}
                      </span>
                    ))}
                    {semester.courses.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        +{semester.courses.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Course Information
          </CardTitle>
          <CardDescription>
            {selectedYear && selectedSemester && presetCourses[selectedYear]?.[selectedSemester] 
              ? `Preset courses for ${selectedYear} ${selectedSemester}. Select your grades to calculate GPA automatically.`
              : "Select a year and semester to view preset courses"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedYear && selectedSemester && presetCourses[selectedYear]?.[selectedSemester] ? (
              <>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📚 Preset courses for {selectedYear} {selectedSemester}. Select your grades to calculate GPA automatically.
                  </p>
                </div>
                {courses.map((course) => {
                  const isPresetCourse = selectedYear && selectedSemester && presetCourses[selectedYear]?.[selectedSemester];
                  return (
                    <div key={course.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {course.creditHours}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`course-${course.id}`} className="text-sm font-medium">
                          {course.name}
                        </Label>
                      </div>
                      <div className="flex gap-1">
                        {Object.keys(gradePoints).map((grade) => (
                          <Button
                            key={grade}
                            variant={course.grade === grade ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateCourse(course.id, "grade", grade)}
                            className="w-8 h-8 p-0 text-xs"
                          >
                            {grade}
                          </Button>
                        ))}
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="outline" size="icon" onClick={() => removeCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a year and semester to view preset courses
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
