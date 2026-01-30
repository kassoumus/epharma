// ========================================
// SUPER ADMIN - GESTION DES CENTRES DE SANTÉ
// Module JavaScript
// ========================================

// === GLOBAL VARIABLES ===
let allHealthCenters = [];
let filteredHealthCenters = [];
let currentPage = 1;
let healthCentersPerPage = 20;
let currentFilters = {
    search: '',
    type: 'all',
    city: 'all',
    status: 'all',
    approved: 'all'
};
let currentEditingCenterId = null;

// === TYPE LABELS ===
const TYPE_LABELS = {
    'hospital': 'Hôpital',
    'clinic': 'Clinique',
    'community_health_center': 'Centre Communautaire',
    'specialized_center': 'Centre Spécialisé',
    'maternity': 'Maternité',
    'dispensary': 'Dispensaire'
};

// === LOAD HEALTH CENTERS ===
async function loadHealthCenters() {
    showLoading(true);
    try {
        const { data, error } = await supabase
            .from('health_centers')
            .select(`
                *,
                users!manager_id(id, email, role, is_active)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allHealthCenters = data || [];
        applyFilters();
        updateStatistics();

        console.log('✅ Centres de santé chargés:', allHealthCenters.length);
    } catch (error) {
        console.error('Erreur chargement centres:', error);
        showError('Erreur lors du chargement des centres de santé');
    } finally {
        showLoading(false);
    }
}

// === APPLY FILTERS ===
function applyFilters() {
    filteredHealthCenters = allHealthCenters.filter(center => {
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const name = (center.name || '').toLowerCase();
            const city = (center.city || '').toLowerCase();
            const type = TYPE_LABELS[center.type]?.toLowerCase() || '';

            if (!name.includes(searchLower) &&
                !city.includes(searchLower) &&
                !type.includes(searchLower)) {
                return false;
            }
        }

        // Type filter
        if (currentFilters.type !== 'all' && center.type !== currentFilters.type) {
            return false;
        }

        // City filter
        if (currentFilters.city !== 'all' && center.city !== currentFilters.city) {
            return false;
        }

        // Status filter
        if (currentFilters.status !== 'all') {
            const isActive = currentFilters.status === 'active';
            if (center.is_active !== isActive) {
                return false;
            }
        }

        // Approved filter
        if (currentFilters.approved !== 'all') {
            const isApproved = currentFilters.approved === 'approved';
            if (center.is_approved !== isApproved) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderHealthCentersTable();
    renderPagination();
    updateResultsCount();
}

// === RENDER HEALTH CENTERS TABLE ===
function renderHealthCentersTable() {
    const tbody = document.getElementById('healthCentersTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * healthCentersPerPage;
    const endIndex = startIndex + healthCentersPerPage;
    const centersToShow = filteredHealthCenters.slice(startIndex, endIndex);

    if (centersToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #6B7280;">
                    Aucun centre de santé trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = centersToShow.map(center => {
        const typeLabel = TYPE_LABELS[center.type] || center.type;
        const managerEmail = center.users?.email || 'N/A';
        const bedCapacity = center.bed_capacity || 0;

        // Equipment badges
        const equipment = [];
        if (center.has_emergency) equipment.push('🚑 Urgences');
        if (center.has_ambulance) equipment.push('🚑 Ambulance');
        if (center.has_laboratory) equipment.push('🔬 Labo');
        if (center.has_pharmacy) equipment.push('💊 Pharmacie');
        if (center.has_radiology) equipment.push('📡 Radio');

        return `
            <tr>
                <td>
                    <div style="font-weight: 600; color: #111827;">${center.name}</div>
                    <div style="font-size: 12px; color: #6B7280;">${center.address}</div>
                </td>
                <td><span class="type-badge">${typeLabel}</span></td>
                <td>${center.city}</td>
                <td>${bedCapacity} lit${bedCapacity > 1 ? 's' : ''}</td>
                <td>
                    ${equipment.slice(0, 3).map(e => `<span class="equipment-badge">${e}</span>`).join('')}
                    ${equipment.length > 3 ? `<span class="equipment-badge">+${equipment.length - 3}</span>` : ''}
                </td>
                <td>${managerEmail}</td>
                <td>
                    <span class="status-badge ${center.is_approved ? 'approved' : 'not-approved'}">
                        ${center.is_approved ? '✓ Approuvé' : '✗ Non approuvé'}
                    </span>
                    <span class="status-badge ${center.is_active ? 'active' : 'inactive'}">
                        ${center.is_active ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editHealthCenter('${center.id}')" class="btn-icon" title="Éditer">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        ${!center.is_approved ? `
                            <button onclick="approveHealthCenter('${center.id}')" class="btn-icon" title="Approuver" style="color: #10B981;">
                                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button onclick="toggleHealthCenterStatus('${center.id}', ${!center.is_active})" class="btn-icon" title="${center.is_active ? 'Désactiver' : 'Activer'}" style="color: ${center.is_active ? '#EF4444' : '#10B981'};">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button onclick="confirmDeleteHealthCenter('${center.id}', '${center.name.replace(/'/g, "\\'")}'))" class="btn-icon" title="Supprimer" style="color: #EF4444;">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// === CREATE HEALTH CENTER ===
function openCreateHealthCenterModal() {
    const modal = document.getElementById('createHealthCenterModal');
    modal.style.display = 'flex';

    loadAvailableManagers();
    document.getElementById('createHealthCenterForm').reset();
    document.getElementById('managerSelectionType').value = 'existing';
    toggleManagerSelection();
}

async function loadAvailableManagers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, role')
            .or('role.eq.user,role.eq.health_center_admin')
            .eq('is_active', true)
            .order('email');

        if (error) throw error;

        const select = document.getElementById('existingManagerId');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un utilisateur</option>' +
            users.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
    }
}

