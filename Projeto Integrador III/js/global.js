// ===== global.js =====

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', scrollY > 30));
}

// Hamburger
const hamburger = document.getElementById('hamburger');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('open');
    document.querySelector('.nav-actions')?.classList.toggle('open');
  });
}

// Toast
function showToast(message, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = message;
  t.className = 'show';
  t.style.borderColor = type === 'error' ? '#ff5252' : 'var(--border)';
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Formata data dd/mm/yyyy
function formatDate(d) {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return dd + '/' + m + '/' + y;
}

// Atualiza navbar conforme sessão
async function updateNavbar() {
  const navActions = document.getElementById('navActions');
  if (!navActions) return;
  const session = await getSession();
  if (session) {
    const name = session.user.user_metadata?.full_name?.split(' ')[0] || 'Usuário';
    navActions.innerHTML =
      '<a href="meus-agendamentos.html" class="btn-outline">Agendamentos</a>' +
      '<a href="perfil.html" class="btn-primary">👤 ' + name + '</a>';
  } else {
    navActions.innerHTML =
      '<a href="login.html" class="btn-outline">Entrar</a>' +
      '<a href="cadastro.html" class="btn-primary">Cadastrar</a>';
  }
}

// Protege página — redireciona se não logado
async function requireAuth() {
  const session = await getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  return session;
}

// Chama updateNavbar automaticamente em toda página que carrega global.js
document.addEventListener('DOMContentLoaded', updateNavbar);