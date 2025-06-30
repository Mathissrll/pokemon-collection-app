export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  plan: "free" | "premium"
  isAdmin?: boolean
  collections: {
    main: string
    shared: string[]
  }
  profile: {
    avatar?: string
    bio?: string
    location?: string
    website?: string
  }
  settings: {
    notifications: boolean
    publicProfile: boolean
    language: "fr" | "en"
  }
  passwordHash?: string
  // Confirmation email
  isEmailConfirmed?: boolean
  emailConfirmationToken?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export class AuthService {
  private static readonly STORAGE_KEY = "pokemon-auth"
  private static readonly USERS_KEY = "pokemon-users"
  private static readonly PASSWORDS_KEY = "pokemon-passwords"
  private static readonly ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "zzetchh@gmail.com" // Email admin de Mathis

  // Simuler une base de données d'utilisateurs
  static getUsers(): Record<string, User> {
    if (typeof window === "undefined") return {}
    const data = localStorage.getItem(this.USERS_KEY)
    const users = data ? JSON.parse(data) : {}
    return users
  }

  static saveUsers(users: Record<string, User>): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  // Gestion des mots de passe (simulation d'un hash sécurisé)
  static getPasswords(): Record<string, string> {
    if (typeof window === "undefined") return {}
    const data = localStorage.getItem(this.PASSWORDS_KEY)
    return data ? JSON.parse(data) : {}
  }

  static savePasswords(passwords: Record<string, string>): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords))
  }

  // Hash simple du mot de passe (en production, utiliser bcrypt ou similaire)
  static hashPassword(password: string): string {
    // Simulation d'un hash - en production, utiliser une vraie fonction de hash
    return btoa(password + "pokemon-salt-2024")
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) return null

    const authData = JSON.parse(data)
    const users = this.getUsers()
    return users[authData.userId] || null
  }

  // Vérifier si l'utilisateur actuel est admin
  static isAdmin(): boolean {
    const currentUser = this.getCurrentUser()
    return currentUser?.isAdmin === true || currentUser?.email === this.ADMIN_EMAIL
  }

  // Validation d'email
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validation de mot de passe
  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push("Le mot de passe doit contenir au moins 6 caractères")
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une lettre")
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Validation de nom d'utilisateur
  static isValidUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (username.length < 3) {
      errors.push("Le nom d'utilisateur doit contenir au moins 3 caractères")
    }
    if (username.length > 20) {
      errors.push("Le nom d'utilisateur ne peut pas dépasser 20 caractères")
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push("Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!this.isValidEmail(email)) {
      return { success: false, error: "Format d'email invalide" }
    }

    const users = this.getUsers()
    const user = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { success: false, error: "Aucun compte trouvé avec cet email" }
    }

    // Vérification du mot de passe
    const passwords = this.getPasswords()
    let isValidPassword = false

    // Vérifier le hash du mot de passe
    const hashedPassword = passwords[user.id]
    if (hashedPassword) {
      isValidPassword = hashedPassword === this.hashPassword(password)
    }

    if (isValidPassword) {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          userId: user.id,
          loginTime: Date.now(),
          sessionId: crypto.randomUUID(),
        }),
      )
      return { success: true, user }
    }

    return { success: false, error: "Mot de passe incorrect" }
  }

  static async register(
    email: string,
    username: string,
    password: string,
    plan: "free" | "premium" = "free",
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Validations
    if (!this.isValidEmail(email)) {
      return { success: false, error: "Format d'email invalide" }
    }

    const usernameValidation = this.isValidUsername(username)
    if (!usernameValidation.valid) {
      return { success: false, error: usernameValidation.errors[0] }
    }

    const passwordValidation = this.isValidPassword(password)
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors[0] }
    }

    const users = this.getUsers()

    // Vérifier si l'email existe déjà
    if (Object.values(users).some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Un compte existe déjà avec cet email" }
    }

    // Vérifier si le nom d'utilisateur existe déjà
    if (Object.values(users).some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
    }

    // Créer le nouvel utilisateur
    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      username,
      createdAt: new Date().toISOString(),
      plan,
      isAdmin: email === this.ADMIN_EMAIL, // Seul l'email admin peut être admin
      collections: {
        main: crypto.randomUUID(),
        shared: [],
      },
      profile: {
        bio: "",
        location: "",
        website: "",
      },
      settings: {
        notifications: true,
        publicProfile: false,
        language: "fr",
      },
      // Confirmation email
      isEmailConfirmed: false,
      emailConfirmationToken: crypto.randomUUID(),
    }

    // Sauvegarder l'utilisateur
    users[newUser.id] = newUser
    this.saveUsers(users)

    // Sauvegarder le hash du mot de passe
    const passwords = this.getPasswords()
    passwords[newUser.id] = this.hashPassword(password)
    this.savePasswords(passwords)

    // Connecter automatiquement
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify({
        userId: newUser.id,
        loginTime: Date.now(),
        sessionId: crypto.randomUUID(),
      }),
    )

    return { success: true, user: newUser }
  }

  // Créer un compte premium (réservé aux admins)
  static async createPremiumAccount(
    email: string,
    username: string,
    password: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.isAdmin()) {
      return { success: false, error: "Accès non autorisé" }
    }

    return this.register(email, username, password, "premium")
  }

  // Mettre à jour le plan d'un utilisateur (réservé aux admins)
  static async updateUserPlan(userId: string, plan: "free" | "premium"): Promise<{ success: boolean; error?: string }> {
    if (!this.isAdmin()) {
      return { success: false, error: "Accès non autorisé" }
    }

    const users = this.getUsers()
    const user = users[userId]
    
    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" }
    }

    users[userId] = { ...user, plan }
    this.saveUsers(users)

    return { success: true }
  }

  static logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static async updateProfile(
    updates: Partial<Pick<User, "username" | "email" | "profile" | "settings">>,
  ): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return { success: false, error: "Non connecté" }

    // Validations
    if (updates.email && !this.isValidEmail(updates.email)) {
      return { success: false, error: "Format d'email invalide" }
    }

    if (updates.username) {
      const usernameValidation = this.isValidUsername(updates.username)
      if (!usernameValidation.valid) {
        return { success: false, error: usernameValidation.errors[0] }
      }

      // Vérifier si le nom d'utilisateur est déjà pris
      const users = this.getUsers()
      const existingUser = Object.values(users).find(
        (u) => u.username.toLowerCase() === updates.username!.toLowerCase() && u.id !== currentUser.id,
      )
      if (existingUser) {
        return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
      }
    }

    const users = this.getUsers()
    users[currentUser.id] = {
      ...currentUser,
      ...updates,
      profile: { ...currentUser.profile, ...updates.profile },
      settings: { ...currentUser.settings, ...updates.settings },
    }
    this.saveUsers(users)

    return { success: true }
  }

  static async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return { success: false, error: "Non connecté" }

    const users = this.getUsers()
    delete users[currentUser.id]
    this.saveUsers(users)

    // Supprimer aussi le mot de passe
    const passwords = this.getPasswords()
    delete passwords[currentUser.id]
    this.savePasswords(passwords)

    this.logout()

    return { success: true }
  }

  static generateShareCode(collectionId: string): string {
    return `PKM-${collectionId.slice(0, 8).toUpperCase()}`
  }

  static getCollectionFromShareCode(shareCode: string): string | null {
    if (!shareCode.startsWith("PKM-")) return null
    return shareCode.replace("PKM-", "").toLowerCase()
  }

  // Statistiques utilisateur
  static getUserStats(): {
    totalUsers: number
    newUsersThisMonth: number
    premiumUsers: number
  } {
    const users = Object.values(this.getUsers())
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    return {
      totalUsers: users.length,
      newUsersThisMonth: users.filter((u) => new Date(u.createdAt) >= thisMonth).length,
      premiumUsers: users.filter((u) => u.plan === "premium").length,
    }
  }

  // Utilitaire pour les routes API (Node)
  static getUserFromApiRequest(req: Request | { headers: { get: (name: string) => string | null } }) {
    try {
      const authHeader = req.headers.get("authorization")
      if (!authHeader) return null
      const userId = authHeader.replace("Bearer ", "")
      if (typeof window !== "undefined") return null // sécurité côté serveur uniquement
      const users = JSON.parse(localStorage.getItem("pokemon-users") || "{}")
      return users[userId] || null
    } catch {
      return null
    }
  }
}
