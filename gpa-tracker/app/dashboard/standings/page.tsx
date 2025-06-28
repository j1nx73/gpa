"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trophy, TrendingUp, Award, Calendar } from "lucide-react"

interface SemesterRecord {
  id: string
  year: string
  semester: string
  gpa: number
  courses: any[]
  created_at: string
}

interface UserRanking {
  rank: number
  total_users: number
  cumulative_gpa: number
}

export default function StandingsPage() {
  const [semesterRecords, setSemesterRecords] = useState<SemesterRecord[]>([])
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadStandings()
  }, [])

  const loadStandings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load semester records
      const { data: records, error: recordsError } = await supabase
        .from("semester_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (recordsError) throw recordsError

      setSemesterRecords(records || [])

      // Calculate cumulative GPA and ranking
      if (records && records.length > 0) {
        const totalPoints = records.reduce((sum, record) => {
          const semesterCredits = record.courses.reduce(
            (credits: number, course: any) => credits + course.creditHours,
            0,
          )
          return sum + record.gpa * semesterCredits
        }, 0)

        const totalCredits = records.reduce((sum, record) => {
          return sum + record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
        }, 0)

        const cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0

        // Get user ranking (simplified - in real app, this would be a more complex query)
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

          setUserRanking({
            rank: userRank,
            total_users: sortedUsers.length,
            cumulative_gpa: cumulativeGPA,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error loading standings",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateCumulativeGPA = (upToIndex: number) => {
    const relevantRecords = semesterRecords.slice(0, upToIndex + 1)
    const totalPoints = relevantRecords.reduce((sum, record) => {
      const semesterCredits = record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
      return sum + record.gpa * semesterCredits
    }, 0)

    const totalCredits = relevantRecords.reduce((sum, record) => {
      return sum + record.courses.reduce((credits: number, course: any) => credits + course.creditHours, 0)
    }, 0)

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Standings</h1>
        <p className="text-muted-foreground">View your GPA history and academic performance ranking</p>
      </div>

      {userRanking && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{userRanking.rank}</div>
              <p className="text-xs text-muted-foreground">out of {userRanking.total_users} students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userRanking.cumulative_gpa.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Overall academic performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Semesters Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{semesterRecords.length}</div>
              <p className="text-xs text-muted-foreground">Academic semesters</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            GPA History
          </CardTitle>
          <CardDescription>Your semester-by-semester academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          {semesterRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No GPA records found. Start by calculating your first semester GPA in the Dashboard.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead>Semester GPA</TableHead>
                  <TableHead>Cumulative GPA</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semesterRecords.map((record, index) => {
                  const cumulativeGPA = calculateCumulativeGPA(index)
                  const getPerformanceBadge = (gpa: number) => {
                    if (gpa >= 3.7) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    if (gpa >= 3.0) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                    if (gpa >= 2.0) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
                    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                  }

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.year} {record.semester}
                      </TableCell>
                      <TableCell>{record.gpa.toFixed(2)}</TableCell>
                      <TableCell>{cumulativeGPA.toFixed(2)}</TableCell>
                      <TableCell>{record.courses.length} courses</TableCell>
                      <TableCell>{getPerformanceBadge(record.gpa)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
