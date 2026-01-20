import { supabase } from "./supabase";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  phone?: string;
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

// Get current user with phone from users table
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch phone and integer ID from users table
  const { data: userData } = await supabase
    .from("users")
    .select("id, phone")
    .eq("email", user.email)
    .single();

  return {
    id: userData?.id?.toString() || user.id, // Use users table ID if available
    email: user.email!,
    name: user.user_metadata?.name,
    role: user.user_metadata?.role || "user",
    phone: userData?.phone || undefined,
  };
}

// Check if user is admin (from users table, match by email)
export async function isAdmin(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Check is_admin from users table (match by email)
  const { data: userData, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("email", user.email)
    .single();

  if (error || !userData) return false;

  return userData.is_admin === 1;
}

// Check if user is admin by user ID
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  const { data: userData, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !userData) return false;

  return userData.is_admin === 1;
}

// Get session
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
