import { supabase } from './supabase';

export const signIn = async (username: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username.toLowerCase()}@opticrm.com`,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};