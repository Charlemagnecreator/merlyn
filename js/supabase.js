// Initialize Supabase client
const SUPABASE_URL = 'https://xdqfnbgereqikrwkhurv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcWZuYmdlcmVxaWtyd2todXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MjIzNTgsImV4cCI6MjA4MzA5ODM1OH0.t8pNdPfaXdpahQp0s76Cjae_hZKUwQwU5BU4x4n5Nq8';

// Wait for supabase library to load
let supabaseClient = null;

async function initSupabase() {
  if (!window.supabase) {
    console.error('Supabase library not loaded');
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Initialize on script load
initSupabase();

// Folder operations
async function createFolder(folderName, userName) {
  try {
    if (!supabaseClient) await initSupabase();
    const { data, error } = await supabaseClient
      .from('folders')
      .insert([{ name: folderName, user_name: userName }])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('Failed to create folder:', e);
    return null;
  }
}

async function loadFolders(userName = null) {
  try {
    if (!supabaseClient) await initSupabase();
    let query = supabaseClient
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });
    if (userName) {
      query = query.eq('user_name', userName);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to load folders:', e);
    return [];
  }
}

async function deleteFolder(folderId) {
  try {
    if (!supabaseClient) await initSupabase();
    const { error } = await supabaseClient
      .from('folders')
      .delete()
      .eq('id', folderId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Failed to delete folder:', e);
    return false;
  }
}

// Picture operations
async function addPictureToFolder(folderId, pictureUrl) {
  try {
    if (!supabaseClient) await initSupabase();
    const { data, error } = await supabaseClient
      .from('pictures')
      .insert([{ folder_id: folderId, picture_url: pictureUrl }])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('Failed to add picture:', e);
    return null;
  }
}

async function addPicturesToFolder(folderId, pictureUrls) {
  try {
    if (!supabaseClient) await initSupabase();
    const pictures = pictureUrls.map(url => ({ folder_id: folderId, picture_url: url }));
    const { data, error } = await supabaseClient
      .from('pictures')
      .insert(pictures)
      .select();
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to add pictures:', e);
    return [];
  }
}

async function loadPicturesFromFolder(folderId) {
  try {
    if (!supabaseClient) await initSupabase();
    const { data, error } = await supabaseClient
      .from('pictures')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to load pictures:', e);
    return [];
  }
}

async function deletePicture(pictureId) {
  try {
    if (!supabaseClient) await initSupabase();
    const { error } = await supabaseClient
      .from('pictures')
      .delete()
      .eq('id', pictureId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Failed to delete picture:', e);
    return false;
  }
}

// Upload picture to Supabase Storage
async function uploadPictureFile(folderId, file) {
  try {
    if (!supabaseClient) await initSupabase();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folderId}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabaseClient.storage
      .from('files')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (e) {
    console.error('Failed to upload picture:', e);
    return null;
  }
}