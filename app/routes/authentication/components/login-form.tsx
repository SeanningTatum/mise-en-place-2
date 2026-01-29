import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router"
import { authClient } from "@/auth/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { AlertCircle, ArrowRight } from "lucide-react"

interface LoginFormProps extends React.ComponentProps<"div"> { }

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export function LoginForm({ className, ...props }: LoginFormProps) {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string>()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setAuthError(undefined)

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        setAuthError(result.error.message || "Invalid email or password")
        return
      }

      navigate("/recipes")
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to login")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-border/50 shadow-warm">
        {/* Decorative top accent */}
        <div className="h-1 bg-linear-to-r from-primary via-primary/50 to-accent" />
        
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access your recipe collection
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={form.formState.isSubmitting}
                        className="h-11 bg-card border-border/50 focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={form.formState.isSubmitting}
                        className="h-11 bg-card border-border/50 focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {authError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              
              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 gap-2 shadow-warm hover:shadow-warm-lg font-medium"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    "Signing in..."
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                
                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      New to mise en place?
                    </span>
                  </div>
                </div>
                
                <Link to="/sign-up" className="block">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-border/50 hover:bg-secondary/50"
                  >
                    Create an account
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
