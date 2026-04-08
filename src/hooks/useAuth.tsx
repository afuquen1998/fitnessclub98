import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = 'super_admin' | 'admin' | 'staff' | 'entrenador' | 'recepcionista';

interface UserPermissions {
  view_routines: boolean;
  create_routines: boolean;
  view_assessments: boolean;
  create_assessments: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  userRole: AppRole | null;
  permissions: UserPermissions;
  avatarUrl: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  refreshProfile: () => Promise<void>;
}

const defaultPermissions: UserPermissions = {
  view_routines: false,
  create_routines: false,
  view_assessments: false,
  create_assessments: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchUserRoleAndPermissions = async (userId: string) => {
    try {
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        return;
      }

      if (roleData) {
        const role = roleData.role as AppRole;
        setUserRole(role);
        setIsSuperAdmin(role === 'super_admin');
        setIsStaff(['super_admin', 'admin', 'staff', 'entrenador', 'recepcionista'].includes(role));

        // Super admin, admin, and staff have all permissions
        if (['super_admin', 'admin', 'staff'].includes(role)) {
          setPermissions({
            view_routines: true,
            create_routines: true,
            view_assessments: true,
            create_assessments: true,
          });
        } else {
          // Fetch specific role permissions
          const { data: permData, error: permError } = await supabase
            .from("role_permissions")
            .select("permission")
            .eq("role", role);

          if (permError) {
            console.error("Error fetching permissions:", permError);
            return;
          }

          const perms: UserPermissions = { ...defaultPermissions };
          permData?.forEach((p) => {
            if (p.permission in perms) {
              perms[p.permission as keyof UserPermissions] = true;
            }
          });
          setPermissions(perms);
        }
      } else {
        setUserRole(null);
        setIsSuperAdmin(false);
        setIsStaff(false);
        setPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error("Error in fetchUserRoleAndPermissions:", error);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(async () => {
            await Promise.all([
              fetchUserRoleAndPermissions(session.user.id),
              fetchProfile(session.user.id),
            ]);
          }, 0);
        } else {
          setIsStaff(false);
          setIsSuperAdmin(false);
          setUserRole(null);
          setPermissions(defaultPermissions);
          setAvatarUrl(null);
        }

        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchUserRoleAndPermissions(session.user.id),
          fetchProfile(session.user.id),
        ]).then(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsStaff(false);
    setIsSuperAdmin(false);
    setUserRole(null);
    setPermissions(defaultPermissions);
    setAvatarUrl(null);
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (isSuperAdmin || userRole === 'admin' || userRole === 'staff') {
      return true;
    }
    return permissions[permission];
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        isLoading, 
        isStaff, 
        isSuperAdmin, 
        userRole, 
        permissions,
        avatarUrl,
        signIn, 
        signUp, 
        signOut,
        hasPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
