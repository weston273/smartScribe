import { supabase } from '../database/supabaseClient';

// ✅ Get authenticated user
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

// ✅ Fetch notes from Supabase
export async function fetchSupabaseNotes(userId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error.message);
    return [];
  }

  return data || [];
}

// ✅ Upsert (create/update) a note
export async function upsertSupabaseNote(userId, note) {
  const { error } = await supabase.from('notes').upsert({
    id: note.id,
    user_id: userId,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  });
  if (error) console.error('Supabase upsert error:', error.message);
}

// ✅ Delete a note
export async function deleteSupabaseNote(userId, noteId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('user_id', userId)
    .eq('id', noteId);
  if (error) console.error('Supabase delete error:', error.message);
}

// ✅ Sync local notes to Supabase (on reconnect)
export async function syncLocalToSupabase(localNotes) {
  try {
    const user = await getUser();
    if (!user) return;
    for (const note of localNotes) {
      await upsertSupabaseNote(user.id, note);
    }
  } catch (err) {
    console.error('Error syncing notes to Supabase:', err);
  }
}
