import { supabase } from "./supabase";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Sign up with email and password
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  return data;
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear cookie
  if (typeof document !== 'undefined') {
    document.cookie = 'sb-auth-token=; path=/; max-age=0';
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name,
    role: user.user_metadata?.role || "user",
  };
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

// Get session
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
