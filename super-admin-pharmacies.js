// ========================================
// SUPER ADMIN - GESTION DES PHARMACIES
// Module JavaScript
// ========================================

// === GLOBAL VARIABLES ===
let allPharmacies = [];
let filteredPharmacies = [];
let currentPage = 1;
let pharmaciesPerPage = 20;
let currentFilters = {
    search: '',
    city: 'all',
    services: 'all',
    status: 'all'
};
let currentEditingPharmacyId = null;

// === LOAD PHARMACIES ===

/**
 * Charge toutes les pharmacies
 */
async function loadPharmacies() {
    try {
        showLoading(true);

        const { data, error } = await supabase
            .from('admin_pharmacies_view')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allPharmacies = data || [];
        applyFilters();
        updateStatistics();

    } catch (error) {
        console.error('Erreur chargement pharmacies:', error);
        showError('Erreur lors du chargement des pharmacies');
    } finally {
        showLoading(false);
    }
}

/**
 * Applique les filtres
 */
function applyFilters() {
    filteredPharmacies = allPharmacies.filter(pharmacy => {
        // Filtre par recherche
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const matchName = pharmacy.name?.toLowerCase().includes(searchLower);
            const matchCity = pharmacy.city?.toLowerCase().includes(searchLower);
            const matchAddress = pharmacy.address?.toLowerCase().includes(searchLower);
            if (!matchName && !matchCity && !matchAddress) return false;
        }

        // Filtre par ville
        if (currentFilters.city !== 'all' && pharmacy.city !== currentFilters.city) {
            return false;
        }

        // Filtre par services
        if (currentFilters.services === '24_7' && !pharmacy.is_open_24_7) return false;
        if (currentFilters.services === 'parking' && !pharmacy.has_parking) return false;

        // Filtre par statut
        if (currentFilters.status === 'active' && !pharmacy.has_user) return false;
        if (currentFilters.status === 'inactive' && pharmacy.has_user) return false;

        return true;
    });

    currentPage = 1;
    renderPharmaciesTable();
    renderPagination();
}

/**
 * Affiche le tableau des pharmacies
 */
