import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, ShieldAlert, Users, Settings, Crown, 
  UserCog, User, Shield, UserPlus, X
} from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

type AppRole = 'super_admin' | 'admin' | 'staff' | 'entrenador' | 'recepcionista';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  created_at: string;
}

interface RolePermission {
  id: string;
  role: AppRole;
  permission: string;
}

const ROLE_LABELS: Record<AppRole, { label: string; color: string; icon: React.ReactNode }> = {
  super_admin: { label: "Super Admin", color: "bg-yellow-500/10 text-yellow-500", icon: <Crown className="h-3 w-3" /> },
  admin: { label: "Administrador", color: "bg-red-500/10 text-red-500", icon: <Shield className="h-3 w-3" /> },
  staff: { label: "Staff", color: "bg-blue-500/10 text-blue-500", icon: <UserCog className="h-3 w-3" /> },
  entrenador: { label: "Entrenador", color: "bg-green-500/10 text-green-500", icon: <User className="h-3 w-3" /> },
  recepcionista: { label: "Recepcionista", color: "bg-purple-500/10 text-purple-500", icon: <User className="h-3 w-3" /> },
};

const ALL_PERMISSIONS = [
  { key: "view_routines", label: "Ver Rutinas", description: "Acceso a la sección de rutinas" },
  { key: "create_routines", label: "Crear Rutinas", description: "Generar rutinas con IA" },
  { key: "view_assessments", label: "Ver Valoraciones", description: "Consultar valoraciones físicas" },
  { key: "create_assessments", label: "Registrar Valoraciones", description: "Crear nuevas valoraciones" },
];

const ASSIGNABLE_ROLES: AppRole[] = ['admin', 'staff', 'entrenador', 'recepcionista'];

