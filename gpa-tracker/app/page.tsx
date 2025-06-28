import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth-form"
import { HomePage } from "@/components/home-page"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">GPA Tracker</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your academic performance across semesters</p>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return <HomePage user={user} />
}