function renderPharmaciesTable() {
    const tbody = document.getElementById('pharmaciesTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * pharmaciesPerPage;
    const endIndex = startIndex + pharmaciesPerPage;
    const pharmaciesToShow = filteredPharmacies.slice(startIndex, endIndex);

    if (pharmaciesToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" width="48" height="48" style="margin: 0 auto 16px; opacity: 0.3;">
                            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <p style="color: #6B7280; margin: 0;">Aucune pharmacie trouvée</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pharmaciesToShow.map(pharmacy => `
        <tr>
            <td>
                <div style="font-weight: 500; color: #111827;">${pharmacy.name}</div>
                <div style="font-size: 13px; color: #6B7280;">${pharmacy.address}</div>
            </td>
            <td>${pharmacy.city}</td>
            <td>${pharmacy.phone}</td>
            <td>
                ${pharmacy.user_email ? `
                    <div style="font-size: 13px;">${pharmacy.user_email}</div>
                    <span class="status-badge status-active">✅ Affecté</span>
                ` : `
                    <span class="status-badge status-inactive">❌ Non affecté</span>
                `}
            </td>
            <td>
                ${pharmacy.is_open_24_7 ? '<span class="service-badge">🕐 24/7</span>' : ''}
                ${pharmacy.has_parking ? '<span class="service-badge">🅿️ Parking</span>' : ''}
                ${!pharmacy.is_open_24_7 && !pharmacy.has_parking ? '-' : ''}
            </td>
            <td>${formatDate(pharmacy.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editPharmacy('${pharmacy.id}')" class="action-btn" title="Modifier">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button onclick="confirmDeletePharmacy('${pharmacy.id}', '${pharmacy.name}')" class="action-btn action-btn-danger" title="Supprimer">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updateResultsCount();
}

// === CREATE PHARMACY ===

/**
 * Ouvre le modal de création
 */
function openCreatePharmacyModal() {
    const modal = document.getElementById('createPharmacyModal');
    if (!modal) return;

    // Réinitialiser le formulaire
    document.getElementById('createPharmacyForm').reset();
    document.getElementById('userSelectionType').value = 'existing';
    toggleUserSelection();

    // Charger les utilisateurs disponibles
    loadAvailableUsers();

    modal.style.display = 'flex';
}

/**
 * Charge les utilisateurs disponibles (rôle pharmacy sans pharmacie)
 */
async function loadAvailableUsers() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email')
            .eq('role', 'pharmacy');

        if (error) throw error;

        // Filtrer ceux qui n'ont pas déjà une pharmacie
        const usersWithPharmacy = allPharmacies
            .filter(p => p.user_id)
            .map(p => p.user_id);

        const availableUsers = data.filter(u => !usersWithPharmacy.includes(u.id));

        const select = document.getElementById('existingUserId');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner un utilisateur</option>' +
                availableUsers.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
        }

    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
    }
}

/**
 * Bascule entre sélection utilisateur existant et création
 */
function toggleUserSelection() {
    const type = document.getElementById('userSelectionType').value;
    const existingSection = document.getElementById('existingUserSection');
    const newUserSection = document.getElementById('newUserSection');

    if (type === 'existing') {
        existingSection.style.display = 'block';
        newUserSection.style.display = 'none';
    } else {
        existingSection.style.display = 'none';
        newUserSection.style.display = 'block';
    }
}

/**
 * Crée une nouvelle pharmacie
 */
async function createPharmacy(event) {
    event.preventDefault();

    const form = event.target;
    const userType = document.getElementById('userSelectionType').value;

    try {
        showLoading(true);

        let userId = null;

        // Créer ou sélectionner l'utilisateur
        if (userType === 'existing') {
            userId = document.getElementById('existingUserId').value;
            if (!userId) {
                showError('Veuillez sélectionner un utilisateur');
                return;
            }
        } else {
            // Créer un nouvel utilisateur
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;

            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true
            });

            if (authError) throw authError;

            userId = authData.user.id;

            // Ajouter dans la table users
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email: email,
                    user_type: 'pharmacy',
                    role: 'pharmacy',
                    is_active: true
                });

            if (userError) throw userError;
        }

        // Créer la pharmacie
        const { data, error } = await supabase.rpc('create_pharmacy_with_user', {
            p_user_id: userId,
            p_pharmacy_name: form.querySelector('#pharmacyName').value,
            p_address: form.querySelector('#pharmacyAddress').value,
            p_city: form.querySelector('#pharmacyCity').value,
            p_postal_code: form.querySelector('#pharmacyPostalCode').value || null,
            p_phone: form.querySelector('#pharmacyPhone').value,
            p_email: form.querySelector('#pharmacyEmail').value || null,
            p_latitude: parseFloat(form.querySelector('#pharmacyLatitude').value) || null,
            p_longitude: parseFloat(form.querySelector('#pharmacyLongitude').value) || null,
            p_is_open_24_7: form.querySelector('#pharmacy247').checked,
            p_has_parking: form.querySelector('#pharmacyParking').checked
        });

        if (error) throw error;

        showSuccess('Pharmacie créée avec succès !');
        closeCreatePharmacyModal();
        await loadPharmacies();

    } catch (error) {
        console.error('Erreur création pharmacie:', error);
        showError('Erreur lors de la création: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Ferme le modal de création
 */
function closeCreatePharmacyModal() {
    const modal = document.getElementById('createPharmacyModal');
    if (modal) modal.style.display = 'none';
}

// === EDIT PHARMACY ===

/**
 * Édite une pharmacie
 */
async function editPharmacy(pharmacyId) {
    const pharmacy = allPharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return;

    currentEditingPharmacyId = pharmacyId;
    openEditPharmacyModal(pharmacy);
}

/**
 * Ouvre le modal d'édition
 */
function openEditPharmacyModal(pharmacy) {
    const modal = document.getElementById('editPharmacyModal');
    if (!modal) return;

    // Pré-remplir le formulaire
    document.getElementById('editPharmacyId').value = pharmacy.id;
    document.getElementById('editPharmacyName').value = pharmacy.name;
    document.getElementById('editPharmacyAddress').value = pharmacy.address;
    document.getElementById('editPharmacyCity').value = pharmacy.city;
    document.getElementById('editPharmacyPostalCode').value = pharmacy.postal_code || '';
    document.getElementById('editPharmacyPhone').value = pharmacy.phone;
    document.getElementById('editPharmacyEmail').value = pharmacy.email || '';
    document.getElementById('editPharmacyLatitude').value = pharmacy.latitude || '';
    document.getElementById('editPharmacyLongitude').value = pharmacy.longitude || '';
    document.getElementById('editPharmacy247').checked = pharmacy.is_open_24_7;
    document.getElementById('editPharmacyParking').checked = pharmacy.has_parking;

    modal.style.display = 'flex';
}

/**
 * Sauvegarde les modifications
 */
async function savePharmacyChanges(event) {
    event.preventDefault();

    const form = event.target;
    const pharmacyId = document.getElementById('editPharmacyId').value;

    try {
        showLoading(true);

        const { error } = await supabase.rpc('update_pharmacy', {
            p_pharmacy_id: pharmacyId,
            p_name: form.querySelector('#editPharmacyName').value,
            p_address: form.querySelector('#editPharmacyAddress').value,
            p_city: form.querySelector('#editPharmacyCity').value,
            p_postal_code: form.querySelector('#editPharmacyPostalCode').value || null,
            p_phone: form.querySelector('#editPharmacyPhone').value,
            p_email: form.querySelector('#editPharmacyEmail').value || null,
            p_latitude: parseFloat(form.querySelector('#editPharmacyLatitude').value) || null,
            p_longitude: parseFloat(form.querySelector('#editPharmacyLongitude').value) || null,
            p_is_open_24_7: form.querySelector('#editPharmacy247').checked,
            p_has_parking: form.querySelector('#editPharmacyParking').checked
        });

        if (error) throw error;

        showSuccess('Pharmacie mise à jour avec succès !');
        closeEditPharmacyModal();
        await loadPharmacies();

    } catch (error) {
        console.error('Erreur mise à jour pharmacie:', error);
        showError('Erreur lors de la mise à jour');
    } finally {
        showLoading(false);
    }
}

/**
 * Ferme le modal d'édition
 */
function closeEditPharmacyModal() {
    const modal = document.getElementById('editPharmacyModal');
    if (modal) modal.style.display = 'none';
}

// === DELETE PHARMACY ===

/**
 * Confirme la suppression
 */
function confirmDeletePharmacy(pharmacyId, pharmacyName) {
    const modal = document.getElementById('deletePharmacyModal');
    if (!modal) return;

    document.getElementById('deletePharmacyName').textContent = pharmacyName;
    document.getElementById('confirmDeletePharmacyBtn').onclick = () => deletePharmacy(pharmacyId);

    modal.style.display = 'flex';
}

/**
 * Supprime une pharmacie
 */
async function deletePharmacy(pharmacyId) {
    try {
        showLoading(true);

        const { error } = await supabase.rpc('delete_pharmacy', {
            p_pharmacy_id: pharmacyId
        });

        if (error) throw error;

        showSuccess('Pharmacie supprimée avec succès !');
        closeDeletePharmacyModal();
        await loadPharmacies();

    } catch (error) {
        console.error('Erreur suppression pharmacie:', error);
        showError('Erreur lors de la suppression');
    } finally {
        showLoading(false);
    }
}

/**
 * Ferme le modal de suppression
 */
function closeDeletePharmacyModal() {
    const modal = document.getElementById('deletePharmacyModal');
    if (modal) modal.style.display = 'none';
}

// === SEARCH & FILTERS ===

function searchPharmacies() {
    const searchInput = document.getElementById('searchPharmacies');
    currentFilters.search = searchInput?.value || '';
    applyFilters();
}

function filterByCity() {
    const citySelect = document.getElementById('filterCity');
    currentFilters.city = citySelect?.value || 'all';
    applyFilters();
}

function filterByServices() {
    const servicesSelect = document.getElementById('filterServices');
    currentFilters.services = servicesSelect?.value || 'all';
    applyFilters();
}

function filterByStatus() {
    const statusSelect = document.getElementById('filterStatus');
    currentFilters.status = statusSelect?.value || 'all';
    applyFilters();
}

// === STATISTICS ===

async function updateStatistics() {
    try {
        const { data, error } = await supabase.rpc('get_pharmacies_stats');

        if (error) throw error;

        const stats = data[0];
        document.getElementById('totalPharmacies').textContent = stats.total_pharmacies || 0;
        document.getElementById('activePharmacies').textContent = stats.active_pharmacies || 0;
        document.getElementById('pharmacies247').textContent = stats.pharmacies_24_7 || 0;
        document.getElementById('pharmaciesParking').textContent = stats.pharmacies_with_parking || 0;

    } catch (error) {
        console.error('Erreur chargement statistiques:', error);
    }
}

// === PAGINATION ===

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredPharmacies.length / pharmaciesPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            ← Précédent
        </button>
    `;

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

    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Suivant →
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredPharmacies.length / pharmaciesPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderPharmaciesTable();
    renderPagination();

    document.getElementById('pharmaciesTable')?.scrollIntoView({ behavior: 'smooth' });
}

// === UTILITY FUNCTIONS ===

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateResultsCount() {
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = `${filteredPharmacies.length} pharmacie${filteredPharmacies.length > 1 ? 's' : ''}`;
    }
}

function showLoading(show) {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    loadPharmacies();

    // Event listeners
    document.getElementById('searchPharmacies')?.addEventListener('input', searchPharmacies);
    document.getElementById('filterCity')?.addEventListener('change', filterByCity);
    document.getElementById('filterServices')?.addEventListener('change', filterByServices);
    document.getElementById('filterStatus')?.addEventListener('change', filterByStatus);
    document.getElementById('userSelectionType')?.addEventListener('change', toggleUserSelection);
    document.getElementById('createPharmacyForm')?.addEventListener('submit', createPharmacy);
    document.getElementById('editPharmacyForm')?.addEventListener('submit', savePharmacyChanges);
});

console.log('💊 Super Admin Pharmacies Management loaded');
