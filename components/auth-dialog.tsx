"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Lock, UserPlus, CheckCircle, AlertCircle } from "lucide-react"
import { AuthService } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"

interface AuthDialogProps {
  onAuthSuccess: () => void
  children: React.ReactNode
}

export function AuthDialog({ onAuthSuccess, children }: AuthDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ email: "", username: "", password: "", confirmPassword: "" })
  const [activeTab, setActiveTab] = useState("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await AuthService.login(loginData.email, loginData.password)
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user?.username} !`,
        })
        setOpen(false)
        onAuthSuccess()
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation côté client
    if (!registerData.email || !registerData.username || !registerData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    if (!AuthService.isValidEmail(registerData.email)) {
      toast({
        title: "Erreur",
        description: "Format d'email invalide.",
        variant: "destructive",
      })
      return
    }

    const usernameValidation = AuthService.isValidUsername(registerData.username)
    if (!usernameValidation.valid) {
      toast({
        title: "Erreur",
        description: usernameValidation.errors[0],
        variant: "destructive",
      })
      return
    }

    const passwordValidation = AuthService.isValidPassword(registerData.password)
    if (!passwordValidation.valid) {
      toast({
        title: "Erreur",
        description: passwordValidation.errors[0],
        variant: "destructive",
      })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await AuthService.register(registerData.email, registerData.username, registerData.password)
      if (result.success) {
        toast({
          title: "Inscription réussie ! 🎉",
          description: `Bienvenue ${result.user?.username} ! Votre compte a été créé avec succès.`,
        })
        setOpen(false)
        onAuthSuccess()
      } else {
        toast({
          title: "Erreur d'inscription",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Validation en temps réel pour l'inscription
  const getEmailValidation = () => {
    if (!registerData.email) return null
    return AuthService.isValidEmail(registerData.email) ? "valid" : "invalid"
  }

  const getUsernameValidation = () => {
    if (!registerData.username) return null
    const validation = AuthService.isValidUsername(registerData.username)
    return validation.valid ? "valid" : "invalid"
  }

  const getPasswordValidation = () => {
    if (!registerData.password) return null
    const validation = AuthService.isValidPassword(registerData.password)
    return validation.valid ? "valid" : "invalid"
  }

  const getConfirmPasswordValidation = () => {
    if (!registerData.confirmPassword) return null
    return registerData.password === registerData.confirmPassword ? "valid" : "invalid"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Connexion / Inscription
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                    className={`pl-10 pr-10 ${getEmailValidation() === "valid" ? "border-green-500" : getEmailValidation() === "invalid" ? "border-red-500" : ""}`}
                    required
                    disabled={isLoading}
                  />
                  {getEmailValidation() === "valid" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {getEmailValidation() === "invalid" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-username">Nom d'utilisateur</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-username"
                    placeholder="Votre pseudo"
                    value={registerData.username}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, username: e.target.value }))}
                    className={`pl-10 pr-10 ${getUsernameValidation() === "valid" ? "border-green-500" : getUsernameValidation() === "invalid" ? "border-red-500" : ""}`}
                    required
                    disabled={isLoading}
                  />
                  {getUsernameValidation() === "valid" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {getUsernameValidation() === "invalid" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">3-20 caractères, lettres et chiffres uniquement</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                    className={`pl-10 pr-10 ${getPasswordValidation() === "valid" ? "border-green-500" : getPasswordValidation() === "invalid" ? "border-red-500" : ""}`}
                    required
                    disabled={isLoading}
                  />
                  {getPasswordValidation() === "valid" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {getPasswordValidation() === "invalid" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">6+ caractères avec lettres et chiffres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`pl-10 pr-10 ${getConfirmPasswordValidation() === "valid" ? "border-green-500" : getConfirmPasswordValidation() === "invalid" ? "border-red-500" : ""}`}
                    required
                    disabled={isLoading}
                  />
                  {getConfirmPasswordValidation() === "valid" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {getConfirmPasswordValidation() === "invalid" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !getEmailValidation() || !getUsernameValidation() || !getPasswordValidation() || !getConfirmPasswordValidation()}
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>✅ Création de compte gratuite</p>
              <p>🔒 Vos données sont sécurisées</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