function toggleManagerSelection() {
    const type = document.getElementById('managerSelectionType').value;
    const existingSection = document.getElementById('existingManagerSection');
    const newSection = document.getElementById('newManagerSection');

    if (type === 'existing') {
        existingSection.style.display = 'block';
        newSection.style.display = 'none';
    } else {
        existingSection.style.display = 'none';
        newSection.style.display = 'block';
    }
}

async function createHealthCenter(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const type = document.getElementById('managerSelectionType').value;
        let managerId = null;

        // Get or create manager
        if (type === 'existing') {
            managerId = document.getElementById('existingManagerId').value || null;
        } else {
            const email = document.getElementById('newManagerEmail').value;
            const password = document.getElementById('newManagerPassword').value;

            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;
            managerId = authData.user.id;
        }

        // Get form data
        const name = document.getElementById('centerName').value;
        const centerType = document.getElementById('centerType').value;
        const city = document.getElementById('centerCity').value;
        const address = document.getElementById('centerAddress').value;
        const phone = document.getElementById('centerPhone').value;
        const email = document.getElementById('centerEmail').value || null;
        const hasEmergency = document.getElementById('centerEmergency').checked;
        const hasAmbulance = document.getElementById('centerAmbulance').checked;
        const hasLaboratory = document.getElementById('centerLaboratory').checked;
        const hasPharmacy = document.getElementById('centerPharmacy').checked;
        const hasRadiology = document.getElementById('centerRadiology').checked;
        const bedCapacity = parseInt(document.getElementById('centerBedCapacity').value) || 0;
        const icuBeds = parseInt(document.getElementById('centerIcuBeds').value) || 0;

        // Create health center
        const { data, error } = await supabase
            .from('health_centers')
            .insert([{
                manager_id: managerId,
                name: name,
                type: centerType,
                address: address,
                city: city,
                phone: phone,
                email: email,
                has_emergency: hasEmergency,
                has_ambulance: hasAmbulance,
                has_laboratory: hasLaboratory,
                has_pharmacy: hasPharmacy,
                has_radiology: hasRadiology,
                bed_capacity: bedCapacity,
                icu_beds: icuBeds,
                is_active: true,
                is_approved: false
            }])
            .select();

        if (error) throw error;

        showSuccess('Centre de santé créé avec succès');
        closeCreateHealthCenterModal();
        loadHealthCenters();
    } catch (error) {
        console.error('Erreur création centre:', error);
        showError(error.message || 'Erreur lors de la création du centre');
    } finally {
        showLoading(false);
    }
}

