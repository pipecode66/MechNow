import { Header } from "@/components/header"
import { LoginForm } from "@/app/admin/login/login-form"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-md content-center px-4 py-10">
        <LoginForm />
      </main>
    </div>
  )
}
