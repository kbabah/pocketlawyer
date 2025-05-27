"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, User, AlertTriangle, Check, Chrome } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type SignInForm = z.infer<typeof signInSchema>
type SignUpForm = z.infer<typeof signUpSchema>
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

// Password strength checker
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const { t } = useLanguage()
  
  const checks = [
    { label: t('At least 8 characters'), test: password.length >= 8 },
    { label: t('Contains uppercase letter'), test: /[A-Z]/.test(password) },
    { label: t('Contains lowercase letter'), test: /[a-z]/.test(password) },
    { label: t('Contains number'), test: /\d/.test(password) },
  ]
  
  const strength = checks.filter(check => check.test).length
  const strengthPercentage = (strength / checks.length) * 100
  
  const strengthColors = {
    0: 'bg-gray-200',
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
  }
  
  if (!password) return null
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress 
            value={strengthPercentage} 
            className={cn("h-2", strengthColors[strength as keyof typeof strengthColors])}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {strength === 4 ? t('Strong') : strength >= 2 ? t('Medium') : t('Weak')}
        </span>
      </div>
      
      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <Check 
              className={cn(
                "h-3 w-3",
                check.test ? "text-green-500" : "text-gray-300"
              )} 
            />
            <span className={cn(
              check.test ? "text-green-700 dark:text-green-400" : "text-gray-500"
            )}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Enhanced input component with validation
const FormInput = React.forwardRef<
  HTMLInputElement,
  {
    label: string
    type?: string
    error?: string
    icon?: React.ReactNode
    showPasswordToggle?: boolean
    onPasswordToggle?: () => void
    isPasswordVisible?: boolean
    className?: string
    autoComplete?: string
  } & React.InputHTMLAttributes<HTMLInputElement>
