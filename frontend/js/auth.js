// API Base URL
const API_URL = 'http://localhost:8000';

// Element selections
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('cadastro-form');

// Helper to verify token expiration
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    } catch (e) {
        return true;
    }
}

// Redirect helper
function redirectToLoginWithMessage() {
    localStorage.removeItem('dolcevita_token');
    sessionStorage.setItem('auth_message', 'Sessão expirada, faça login novamente');
    window.location.href = 'login.html';
}

// Attempt silent login using stored credentials
async function attemptAutoLogin() {
    const username = localStorage.getItem('dolcevita_user');
    const password = localStorage.getItem('dolcevita_pass');
    
    if (!username || !password) {
        return false;
    }
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
        const res = await originalFetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('dolcevita_token', data.access_token);
            console.log("Auto-login successful.");
            return true;
        } else {
            console.error("Auto-login failed.");
            return false;
        }
    } catch (error) {
        console.error("Auto-login network error:", error);
        return false;
    }
}

// Intercept window.fetch to check token expiration and attempt auto-login
const originalFetch = window.fetch;
window.fetch = async function (url, options) {
    const urlStr = url.toString();
    const isApiCall = urlStr.includes(API_URL) || urlStr.startsWith('/') || urlStr.includes('localhost:8000');
    
    if (isApiCall) {
        let token = localStorage.getItem('dolcevita_token');
        if (token && isTokenExpired(token)) {
            console.log("Token expired, attempting auto-login...");
            const autoLoginSuccess = await attemptAutoLogin();
            if (!autoLoginSuccess) {
                redirectToLoginWithMessage();
                return new Response(JSON.stringify({ detail: "Sessão expirada. Faça login novamente." }), {
                    status: 401,
                    statusText: "Unauthorized",
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            token = localStorage.getItem('dolcevita_token');
            if (options && options.headers) {
                if (options.headers instanceof Headers) {
                    options.headers.set('Authorization', `Bearer ${token}`);
                } else if (typeof options.headers === 'object') {
                    options.headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }
    }
    return originalFetch(url, options);
};

// Helper to check token and redirect if unauthorized
function checkAuth() {
    let token = localStorage.getItem('dolcevita_token');
    const path = window.location.pathname;
    
    // Pages that require authentication
    const protectedPages = ['home.html', 'produtos.html', 'produto.html', 'carrinho.html', 'status.html', 'perfil.html', 'meus-pedidos.html', 'receitas.html'];
    
    const isProtected = protectedPages.some(page => path.includes(page));
    
    if (isProtected) {
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        if (isTokenExpired(token)) {
            attemptAutoLogin().then(success => {
                if (!success) {
                    redirectToLoginWithMessage();
                }
            });
        }
    } else if (token && !isTokenExpired(token) && (path.includes('login.html') || path.includes('index.html') || path.includes('cadastro.html') || path === '/' || path.endsWith('/frontend/'))) {
        window.location.href = 'home.html';
    }
}

// Get standard auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('dolcevita_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Log out user
function logout() {
    localStorage.removeItem('dolcevita_token');
    localStorage.removeItem('dolcevita_user');
    localStorage.removeItem('dolcevita_pass');
    localStorage.removeItem('cart');
    window.location.href = 'login.html';
}

// Handle Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await originalFetch(`${API_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('dolcevita_token', data.access_token);
                localStorage.setItem('dolcevita_user', username);
                localStorage.setItem('dolcevita_pass', password);
                // Redirect to home
                window.location.href = 'home.html';
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Erro de login: ${errorData.detail || 'Credenciais inválidas'}`);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
        }
    });
}

// Handle Signup (Cadastro)
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        
        // Save additional fields into localStorage for mock profile customization
        const profile = {
            fullname: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            zipcode: document.getElementById('zipcode').value.trim(),
            street: document.getElementById('street').value.trim(),
            number: document.getElementById('number').value.trim(),
            complement: document.getElementById('complement').value.trim(),
            city: document.getElementById('city').value.trim()
        };

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (res.ok) {
                // Save mock user profile to simulate standard registration details
                localStorage.setItem(`profile_${username}`, JSON.stringify(profile));
                alert('Cadastro realizado com sucesso! Faça login para continuar.');
                window.location.href = 'login.html';
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Erro no cadastro: ${errorData.detail || 'Não foi possível concluir o cadastro'}`);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            alert('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
        }
    });
}

// Run auth check on script loading
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Display session expired message if redirecting from expired session
    const authMsg = sessionStorage.getItem('auth_message');
    if (authMsg && window.location.pathname.includes('login.html')) {
        sessionStorage.removeItem('auth_message');
        const card = document.querySelector('.auth-card');
        if (card) {
            const banner = document.createElement('div');
            banner.className = 'auth-msg-banner';
            banner.innerText = authMsg;
            banner.style.color = 'var(--red-normal)';
            banner.style.background = 'var(--red-light)';
            banner.style.padding = '10px';
            banner.style.borderRadius = '10px';
            banner.style.marginBottom = '20px';
            banner.style.fontWeight = '600';
            
            const subtitle = card.querySelector('.auth-subtitle');
            if (subtitle) {
                subtitle.parentNode.insertBefore(banner, subtitle.nextSibling);
            } else {
                card.prepend(banner);
            }
        } else {
            alert(authMsg);
        }
    }
});