function closeCreateHealthCenterModal() {
    document.getElementById('createHealthCenterModal').style.display = 'none';
}

// === EDIT HEALTH CENTER ===
async function editHealthCenter(centerId) {
    const center = allHealthCenters.find(c => c.id === centerId);
    if (!center) return;

    currentEditingCenterId = centerId;

    // Populate form
    document.getElementById('editCenterId').value = centerId;
    document.getElementById('editCenterName').value = center.name || '';
    document.getElementById('editCenterType').value = center.type || '';
    document.getElementById('editCenterCity').value = center.city || '';
    document.getElementById('editCenterAddress').value = center.address || '';
    document.getElementById('editCenterPhone').value = center.phone || '';
    document.getElementById('editCenterEmail').value = center.email || '';
    document.getElementById('editCenterEmergency').checked = center.has_emergency || false;
    document.getElementById('editCenterAmbulance').checked = center.has_ambulance || false;
    document.getElementById('editCenterLaboratory').checked = center.has_laboratory || false;
    document.getElementById('editCenterPharmacy').checked = center.has_pharmacy || false;
    document.getElementById('editCenterRadiology').checked = center.has_radiology || false;
    document.getElementById('editCenterBedCapacity').value = center.bed_capacity || 0;
    document.getElementById('editCenterIcuBeds').value = center.icu_beds || 0;

    // Show modal
    document.getElementById('editHealthCenterModal').style.display = 'flex';
}

async function saveHealthCenterChanges(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const centerId = document.getElementById('editCenterId').value;

        const updates = {
            name: document.getElementById('editCenterName').value,
            type: document.getElementById('editCenterType').value,
            city: document.getElementById('editCenterCity').value,
            address: document.getElementById('editCenterAddress').value,
            phone: document.getElementById('editCenterPhone').value,
            email: document.getElementById('editCenterEmail').value || null,
            has_emergency: document.getElementById('editCenterEmergency').checked,
            has_ambulance: document.getElementById('editCenterAmbulance').checked,
            has_laboratory: document.getElementById('editCenterLaboratory').checked,
            has_pharmacy: document.getElementById('editCenterPharmacy').checked,
            has_radiology: document.getElementById('editCenterRadiology').checked,
            bed_capacity: parseInt(document.getElementById('editCenterBedCapacity').value) || 0,
            icu_beds: parseInt(document.getElementById('editCenterIcuBeds').value) || 0
        };

        const { error } = await supabase
            .from('health_centers')
            .update(updates)
            .eq('id', centerId);

        if (error) throw error;

        showSuccess('Centre modifié avec succès');
        closeEditHealthCenterModal();
        loadHealthCenters();
    } catch (error) {
        console.error('Erreur modification centre:', error);
        showError(error.message || 'Erreur lors de la modification');
    } finally {
        showLoading(false);
    }
}

function closeEditHealthCenterModal() {
    document.getElementById('editHealthCenterModal').style.display = 'none';
    currentEditingCenterId = null;
}

// === APPROVE HEALTH CENTER ===
async function approveHealthCenter(centerId) {
    if (!confirm('Voulez-vous approuver ce centre de santé ?')) return;

    showLoading(true);
    try {
        const { data: currentUser } = await supabase.auth.getUser();

        const { error } = await supabase.rpc('approve_health_center', {
            p_health_center_id: centerId,
            p_admin_id: currentUser.user.id
        });

        if (error) throw error;

        showSuccess('Centre approuvé avec succès');
        loadHealthCenters();
    } catch (error) {
        console.error('Erreur approbation:', error);
        showError(error.message || 'Erreur lors de l\'approbation');
    } finally {
        showLoading(false);
    }
}

