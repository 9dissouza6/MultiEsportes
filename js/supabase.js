// ===== supabase.js =====
// URL e chave agora vêm de config.js (carregado antes deste arquivo)
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth ──────────────────────────────────────────────────
async function signUp(email, senha, nome, extra = {}) {
  return await db.auth.signUp({ email, password: senha, options: { data: { full_name: nome, ...extra } } });
}
async function signIn(email, senha) {
  return await db.auth.signInWithPassword({ email, password: senha });
}
async function signOut() {
  await db.auth.signOut();
  window.location.href = '../index.html';
}
async function getSession() {
  const { data } = await db.auth.getSession();
  return data.session;
}

// ── Perfil ────────────────────────────────────────────────
async function getProfile(userId) {
  return await db.from('profiles').select('*').eq('id', userId).single();
}
async function updateProfile(userId, updates) {
  return await db.from('profiles').upsert({ id: userId, ...updates, updated_at: new Date() });
}

// ── Espaços ───────────────────────────────────────────────
async function getSpaces(filters = {}) {
  let q = db.from('spaces').select('*').eq('active', true);
  if (filters.sport_type) q = q.eq('sport_type', filters.sport_type);
  if (filters.city)       q = q.ilike('city', '%' + filters.city + '%');
  if (filters.max_price)  q = q.lte('price_per_hour', filters.max_price);
  return await q.order('created_at', { ascending: false });
}

// ── Agendamentos ──────────────────────────────────────────
async function createBooking(bookingData) {
  return await db.from('bookings')
    .insert([{ ...bookingData, status: 'confirmed', created_at: new Date() }])
    .select().single();
}
async function getUserBookings(userId) {
  return await db.from('bookings')
    .select('*, spaces(name, sport_type, address)')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false });
}
async function cancelBooking(bookingId) {
  return await db.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
}
async function getBookedSlots(spaceId, date) {
  return await db.from('bookings')
    .select('start_time, end_time')
    .eq('space_id', spaceId)
    .eq('booking_date', date)
    .neq('status', 'cancelled');
}