>(({ 
  label, 
  type = "text", 
  error, 
  icon, 
  showPasswordToggle,
  onPasswordToggle,
  isPasswordVisible,
  className,
  autoComplete,
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          type={showPasswordToggle ? (isPasswordVisible ? "text" : "password") : type}
          className={cn(
            "transition-all duration-200",
            icon && "pl-10",
            showPasswordToggle && "pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          autoComplete={autoComplete}
          {...props}
        />
        {showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-0 hover:bg-transparent"
            onClick={onPasswordToggle}
          >
            {isPasswordVisible ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
})

FormInput.displayName = "FormInput"

interface AuthFormProps {
  mode?: 'signin' | 'signup' | 'forgot-password'
  onModeChange?: (mode: 'signin' | 'signup' | 'forgot-password') => void
  redirectUrl?: string
}

export function AuthForm({ 
  mode = 'signin', 
  onModeChange,
  redirectUrl = '/'
}: AuthFormProps) {
  const { t } = useLanguage()
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  
  // Form instances
  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })
  
  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })
  
  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })
  
  // Watch password for strength indicator
  const watchedPassword = signUpForm.watch('password')
  
  // Handle sign in
  const handleSignIn = async (data: SignInForm) => {
    setIsSubmitting(true)
    try {
      await signIn(data.email, data.password)
      toast.success(t('Successfully signed in!'))
    } catch (error: any) {
      toast.error(error.message || t('Failed to sign in'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle sign up
  const handleSignUp = async (data: SignUpForm) => {
    setIsSubmitting(true)
    try {
      await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
      })
      toast.success(t('Account created successfully!'))
    } catch (error: any) {
      toast.error(error.message || t('Failed to create account'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle forgot password
  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true)
    try {
      await resetPassword(data.email)
      setResetEmailSent(true)
      toast.success(t('Password reset email sent!'))
    } catch (error: any) {
      toast.error(error.message || t('Failed to send reset email'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    try {
      await signInWithGoogle()
      toast.success(t('Successfully signed in with Google!'))
    } catch (error: any) {
      toast.error(error.message || t('Failed to sign in with Google'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={mode} onValueChange={(value) => onModeChange?.(value as typeof mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">{t('Sign In')}</TabsTrigger>
          <TabsTrigger value="signup">{t('Sign Up')}</TabsTrigger>
        </TabsList>
        
        {/* Sign In Form */}
        <TabsContent value="signin" className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t('Welcome back')}</CardTitle>
              <CardDescription className="text-center">
                {t('Enter your credentials to access your account')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <FormInput
                  {...signInForm.register('email')}
                  label={t('Email')}
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  error={signInForm.formState.errors.email?.message}
                  autoComplete="email"
                  placeholder={t('Enter your email')}
                />
                
                <FormInput
                  {...signInForm.register('password')}
                  label={t('Password')}
                  icon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  isPasswordVisible={showPassword}
                  onPasswordToggle={() => setShowPassword(!showPassword)}
                  error={signInForm.formState.errors.password?.message}
                  autoComplete="current-password"
                  placeholder={t('Enter your password')}
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      {...signInForm.register('rememberMe')}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">
                      {t('Remember me')}
                    </Label>
                  </div>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-normal"
                    onClick={() => onModeChange?.('forgot-password')}
                  >
                    {t('Forgot password?')}
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('Signing in...') : t('Sign In')}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('Or continue with')}
                  </span>
                </div>
              </div>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                <Chrome className="mr-2 h-4 w-4" />
                {t('Continue with Google')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sign Up Form */}
        <TabsContent value="signup" className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t('Create account')}</CardTitle>
              <CardDescription className="text-center">
                {t('Enter your information to create your account')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    {...signUpForm.register('firstName')}
                    label={t('First name')}
                    icon={<User className="h-4 w-4" />}
                    error={signUpForm.formState.errors.firstName?.message}
                    autoComplete="given-name"
                    placeholder={t('First name')}
                  />
                  
                  <FormInput
                    {...signUpForm.register('lastName')}
                    label={t('Last name')}
                    icon={<User className="h-4 w-4" />}
                    error={signUpForm.formState.errors.lastName?.message}
                    autoComplete="family-name"
                    placeholder={t('Last name')}
                  />
                </div>
                
                <FormInput
                  {...signUpForm.register('email')}
                  label={t('Email')}
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  error={signUpForm.formState.errors.email?.message}
                  autoComplete="email"
                  placeholder={t('Enter your email')}
                />
                
                <div className="space-y-3">
                  <FormInput
                    {...signUpForm.register('password')}
                    label={t('Password')}
                    icon={<Lock className="h-4 w-4" />}
                    showPasswordToggle
                    isPasswordVisible={showPassword}
                    onPasswordToggle={() => setShowPassword(!showPassword)}
                    error={signUpForm.formState.errors.password?.message}
                    autoComplete="new-password"
                    placeholder={t('Create a password')}
                  />
                  
                  <PasswordStrengthIndicator password={watchedPassword || ''} />
                </div>
                
                <FormInput
                  {...signUpForm.register('confirmPassword')}
                  label={t('Confirm password')}
                  icon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  isPasswordVisible={showConfirmPassword}
                  onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={signUpForm.formState.errors.confirmPassword?.message}
                  autoComplete="new-password"
                  placeholder={t('Confirm your password')}
                />
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    {...signUpForm.register('acceptTerms')}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    {t('I agree to the')}{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      {t('Terms of Service')}
                    </Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      {t('Privacy Policy')}
                    </Link>
                  </Label>
                </div>
                {signUpForm.formState.errors.acceptTerms && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    {signUpForm.formState.errors.acceptTerms.message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('Creating account...') : t('Create Account')}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('Or continue with')}
                  </span>
                </div>
              </div>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                <Chrome className="mr-2 h-4 w-4" />
                {t('Continue with Google')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Forgot Password Form */}
        <TabsContent value="forgot-password" className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{t('Reset password')}</CardTitle>
              <CardDescription className="text-center">
                {t('Enter your email to receive a password reset link')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetEmailSent ? (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    {t('Password reset email sent! Check your inbox and follow the instructions.')}
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                  <FormInput
                    {...forgotPasswordForm.register('email')}
                    label={t('Email')}
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    error={forgotPasswordForm.formState.errors.email?.message}
                    autoComplete="email"
                    placeholder={t('Enter your email')}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('Sending...') : t('Send Reset Link')}
                  </Button>
                </form>
              )}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onModeChange?.('signin')}
              >
                {t('Back to Sign In')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AuthForm