// === TOGGLE STATUS ===
async function toggleHealthCenterStatus(centerId, newStatus) {
    showLoading(true);
    try {
        const { data: currentUser } = await supabase.auth.getUser();

        const { error } = await supabase.rpc('toggle_health_center_status', {
            p_health_center_id: centerId,
            p_is_active: newStatus,
            p_admin_id: currentUser.user.id
        });

        if (error) throw error;

        showSuccess(`Centre ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        loadHealthCenters();
    } catch (error) {
        console.error('Erreur changement statut:', error);
        showError(error.message || 'Erreur lors du changement de statut');
    } finally {
        showLoading(false);
    }
}

// === DELETE HEALTH CENTER ===
function confirmDeleteHealthCenter(centerId, centerName) {
    currentEditingCenterId = centerId;
    document.getElementById('deleteHealthCenterName').textContent = centerName;
    document.getElementById('deleteHealthCenterModal').style.display = 'flex';

    document.getElementById('confirmDeleteHealthCenterBtn').onclick = () => deleteHealthCenter(centerId);
}

async function deleteHealthCenter(centerId) {
    showLoading(true);
    try {
        const { error } = await supabase
            .from('health_centers')
            .delete()
            .eq('id', centerId);

        if (error) throw error;

        showSuccess('Centre supprimé avec succès');
        closeDeleteHealthCenterModal();
        loadHealthCenters();
    } catch (error) {
        console.error('Erreur suppression:', error);
        showError(error.message || 'Erreur lors de la suppression');
    } finally {
        showLoading(false);
    }
}

function closeDeleteHealthCenterModal() {
    document.getElementById('deleteHealthCenterModal').style.display = 'none';
    currentEditingCenterId = null;
}

// === SEARCH & FILTERS ===
function searchHealthCenters() {
    currentFilters.search = document.getElementById('searchHealthCenters').value;
    applyFilters();
}

function filterByType() {
    currentFilters.type = document.getElementById('filterType').value;
    applyFilters();
}

function filterByCity() {
    currentFilters.city = document.getElementById('filterCity').value;
    applyFilters();
}

function filterByStatus() {
    currentFilters.status = document.getElementById('filterStatus').value;
    applyFilters();
}

function filterByApproved() {
    currentFilters.approved = document.getElementById('filterApproved').value;
    applyFilters();
}

// === STATISTICS ===
function updateStatistics() {
    const total = allHealthCenters.length;
    const approved = allHealthCenters.filter(c => c.is_approved).length;
    const active = allHealthCenters.filter(c => c.is_active).length;
    const emergency = allHealthCenters.filter(c => c.has_emergency).length;

    document.getElementById('totalHealthCenters').textContent = total;
    document.getElementById('approvedHealthCenters').textContent = approved;
    document.getElementById('activeHealthCenters').textContent = active;
    document.getElementById('emergencyHealthCenters').textContent = emergency;
}

// === PAGINATION ===
function renderPagination() {
    const totalPages = Math.ceil(filteredHealthCenters.length / healthCentersPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';

    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Précédent</button>`;

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (totalPages > 5) {
        html += '<span>...</span>';
        html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Suivant</button>`;

    html += '</div>';
    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredHealthCenters.length / healthCentersPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderHealthCentersTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === UTILITY FUNCTIONS ===
function updateResultsCount() {
    const count = filteredHealthCenters.length;
    const total = allHealthCenters.length;
    document.getElementById('resultsCount').textContent =
        `${count} centre${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''} sur ${total}`;
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
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
    loadHealthCenters();

    // Event listeners
    document.getElementById('searchHealthCenters')?.addEventListener('input', searchHealthCenters);
    document.getElementById('filterType')?.addEventListener('change', filterByType);
    document.getElementById('filterCity')?.addEventListener('change', filterByCity);
    document.getElementById('filterStatus')?.addEventListener('change', filterByStatus);
    document.getElementById('filterApproved')?.addEventListener('change', filterByApproved);
    document.getElementById('createHealthCenterForm')?.addEventListener('submit', createHealthCenter);
    document.getElementById('editHealthCenterForm')?.addEventListener('submit', saveHealthCenterChanges);
});

console.log('🏥 Super Admin Health Centers Management loaded');
