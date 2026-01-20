'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Briefcase,
    ChevronLeft,
    ChevronRight,
    Mail,
    MoreVertical,
    Search,
    Shield,
    Trash2,
    User,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../AdminLayout'

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
  _count: {
    applications: number
    companies: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
      setActionMenuOpen(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    setUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
      setActionMenuOpen(null)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4" />
      case 'EMPLOYER': return <Briefcase className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      EMPLOYER: 'bg-blue-100 text-blue-700',
      CANDIDATE: 'bg-green-100 text-green-700'
    }
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      EMPLOYER: 'Employeur',
      CANDIDATE: 'Candidat'
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors[role] || 'bg-gray-100 text-gray-700'}`}>
        {getRoleIcon(role)}
        {labels[role] || role}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-600">Gérer les utilisateurs de la plateforme</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('')}
                >
                  Tous
                </Button>
                <Button
                  variant={roleFilter === 'CANDIDATE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('CANDIDATE')}
                >
                  <User className="w-4 h-4 mr-1" />
                  Candidats
                </Button>
                <Button
                  variant={roleFilter === 'EMPLOYER' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('EMPLOYER')}
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  Employeurs
                </Button>
                <Button
                  variant={roleFilter === 'ADMIN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('ADMIN')}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {pagination?.total || 0} utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Aucun utilisateur trouvé
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-slate-600">Utilisateur</th>
                      <th className="pb-3 font-medium text-slate-600">Rôle</th>
                      <th className="pb-3 font-medium text-slate-600 hidden md:table-cell">Activité</th>
                      <th className="pb-3 font-medium text-slate-600 hidden lg:table-cell">Inscrit le</th>
                      <th className="pb-3 font-medium text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-medium overflow-hidden">
                              {user.image ? (
                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                user.name?.charAt(0) || user.email.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name || 'Sans nom'}</p>
                              <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-4 hidden md:table-cell">
                          <div className="text-sm text-slate-600">
                            {user.role === 'EMPLOYER' ? (
                              <span>{user._count.companies} entreprises</span>
                            ) : (
                              <span>{user._count.applications} candidatures</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 hidden lg:table-cell text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 text-right">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                              disabled={updating === user.id}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            
                            {actionMenuOpen === user.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                                <div className="p-1">
                                  <p className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">Changer le rôle</p>
                                  {['CANDIDATE', 'EMPLOYER', 'ADMIN'].map(role => (
                                    <button
                                      key={role}
                                      onClick={() => updateRole(user.id, role)}
                                      className={`w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 ${
                                        user.role === role 
                                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                          : 'hover:bg-slate-50'
                                      }`}
                                      disabled={user.role === role}
                                    >
                                      {getRoleIcon(role)}
                                      {{ ADMIN: 'Admin', EMPLOYER: 'Employeur', CANDIDATE: 'Candidat' }[role]}
                                    </button>
                                  ))}
                                  <div className="border-t my-1" />
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="w-full px-3 py-2 text-left text-sm rounded flex items-center gap-2 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
