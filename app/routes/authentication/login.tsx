import { LoginForm } from "./components/login-form"
import { ChefHat } from "lucide-react"

export default function Login() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6 md:p-10">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="flex w-full max-w-sm flex-col gap-8">
        {/* Logo and branding */}
        <a href="/" className="flex flex-col items-center gap-3 group">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <ChefHat className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
              mise en place
            </span>
            <p className="text-xs text-muted-foreground mt-0.5 italic">
              "Everything in its place"
            </p>
          </div>
        </a>
        
        <LoginForm />
        
        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60">
          Your personal digital cookbook
        </p>
      </div>
    </div>
  )
}