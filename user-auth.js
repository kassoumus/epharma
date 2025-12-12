// ========================================
// EPHARMA - USER AUTHENTICATION
// Gestion de l'authentification des utilisateurs
// ========================================

// === CONFIGURATION ===
const AUTH_REDIRECT_KEY = 'epharma_auth_redirect';
const USER_SESSION_KEY = 'epharma_user_session';

// === HELPER FUNCTIONS ===

/**
 * Affiche un message d'erreur dans le formulaire
 */
function showError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Supprimer les anciens messages
    const oldError = form.querySelector('.error-message');
    if (oldError) oldError.remove();

    // Créer le nouveau message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #FEE2E2;
        border: 1px solid #EF4444;
        color: #991B1B;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    errorDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
    `;

    form.insertBefore(errorDiv, form.firstChild);

    // Auto-suppression après 5 secondes
    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Affiche un message de succès
 */
function showSuccess(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #D1FAE5;
        border: 1px solid #10B981;
        color: #065F46;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    successDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>${message}</span>
    `;

    form.insertBefore(successDiv, form.firstChild);
}

/**
 * Active/désactive le bouton de soumission
 */
function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
            </svg>
            <span>Chargement...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
}

// === INSCRIPTION ===

/**
 * Inscription d'un nouvel utilisateur
 */
async function signUp(email, password, fullName, phone, city = 'Niamey') {
    try {
        // 1. Créer le compte avec Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    city: city
                }
            }
        });

        if (authError) throw authError;

        // 2. Créer le profil utilisateur
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: authData.user.id,
                full_name: fullName,
                phone: phone,
                city: city,
                default_location: city
            });

        if (profileError) throw profileError;

        return { success: true, user: authData.user };

    } catch (error) {
        console.error('Erreur inscription:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gestion du formulaire d'inscription
 */
async function handleSignUpForm(event) {
    event.preventDefault();

    const form = event.target;
    const fullName = form.querySelector('#fullName').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const city = form.querySelector('#city')?.value.trim() || 'Niamey';

    // Validation
    if (!fullName || !email || !password) {
        showError(form.id, 'Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (password.length < 6) {
        showError(form.id, 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    if (password !== confirmPassword) {
        showError(form.id, 'Les mots de passe ne correspondent pas');
        return;
    }

    // Inscription
    setButtonLoading('signUpBtn', true);

    const result = await signUp(email, password, fullName, phone, city);

    setButtonLoading('signUpBtn', false);

    if (result.success) {
        showSuccess(form.id, 'Compte créé avec succès ! Redirection...');
        setTimeout(() => {
            window.location.href = 'user-profile.html';
        }, 1500);
    } else {
        showError(form.id, result.error || 'Erreur lors de l\'inscription');
    }
}

// === CONNEXION ===

/**
 * Connexion d'un utilisateur
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };

    } catch (error) {
        console.error('Erreur connexion:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gestion du formulaire de connexion
 */
async function handleSignInForm(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;

    // Validation
    if (!email || !password) {
        showError(form.id, 'Veuillez remplir tous les champs');
        return;
    }

    // Connexion
    setButtonLoading('signInBtn', true);

    const result = await signIn(email, password);

    setButtonLoading('signInBtn', false);

    if (result.success) {
        showSuccess(form.id, 'Connexion réussie ! Redirection...');

        // Redirection vers la page d'origine ou le profil
        const redirectUrl = sessionStorage.getItem(AUTH_REDIRECT_KEY) || 'user-profile.html';
        sessionStorage.removeItem(AUTH_REDIRECT_KEY);

        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
    } else {
        showError(form.id, 'Email ou mot de passe incorrect');
    }
}

// === DÉCONNEXION ===

/**
 * Déconnexion de l'utilisateur
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Nettoyer le stockage local
        sessionStorage.removeItem(USER_SESSION_KEY);

        // Redirection vers la page d'accueil
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Erreur déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
}

// === GESTION DE SESSION ===

/**
 * Récupère l'utilisateur actuellement connecté
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        return user;

    } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        return null;
    }
}

/**
 * Récupère le profil complet de l'utilisateur
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return data;

    } catch (error) {
        console.error('Erreur récupération profil:', error);
        return null;
    }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
async function checkAuth() {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Protège une page (redirige vers login si non connecté)
 */
async function requireAuth() {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
        // Sauvegarder l'URL actuelle pour redirection après login
        sessionStorage.setItem(AUTH_REDIRECT_KEY, window.location.href);
        window.location.href = 'user-login.html';
        return false;
    }

    return true;
}

// === RÉINITIALISATION MOT DE PASSE ===

/**
 * Envoie un email de réinitialisation de mot de passe
 */
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/user-reset-password.html`
        });

        if (error) throw error;

        return { success: true };

    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gestion du formulaire de réinitialisation
 */
async function handleResetPasswordForm(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector('#email').value.trim();

    if (!email) {
        showError(form.id, 'Veuillez entrer votre adresse email');
        return;
    }

    setButtonLoading('resetBtn', true);

    const result = await resetPassword(email);

    setButtonLoading('resetBtn', false);

    if (result.success) {
        showSuccess(form.id, 'Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
        form.reset();
    } else {
        showError(form.id, 'Erreur lors de l\'envoi de l\'email');
    }
}

/**
 * Met à jour le mot de passe
 */
async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { success: true };

    } catch (error) {
        console.error('Erreur mise à jour mot de passe:', error);
        return { success: false, error: error.message };
    }
}

// === ÉCOUTE DES CHANGEMENTS D'AUTHENTIFICATION ===

/**
 * Initialise l'écoute des changements d'état d'authentification
 */
function initAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN') {
            console.log('✅ Utilisateur connecté');
        } else if (event === 'SIGNED_OUT') {
            console.log('❌ Utilisateur déconnecté');
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token rafraîchi');
        }
    });
}

// === INITIALISATION ===
console.log('🔐 User authentication module loaded');

// Initialiser l'écoute des changements d'auth
if (typeof supabase !== 'undefined') {
    initAuthListener();
}