export default function GestionUsuarios() {
  const { user, isLoading: authLoading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserWithRole[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles with their roles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, created_at");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch emails for all users using the secure function
      const usersWithEmails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: emailData } = await supabase.rpc("get_user_email", {
            target_user_id: profile.user_id,
          });
          return {
            ...profile,
            email: emailData || "",
          };
        })
      );

      // Combine profiles with roles and separate pending users
      const allUsers: UserWithRole[] = usersWithEmails.map((profile) => {
        const roleEntry = rolesData.find((r) => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: roleEntry?.role as AppRole | null,
          created_at: profile.created_at,
        };
      });

      // Separate users with roles from pending users (no role assigned)
      const usersWithRoles = allUsers.filter((u) => u.role !== null);
      const usersWithoutRoles = allUsers.filter((u) => u.role === null);

      setUsers(usersWithRoles);
      setPendingUsers(usersWithoutRoles);

      // Fetch permissions
      const { data: permsData, error: permsError } = await supabase
        .from("role_permissions")
        .select("id, role, permission");

      if (permsError) throw permsError;

      setPermissions(permsData as RolePermission[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, role: AppRole) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      // Move user from pending to approved
      const approvedUser = pendingUsers.find((u) => u.user_id === userId);
      if (approvedUser) {
        setPendingUsers((prev) => prev.filter((u) => u.user_id !== userId));
        setUsers((prev) => [...prev, { ...approvedUser, role }]);
      }

      toast({
        title: "Usuario aprobado",
        description: `El usuario ha sido aprobado como ${ROLE_LABELS[role].label}.`,
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el usuario.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setIsSaving(true);
    try {
      // Delete the user's profile from the database
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Remove from local state
      setPendingUsers((prev) => prev.filter((u) => u.user_id !== userId));
      
      toast({
        title: "Solicitud eliminada",
        description: "El usuario ha sido eliminado del sistema.",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la solicitud.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole | "none") => {
    setIsSaving(true);
    try {
      if (newRole === "none") {
        // Remove role - move to pending
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);

        if (error) throw error;
        
        const demotedUser = users.find((u) => u.user_id === userId);
        if (demotedUser) {
          setUsers((prev) => prev.filter((u) => u.user_id !== userId));
          setPendingUsers((prev) => [...prev, { ...demotedUser, role: null }]);
        }
      } else {
        // Check if user already has a role
        const existingUser = users.find((u) => u.user_id === userId);
        
        if (existingUser?.role) {
          // Update existing role
          const { error } = await supabase
            .from("user_roles")
            .update({ role: newRole })
            .eq("user_id", userId);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: newRole });

          if (error) throw error;
        }

        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === userId ? { ...u, role: newRole } : u
          )
        );
      }

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionToggle = async (role: AppRole, permission: string, enabled: boolean) => {
    setIsSaving(true);
    try {
      if (enabled) {
        // Add permission
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role, permission });

        if (error) throw error;

        // Update local state
        const { data: newPerm } = await supabase
          .from("role_permissions")
          .select("id, role, permission")
          .eq("role", role)
          .eq("permission", permission)
          .single();

        if (newPerm) {
          setPermissions((prev) => [...prev, newPerm as RolePermission]);
        }
      } else {
        // Remove permission
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role", role)
          .eq("permission", permission);

        if (error) throw error;

        // Update local state
        setPermissions((prev) =>
          prev.filter((p) => !(p.role === role && p.permission === permission))
        );
      }

      toast({
        title: "Permiso actualizado",
        description: `Permiso ${enabled ? "habilitado" : "deshabilitado"} correctamente.`,
      });
    } catch (error) {
      console.error("Error toggling permission:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasPermission = (role: AppRole, permission: string): boolean => {
    return permissions.some((p) => p.role === role && p.permission === permission);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="font-display text-2xl mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                Solo el Super Administrador puede acceder a esta sección.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
            <Crown className="h-4 w-4" />
            Super Admin
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4 tracking-wider">
            GESTIÓN DE <span className="text-primary">USUARIOS</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Administra roles y permisos de los usuarios del sistema.
          </p>
        </div>

        {/* Mi Perfil Section */}
        <Card className="max-w-md mx-auto mb-12 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">Mi Perfil</CardTitle>
            <CardDescription>Actualiza tu foto de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload size="lg" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Pendientes
              {pendingUsers.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {pendingUsers.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Settings className="h-4 w-4" />
              Permisos
            </TabsTrigger>
          </TabsList>

          {/* Pending Users Tab */}
          <TabsContent value="pending">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Usuarios Pendientes de Aprobación
                </CardTitle>
                <CardDescription>
                  Usuarios registrados que aún no tienen un rol asignado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios pendientes de aprobación.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead>Asignar Rol</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((u) => (
                          <TableRow key={u.user_id} className="bg-yellow-500/5">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={u.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {u.full_name?.[0]?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{u.full_name || "Sin nombre"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-primary font-medium">
                                {u.email || "Sin email"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(u.created_at).toLocaleDateString('es-CO')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select
                                onValueChange={(value) => handleApproveUser(u.user_id, value as AppRole)}
                                disabled={isSaving}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ASSIGNABLE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {ROLE_LABELS[role].label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRejectUser(u.user_id)}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Usuarios Aprobados
                </CardTitle>
                <CardDescription>
                  Usuarios con roles asignados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol Actual</TableHead>
                        <TableHead>Cambiar Rol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={u.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {u.full_name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.full_name || "Sin nombre"}</p>
                                <p className="text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.role ? (
                              <Badge className={`${ROLE_LABELS[u.role].color} gap-1`}>
                                {ROLE_LABELS[u.role].icon}
                                {ROLE_LABELS[u.role].label}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Sin rol</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {u.role === 'super_admin' ? (
                              <span className="text-sm text-muted-foreground">
                                No modificable
                              </span>
                            ) : (
                              <Select
                                value={u.role || "none"}
                                onValueChange={(value) => handleRoleChange(u.user_id, value as AppRole | "none")}
                                disabled={isSaving}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sin rol</SelectItem>
                                  {ASSIGNABLE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {ROLE_LABELS[role].label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Permisos por Rol
                </CardTitle>
                <CardDescription>
                  Configura qué acciones puede realizar cada rol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permiso</TableHead>
                        <TableHead className="text-center">Entrenador</TableHead>
                        <TableHead className="text-center">Recepcionista</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ALL_PERMISSIONS.map((perm) => (
                        <TableRow key={perm.key}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{perm.label}</p>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={hasPermission('entrenador', perm.key)}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle('entrenador', perm.key, checked)
                              }
                              disabled={isSaving}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={hasPermission('recepcionista', perm.key)}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle('recepcionista', perm.key, checked)
                              }
                              disabled={isSaving}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Nota:</strong> Los roles Super Admin, Admin y Staff tienen todos los permisos automáticamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
