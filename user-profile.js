// ========================================
// EPHARMA - USER PROFILE MANAGEMENT
// Gestion du profil utilisateur
// ========================================

// === GLOBAL VARIABLES ===
let currentUser = null;
let currentProfile = null;

// === LOAD USER PROFILE ===

/**
 * Charge le profil complet de l'utilisateur
 */
async function loadUserProfile() {
    try {
        // 1. Récupérer l'utilisateur connecté
        currentUser = await getCurrentUser();

        if (!currentUser) {
            window.location.href = 'user-login.html';
            return;
        }

        // 2. Récupérer le profil
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error) throw error;

        currentProfile = profile;

        // 3. Afficher les informations
        displayUserProfile(profile);

        // 4. Charger les favoris et l'historique
        await loadUserFavorites();
        await loadUserHistory();

    } catch (error) {
        console.error('Erreur chargement profil:', error);
        showError('profileContainer', 'Erreur lors du chargement du profil');
    }
}

/**
 * Affiche les informations du profil
 */
function displayUserProfile(profile) {
    // Nom complet
    const fullNameElement = document.getElementById('userFullName');
    if (fullNameElement) {
        fullNameElement.textContent = profile.full_name || 'Utilisateur';
    }

    // Email
    const emailElement = document.getElementById('userEmail');
    if (emailElement) {
        emailElement.textContent = currentUser.email || '';
    }

    // Téléphone
    const phoneElement = document.getElementById('userPhone');
    if (phoneElement) {
        phoneElement.textContent = profile.phone || 'Non renseigné';
    }

    // Ville
    const cityElement = document.getElementById('userCity');
    if (cityElement) {
        cityElement.textContent = profile.city || 'Non renseignée';
    }

    // Adresse
    const addressElement = document.getElementById('userAddress');
    if (addressElement) {
        addressElement.textContent = profile.address || 'Non renseignée';
    }

    // Avatar
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement && profile.avatar_url) {
        avatarElement.src = profile.avatar_url;
    }

    // Date de création
    const memberSinceElement = document.getElementById('memberSince');
    if (memberSinceElement && profile.created_at) {
        const date = new Date(profile.created_at);
        memberSinceElement.textContent = date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long'
        });
    }
}

// === UPDATE PROFILE ===

/**
 * Met à jour le profil utilisateur
 */
async function updateUserProfile(updates) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('user_id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        currentProfile = data;
        return { success: true, profile: data };

    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gestion du formulaire d'édition de profil
 */
async function handleEditProfileForm(event) {
    event.preventDefault();

    const form = event.target;
    const updates = {
        full_name: form.querySelector('#editFullName').value.trim(),
        phone: form.querySelector('#editPhone').value.trim(),
        city: form.querySelector('#editCity').value.trim(),
        address: form.querySelector('#editAddress').value.trim()
    };

    setButtonLoading('saveProfileBtn', true);

    const result = await updateUserProfile(updates);

    setButtonLoading('saveProfileBtn', false);

    if (result.success) {
        showSuccess('editProfileForm', 'Profil mis à jour avec succès !');
        setTimeout(() => {
            window.location.href = 'user-profile.html';
        }, 1500);
    } else {
        showError('editProfileForm', 'Erreur lors de la mise à jour du profil');
    }
}

// === FAVORITES ===

/**
 * Charge les favoris de l'utilisateur
 */
async function loadUserFavorites() {
    try {
        const { data: favorites, error } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayFavorites(favorites);
        updateFavoritesCount(favorites.length);

    } catch (error) {
        console.error('Erreur chargement favoris:', error);
    }
}

/**
 * Affiche les favoris
 */
function displayFavorites(favorites) {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Aucun favori pour le moment</p>
                <small>Ajoutez des pharmacies ou médecins à vos favoris</small>
            </div>
        `;
        return;
    }

    container.innerHTML = favorites.map(fav => `
        <div class="favorite-card">
            <div class="favorite-icon">
                ${getFavoriteIcon(fav.favorite_type)}
            </div>
            <div class="favorite-info">
                <h4>${fav.favorite_name}</h4>
                <p>${fav.favorite_address || ''}</p>
                <small>${fav.favorite_phone || ''}</small>
            </div>
            <button class="favorite-remove-btn" onclick="removeFavorite('${fav.id}')">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

/**
 * Retourne l'icône selon le type de favori
 */
function getFavoriteIcon(type) {
    const icons = {
        pharmacy: '<path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/><path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2"/>',
        doctor: '<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>',
        health_center: '<path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" width="24" height="24">${icons[type] || icons.pharmacy}</svg>`;
}

/**
 * Supprime un favori
 */
async function removeFavorite(favoriteId) {
    if (!confirm('Voulez-vous vraiment supprimer ce favori ?')) return;

    try {
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('id', favoriteId);

        if (error) throw error;

        // Recharger les favoris
        await loadUserFavorites();

    } catch (error) {
        console.error('Erreur suppression favori:', error);
        alert('Erreur lors de la suppression');
    }
}

/**
 * Met à jour le compteur de favoris
 */
function updateFavoritesCount(count) {
    const countElement = document.getElementById('favoritesCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// === SEARCH HISTORY ===

/**
 * Charge l'historique de recherches
 */
async function loadUserHistory() {
    try {
        const { data: history, error } = await supabase
            .from('user_search_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        displayHistory(history);
        updateHistoryCount(history.length);

    } catch (error) {
        console.error('Erreur chargement historique:', error);
    }
}

/**
 * Affiche l'historique
 */
function displayHistory(history) {
    const container = document.getElementById('historyList');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                    <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>Aucune recherche récente</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map(item => {
        const date = new Date(item.created_at);
        return `
            <div class="history-item">
                <div class="history-icon">
                    ${getFavoriteIcon(item.search_type)}
                </div>
                <div class="history-info">
                    <h4>${item.search_query || 'Recherche'}</h4>
                    <small>${item.location || ''} • ${date.toLocaleDateString('fr-FR')}</small>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Met à jour le compteur d'historique
 */
function updateHistoryCount(count) {
    const countElement = document.getElementById('historyCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

/**
 * Efface l'historique
 */
async function clearHistory() {
    if (!confirm('Voulez-vous vraiment effacer tout l\'historique ?')) return;

    try {
        const { error } = await supabase
            .from('user_search_history')
            .delete()
            .eq('user_id', currentUser.id);

        if (error) throw error;

        await loadUserHistory();

    } catch (error) {
        console.error('Erreur suppression historique:', error);
        alert('Erreur lors de la suppression');
    }
}

// === AVATAR UPLOAD ===

/**
 * Gère l'upload de l'avatar
 */
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('L\'image ne doit pas dépasser 2MB');
        return;
    }

    try {
        // Upload vers Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('user-avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
            .from('user-avatars')
            .getPublicUrl(filePath);

        // Mettre à jour le profil
        await updateUserProfile({ avatar_url: publicUrl });

        // Recharger la page
        window.location.reload();

    } catch (error) {
        console.error('Erreur upload avatar:', error);
        alert('Erreur lors de l\'upload de l\'image');
    }
}

// === INITIALIZATION ===
console.log('👤 User profile module loaded');
