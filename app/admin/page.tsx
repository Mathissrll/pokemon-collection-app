"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  User as UserIcon, 
  Crown, 
  Shield, 
  Trash2, 
  Edit3, 
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  Plus,
  UserPlus
} from "lucide-react"
import { AuthService, type User } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlan, setFilterPlan] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<User>>({})
  const [hasAccess, setHasAccess] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    email: "",
    username: "",
    password: "",
    plan: "free" as "free" | "premium"
  })

  useEffect(() => {
    const checkAccess = () => {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        router.push("/auth")
        return
      }
      
      // Seul l'administrateur principal peut accéder
      if (!AuthService.isAdmin()) {
        toast({
          title: "Accès refusé",
          description: "Seul l'administrateur principal peut accéder à cette page.",
          variant: "destructive",
        })
        router.push("/")
        return
      }
      
      setHasAccess(true)
    }
    
    checkAccess()
  }, [router, toast])

  useEffect(() => {
    if (hasAccess) {
      loadUsers()
    }
  }, [hasAccess])

  useEffect(() => {
    if (hasAccess) {
      filterAndSortUsers()
    }
  }, [users, searchTerm, filterPlan, sortBy, hasAccess])

  const loadUsers = () => {
    const allUsers = Object.values(AuthService.getUsers())
    setUsers(allUsers)
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrage par plan
    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => user.plan === filterPlan)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "username":
          return a.username.localeCompare(b.username)
        case "email":
          return a.email.localeCompare(b.email)
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "plan":
          return a.plan.localeCompare(b.plan)
        default:
          return 0
      }
    })

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditData({
      username: user.username,
      email: user.email,
      plan: user.plan,
      profile: { ...user.profile },
      settings: { ...user.settings },
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      const result = await AuthService.updateProfile(editData)
      if (result.success) {
        toast({
          title: "Utilisateur mis à jour",
          description: "Les informations ont été sauvegardées avec succès.",
        })
        loadUsers()
        setIsEditing(false)
        setSelectedUser(null)
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return
    }

    try {
      // Simuler la suppression (en production, on aurait une vraie API)
      const allUsers = AuthService.getUsers()
      delete allUsers[userId]
      AuthService.saveUsers(allUsers)
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      })
    }
  }

  const handleCreateAccount = async () => {
    try {
      let result
      if (createFormData.plan === "premium") {
        result = await AuthService.createPremiumAccount(
          createFormData.email,
          createFormData.username,
          createFormData.password
        )
      } else {
        result = await AuthService.register(
          createFormData.email,
          createFormData.username,
          createFormData.password,
          createFormData.plan
        )
      }

      if (result.success) {
        toast({
          title: "Compte créé",
          description: `Le compte ${createFormData.plan} a été créé avec succès.`,
        })
        setShowCreateForm(false)
        setCreateFormData({ email: "", username: "", password: "", plan: "free" })
        loadUsers()
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du compte.",
        variant: "destructive",
      })
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "premium":
        return <Badge className="bg-yellow-500 text-white"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
      case "free":
        return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Gratuit</Badge>
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  const getStatusBadge = (user: User) => {
    const now = new Date()
    const createdAt = new Date(user.createdAt)
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCreation <= 7) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Nouveau</Badge>
    } else if (daysSinceCreation <= 30) {
      return <Badge className="bg-blue-500 text-white"><Eye className="h-3 w-3 mr-1" />Actif</Badge>
    } else {
      return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Ancien</Badge>
    }
  }

  const getAdminBadge = (user: User) => {
    if (user.isAdmin || user.email === "zzetchh@gmail.com") {
      return <Badge className="bg-red-500 text-white"><Crown className="h-3 w-3 mr-1" />Admin</Badge>
    }
    return null
  }

  const stats = {
    total: users.length,
    premium: users.filter(u => u.plan === "premium").length,
    free: users.filter(u => u.plan === "free").length,
    newThisMonth: users.filter(u => {
      const createdAt = new Date(u.createdAt)
      const now = new Date()
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length,
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4">
        <Header title="Administration" />
        <div className="py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
              <p className="text-muted-foreground">
                Seul l'administrateur principal peut accéder à cette page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <Header title="Administration" />

      <div className="py-6 space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premium}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Gratuit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.free}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ce mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Gestion des utilisateurs
              <Button onClick={() => setShowCreateForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Créer un compte
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date d'inscription</SelectItem>
                    <SelectItem value="username">Nom d'utilisateur</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="plan">Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.username}</span>
                      </div>
                      {getPlanBadge(user.plan)}
                      {getAdminBadge(user)}
                      {getStatusBadge(user)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      {user.profile.location && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          {user.profile.location}
                        </div>
                      )}
                    </div>

                    {user.profile.bio && (
                      <p className="text-sm text-muted-foreground mt-2">{user.profile.bio}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {users.length === 0 ? "Aucun utilisateur" : "Aucun utilisateur trouvé"}
                </h3>
                <p className="text-muted-foreground">
                  {users.length === 0 
                    ? "Aucun utilisateur n'a encore créé de compte."
                    : "Essayez de modifier vos critères de recherche."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de création de compte */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Créer un nouveau compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-username">Nom d'utilisateur</Label>
                  <Input
                    id="create-username"
                    value={createFormData.username}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Mot de passe</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={createFormData.plan}
                    onValueChange={(value: "free" | "premium") => setCreateFormData(prev => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuit</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateAccount} className="flex-1">
                    Créer le compte
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateFormData({ email: "", username: "", password: "", plan: "free" })
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal d'édition */}
        {isEditing && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Modifier l'utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                  <Input
                    id="edit-username"
                    value={editData.username || ""}
                    onChange={(e) => setEditData((prev: Partial<User>) => ({ ...prev, username: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData((prev: Partial<User>) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={editData.plan || "free"}
                    onValueChange={(value: "free" | "premium") => setEditData((prev: Partial<User>) => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuit</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-location">Localisation</Label>
                  <Input
                    id="edit-location"
                    value={editData.profile?.location || ""}
                    onChange={(e) => setEditData((prev: Partial<User>) => ({ 
                      ...prev, 
                      profile: { ...prev.profile, location: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Input
                    id="edit-bio"
                    value={editData.profile?.bio || ""}
                    onChange={(e) => setEditData((prev: Partial<User>) => ({ 
                      ...prev, 
                      profile: { ...prev.profile, bio: e.target.value }
                    }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="flex-1">
                    Sauvegarder
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedUser(null)
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 