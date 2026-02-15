// ========================================
// SUPER ADMIN - USER MANAGEMENT
// Gestion des utilisateurs et rôles
// ========================================

// === GLOBAL VARIABLES ===
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
let usersPerPage = 20;
let currentFilters = {
    search: '',
    role: 'all',
    status: 'all'
};

// === LOAD ALL USERS ===

/**
 * Charge tous les utilisateurs depuis Supabase
 */
async function loadAllUsers() {
    try {
        showLoading(true);

        // Utiliser la fonction sécurisée au lieu de la vue vulnérable
        const { data, error } = await supabase
            .rpc('get_admin_users_list');

        if (error) throw error;

        allUsers = data || [];
        applyFilters();
        updateStatistics();

    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        showError('Erreur lors du chargement des utilisateurs: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Applique les filtres et affiche les résultats
 */
function applyFilters() {
    filteredUsers = allUsers.filter(user => {
        // Filtre par recherche (email ou nom)
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchEmail = user.email?.toLowerCase().includes(searchLower);
            const matchName = user.full_name?.toLowerCase().includes(searchLower);
            if (!matchEmail && !matchName) return false;
        }

        // Filtre par rôle
        if (currentFilters.role !== 'all' && user.role !== currentFilters.role) {
            return false;
        }

        // Filtre par statut
        if (currentFilters.status === 'active' && !user.is_active) return false;
        if (currentFilters.status === 'inactive' && user.is_active) return false;
        if (currentFilters.status === 'pending' && user.email_status !== 'pending') return false;

        return true;
    });

    currentPage = 1;
    renderUsersTable();
    renderPagination();
}

/**
 * Affiche le tableau des utilisateurs
 */
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    // Calculer les utilisateurs à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);

    if (usersToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" width="48" height="48" style="margin: 0 auto 16px; opacity: 0.3;">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <p style="color: #6B7280; margin: 0;">Aucun utilisateur trouvé</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = usersToShow.map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="user-avatar-small">
                        ${user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 500; color: #111827;">${user.email}</div>
                        ${user.full_name ? `<div style="font-size: 13px; color: #6B7280;">${user.full_name}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>${user.phone || '-'}</td>
            <td>${user.city || '-'}</td>
            <td>
                <span class="role-badge role-${user.role}">
                    ${getRoleLabel(user.role)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">
                    ${user.is_active ? '✅ Actif' : '❌ Inactif'}
                </span>
                ${user.email_status === 'pending' ? '<span class="status-badge status-pending">⏳ En attente</span>' : ''}
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editUser('${user.id}')" class="action-btn" title="Modifier">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button onclick="toggleUserStatus('${user.id}', ${!user.is_active})" class="action-btn" title="${user.is_active ? 'Désactiver' : 'Activer'}">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button onclick="confirmDeleteUser('${user.id}', '${user.email}')" class="action-btn action-btn-danger" title="Supprimer">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Mettre à jour le compteur
    updateResultsCount();
}

/**
 * Affiche la pagination
 */
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Bouton Précédent
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            ← Précédent
        </button>
    `;

    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }

    // Bouton Suivant
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Suivant →
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

/**
 * Change de page
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderUsersTable();
    renderPagination();

    // Scroll vers le haut du tableau
    document.getElementById('usersTable')?.scrollIntoView({ behavior: 'smooth' });
}

// === USER ACTIONS ===

/**
 * Éditer un utilisateur
 */
async function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    // Ouvrir le modal d'édition
    openEditModal(user);
}

/**
 * Ouvrir le modal d'édition
 */
function openEditModal(user) {
    const modal = document.getElementById('editUserModal');
    if (!modal) return;

    // Pré-remplir le formulaire
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserName').value = user.full_name || '';
    document.getElementById('editUserPhone').value = user.phone || '';
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserStatus').checked = user.is_active;

    modal.style.display = 'flex';
}

/**
 * Fermer le modal
 */
function closeEditModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Sauvegarder les modifications
 */
async function saveUserChanges(event) {
    event.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const newRole = document.getElementById('editUserRole').value;
    const isActive = document.getElementById('editUserStatus').checked;
    const fullName = document.getElementById('editUserName').value.trim();
    const phone = document.getElementById('editUserPhone').value.trim();

    try {
        showLoading(true);

        // Obtenir l'utilisateur actuel (admin)
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }

        // Mettre à jour le rôle via la fonction SQL (avec p_admin_id)
        const { error: roleError } = await supabase.rpc('update_user_role', {
            p_user_id: userId,
            p_new_role: newRole,
            p_admin_id: currentUser.id  // ✅ Paramètre manquant ajouté
        });

        if (roleError) throw roleError;

        // Mettre à jour le statut (nom de fonction corrigé)
        const { error: statusError } = await supabase.rpc('toggle_user_active_status', {  // ✅ Nom corrigé
            p_user_id: userId,
            p_is_active: isActive,
            p_admin_id: currentUser.id  // ✅ Paramètre manquant ajouté
        });

        if (statusError) throw statusError;

        // Mettre à jour ou créer le profil (UPSERT)
        if (fullName || phone) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: userId,
                    full_name: fullName || null,
                    phone: phone || null
                }, {
                    onConflict: 'user_id'  // ✅ UPSERT au lieu de UPDATE
                });

            if (profileError) throw profileError;
        }

        showSuccess('Utilisateur mis à jour avec succès');
        closeEditModal();
        await loadAllUsers();

    } catch (error) {
        console.error('Erreur mise à jour utilisateur:', error);
        showError('Erreur lors de la mise à jour: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Activer/Désactiver un utilisateur
 */
async function toggleUserStatus(userId, newStatus) {
    if (!confirm(`Voulez-vous vraiment ${newStatus ? 'activer' : 'désactiver'} ce compte ?`)) {
        return;
    }

    try {
        showLoading(true);

        // Obtenir l'utilisateur actuel (admin)
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
        }

        const { error } = await supabase.rpc('toggle_user_active_status', {  // ✅ Nom corrigé
            p_user_id: userId,
            p_is_active: newStatus,
            p_admin_id: currentUser.id  // ✅ Paramètre manquant ajouté
        });

        if (error) throw error;

        showSuccess(`Compte ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        await loadAllUsers();

    } catch (error) {
        console.error('Erreur changement statut:', error);
        showError('Erreur lors du changement de statut: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Confirmer la suppression d'un utilisateur
 */
function confirmDeleteUser(userId, userEmail) {
    const modal = document.getElementById('deleteUserModal');
    if (!modal) return;

    document.getElementById('deleteUserEmail').textContent = userEmail;
    document.getElementById('confirmDeleteBtn').onclick = () => deleteUser(userId);

    modal.style.display = 'flex';
}

/**
 * Supprimer un utilisateur
 */
async function deleteUser(userId) {
    try {
        showLoading(true);

        // Supprimer le profil
        const { error: profileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('user_id', userId);

        // Supprimer de la table users
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) throw userError;

        showSuccess('Utilisateur supprimé avec succès');
        closeDeleteModal();
        await loadAllUsers();

    } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
        showError('Erreur lors de la suppression');
    } finally {
        showLoading(false);
    }
}

/**
 * Fermer le modal de suppression
 */
function closeDeleteModal() {
    const modal = document.getElementById('deleteUserModal');
    if (modal) modal.style.display = 'none';
}

// === SEARCH & FILTERS ===

/**
 * Rechercher des utilisateurs
 */
function searchUsers() {
    const searchInput = document.getElementById('searchUsers');
    currentFilters.search = searchInput?.value || '';
    applyFilters();
}

/**
 * Filtrer par rôle
 */
function filterByRole() {
    const roleSelect = document.getElementById('filterRole');
    currentFilters.role = roleSelect?.value || 'all';
    applyFilters();
}

/**
 * Filtrer par statut
 */
function filterByStatus() {
    const statusSelect = document.getElementById('filterStatus');
    currentFilters.status = statusSelect?.value || 'all';
    applyFilters();
}

// === STATISTICS ===

/**
 * Mettre à jour les statistiques
 */
function updateStatistics() {
    // Total utilisateurs
    const totalUsers = allUsers.length;
    document.getElementById('totalUsers').textContent = totalUsers;

    // Par rôle
    const patients = allUsers.filter(u => u.role === 'patient').length;
    const pharmacies = allUsers.filter(u => u.role === 'pharmacy').length;
    const doctors = allUsers.filter(u => u.role === 'doctor').length;
    const admins = allUsers.filter(u => u.role === 'admin').length;

    document.getElementById('totalPatients').textContent = patients;
    document.getElementById('totalPharmacies').textContent = pharmacies;
    document.getElementById('totalDoctors').textContent = doctors;
    document.getElementById('totalAdmins').textContent = admins;

    // Actifs vs Inactifs
    const activeUsers = allUsers.filter(u => u.is_active).length;
    document.getElementById('activeUsers').textContent = activeUsers;
}

/**
 * Mettre à jour le compteur de résultats
 */
function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = `${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''}`;
    }
}

// === UTILITY FUNCTIONS ===

/**
 * Obtenir le label du rôle
 */
function getRoleLabel(role) {
    const labels = {
        'patient': 'Patient',
        'pharmacy': 'Pharmacie',
        'doctor': 'Médecin',
        'admin': 'Admin'
    };
    return labels[role] || role;
}

/**
 * Formater une date
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Afficher le chargement
 */
function showLoading(show) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Afficher un message d'erreur
 */
function showError(message) {
    alert('❌ ' + message);
}

/**
 * Afficher un message de succès
 */
function showSuccess(message) {
    alert('✅ ' + message);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadAllUsers();

    // Event listeners
    document.getElementById('searchUsers')?.addEventListener('input', searchUsers);
    document.getElementById('filterRole')?.addEventListener('change', filterByRole);
    document.getElementById('filterStatus')?.addEventListener('change', filterByStatus);
    document.getElementById('editUserForm')?.addEventListener('submit', saveUserChanges);
});

console.log('👥 Super Admin User Management loaded');
