// ========================================
// SUPER ADMIN - GESTION DES MÉDECINS
// Module JavaScript
// ========================================

// === GLOBAL VARIABLES ===
let allDoctors = [];
let filteredDoctors = [];
let currentPage = 1;
let doctorsPerPage = 20;
let currentFilters = {
    search: '',
    specialty: 'all',
    status: 'all',
    verified: 'all'
};
let currentEditingDoctorId = null;

// === LOAD DOCTORS ===
async function loadDoctors() {
    showLoading(true);
    try {
        const { data, error } = await supabase
            .from('doctors')
            .select(`
                *,
                users!inner(id, email, role, is_active)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allDoctors = data || [];
        applyFilters();
        updateStatistics();

        console.log('✅ Médecins chargés:', allDoctors.length);
    } catch (error) {
        console.error('Erreur chargement médecins:', error);
        showError('Erreur lors du chargement des médecins');
    } finally {
        showLoading(false);
    }
}

// === APPLY FILTERS ===
function applyFilters() {
    filteredDoctors = allDoctors.filter(doctor => {
        // Search filter
        if (currentFilters.search) {
            const searchLower = currentFilters.search.toLowerCase();
            const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
            const license = (doctor.license_number || '').toLowerCase();
            const specialties = Array.isArray(doctor.specialties)
                ? doctor.specialties.join(' ').toLowerCase()
                : '';

            if (!fullName.includes(searchLower) &&
                !license.includes(searchLower) &&
                !specialties.includes(searchLower)) {
                return false;
            }
        }

        // Specialty filter
        if (currentFilters.specialty !== 'all') {
            const specialties = Array.isArray(doctor.specialties) ? doctor.specialties : [];
            if (!specialties.includes(currentFilters.specialty)) {
                return false;
            }
        }

        // Status filter
        if (currentFilters.status !== 'all') {
            const isActive = currentFilters.status === 'active';
            if (doctor.is_active !== isActive) {
                return false;
            }
        }

        // Verified filter
        if (currentFilters.verified !== 'all') {
            const isVerified = currentFilters.verified === 'verified';
            if (doctor.is_verified !== isVerified) {
                return false;
            }
        }

        return true;
    });

    currentPage = 1;
    renderDoctorsTable();
    renderPagination();
    updateResultsCount();
}

// === RENDER DOCTORS TABLE ===
function renderDoctorsTable() {
    const tbody = document.getElementById('doctorsTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;
    const doctorsToShow = filteredDoctors.slice(startIndex, endIndex);

    if (doctorsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #6B7280;">
                    Aucun médecin trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = doctorsToShow.map(doctor => {
        const fullName = `${doctor.first_name} ${doctor.last_name}`;
        const initials = `${doctor.first_name[0]}${doctor.last_name[0]}`.toUpperCase();
        const specialties = Array.isArray(doctor.specialties) ? doctor.specialties : [];
        const userEmail = doctor.users?.email || 'N/A';
        const experience = doctor.years_of_experience || 0;

        return `
            <tr>
                <td>
                    <div class="doctor-info">
                        <div class="doctor-avatar">${initials}</div>
                        <div class="doctor-details">
                            <div class="doctor-name">${fullName}</div>
                            <div class="doctor-license">${doctor.license_number || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    ${specialties.slice(0, 2).map(s => {
            const specialty = window.Specialties?.getSpecialtyByValue(s);
            return `<span class="specialty-badge">${specialty?.label || s}</span>`;
        }).join('')}
                    ${specialties.length > 2 ? `<span class="specialty-badge">+${specialties.length - 2}</span>` : ''}
                </td>
                <td>${doctor.license_number || 'N/A'}</td>
                <td>${userEmail}</td>
                <td>${experience} an${experience > 1 ? 's' : ''}</td>
                <td>
                    <span class="status-badge ${doctor.is_verified ? 'verified' : 'not-verified'}">
                        ${doctor.is_verified ? '✓ Vérifié' : '✗ Non vérifié'}
                    </span>
                    <span class="status-badge ${doctor.is_active ? 'active' : 'inactive'}">
                        ${doctor.is_active ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editDoctor('${doctor.id}')" class="btn-icon" title="Éditer">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        ${!doctor.is_verified ? `
                            <button onclick="verifyDoctor('${doctor.id}')" class="btn-icon" title="Vérifier" style="color: #10B981;">
                                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        ` : `
                            <button onclick="revokeVerification('${doctor.id}')" class="btn-icon" title="Révoquer vérification" style="color: #F59E0B;">
                                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        `}
                        <button onclick="toggleDoctorStatus('${doctor.id}', ${!doctor.is_active})" class="btn-icon" title="${doctor.is_active ? 'Désactiver' : 'Activer'}" style="color: ${doctor.is_active ? '#EF4444' : '#10B981'};">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button onclick="confirmDeleteDoctor('${doctor.id}', '${fullName}')" class="btn-icon" title="Supprimer" style="color: #EF4444;">
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

// === CREATE DOCTOR ===
function openCreateDoctorModal() {
    const modal = document.getElementById('createDoctorModal');
    modal.style.display = 'flex';

    // Load available users
    loadAvailableUsers();

    // Populate specialty select
    const specialtySelect = document.getElementById('doctorSpecialty');
    if (window.Specialties && specialtySelect) {
        window.Specialties.renderSpecialtySelect(specialtySelect);
    }

    // Reset form
    document.getElementById('createDoctorForm').reset();
    document.getElementById('userSelectionType').value = 'existing';
    toggleUserSelection();
}

async function loadAvailableUsers() {
    try {
        // Load users without doctor role or users with doctor role but no doctor entry
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, role')
            .or('role.neq.doctor,role.is.null')
            .eq('is_active', true)
            .order('email');

        if (error) throw error;

        const select = document.getElementById('existingUserId');
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner un utilisateur</option>' +
            users.map(u => `<option value="${u.id}">${u.email}</option>`).join('');
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
    }
}

function toggleUserSelection() {
    const type = document.getElementById('userSelectionType').value;
    const existingSection = document.getElementById('existingUserSection');
    const newSection = document.getElementById('newUserSection');

    if (type === 'existing') {
        existingSection.style.display = 'block';
        newSection.style.display = 'none';
    } else {
        existingSection.style.display = 'none';
        newSection.style.display = 'block';
    }
}

async function createDoctor(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const type = document.getElementById('userSelectionType').value;
        let userId;

        // Get or create user
        if (type === 'existing') {
            userId = document.getElementById('existingUserId').value;
            if (!userId) {
                throw new Error('Veuillez sélectionner un utilisateur');
            }
        } else {
            const email = document.getElementById('newUserEmail').value;
            const password = document.getElementById('newUserPassword').value;

            if (!email || !password) {
                throw new Error('Email et mot de passe requis');
            }

            // Create new user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;
            userId = authData.user.id;
        }

        // Get form data
        const firstName = document.getElementById('doctorFirstName').value;
        const lastName = document.getElementById('doctorLastName').value;
        const gender = document.getElementById('doctorGender').value || null;
        const dateOfBirth = document.getElementById('doctorDateOfBirth').value || null;
        const license = document.getElementById('doctorLicense').value;
        const specialty = document.getElementById('doctorSpecialty').value;
        const experience = parseInt(document.getElementById('doctorExperience').value) || 0;
        const fee = parseFloat(document.getElementById('doctorFee').value) || null;
        const duration = parseInt(document.getElementById('doctorDuration').value) || 30;
        const acceptsNew = document.getElementById('doctorAcceptsNewPatients').checked;

        // Create doctor
        const { data, error } = await supabase
            .from('doctors')
            .insert([{
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                gender: gender,
                date_of_birth: dateOfBirth,
                license_number: license,
                specialties: [specialty],
                years_of_experience: experience,
                consultation_fee: fee,
                consultation_duration: duration,
                accepts_new_patients: acceptsNew,
                is_active: true,
                is_verified: false
            }])
            .select();

        if (error) throw error;

        showSuccess('Médecin créé avec succès');
        closeCreateDoctorModal();
        loadDoctors();
    } catch (error) {
        console.error('Erreur création médecin:', error);
        showError(error.message || 'Erreur lors de la création du médecin');
    } finally {
        showLoading(false);
    }
}

function closeCreateDoctorModal() {
    document.getElementById('createDoctorModal').style.display = 'none';
}

// === EDIT DOCTOR ===
async function editDoctor(doctorId) {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (!doctor) return;

    currentEditingDoctorId = doctorId;

    // Populate form
    document.getElementById('editDoctorId').value = doctorId;
    document.getElementById('editDoctorFirstName').value = doctor.first_name || '';
    document.getElementById('editDoctorLastName').value = doctor.last_name || '';
    document.getElementById('editDoctorGender').value = doctor.gender || '';
    document.getElementById('editDoctorDateOfBirth').value = doctor.date_of_birth || '';
    document.getElementById('editDoctorLicense').value = doctor.license_number || '';
    document.getElementById('editDoctorExperience').value = doctor.years_of_experience || 0;
    document.getElementById('editDoctorFee').value = doctor.consultation_fee || '';
    document.getElementById('editDoctorDuration').value = doctor.consultation_duration || 30;
    document.getElementById('editDoctorAcceptsNewPatients').checked = doctor.accepts_new_patients || false;

    // Populate specialty
    const specialtySelect = document.getElementById('editDoctorSpecialty');
    if (window.Specialties && specialtySelect) {
        const mainSpecialty = Array.isArray(doctor.specialties) && doctor.specialties.length > 0
            ? doctor.specialties[0]
            : '';
        window.Specialties.renderSpecialtySelect(specialtySelect, mainSpecialty);
    }

    // Show modal
    document.getElementById('editDoctorModal').style.display = 'flex';
}

async function saveDoctorChanges(event) {
    event.preventDefault();
    showLoading(true);

    try {
        const doctorId = document.getElementById('editDoctorId').value;

        const updates = {
            first_name: document.getElementById('editDoctorFirstName').value,
            last_name: document.getElementById('editDoctorLastName').value,
            gender: document.getElementById('editDoctorGender').value || null,
            date_of_birth: document.getElementById('editDoctorDateOfBirth').value || null,
            license_number: document.getElementById('editDoctorLicense').value,
            specialties: [document.getElementById('editDoctorSpecialty').value],
            years_of_experience: parseInt(document.getElementById('editDoctorExperience').value) || 0,
            consultation_fee: parseFloat(document.getElementById('editDoctorFee').value) || null,
            consultation_duration: parseInt(document.getElementById('editDoctorDuration').value) || 30,
            accepts_new_patients: document.getElementById('editDoctorAcceptsNewPatients').checked
        };

        const { error } = await supabase
            .from('doctors')
            .update(updates)
            .eq('id', doctorId);

        if (error) throw error;

        showSuccess('Médecin modifié avec succès');
        closeEditDoctorModal();
        loadDoctors();
    } catch (error) {
        console.error('Erreur modification médecin:', error);
        showError(error.message || 'Erreur lors de la modification');
    } finally {
        showLoading(false);
    }
}

function closeEditDoctorModal() {
    document.getElementById('editDoctorModal').style.display = 'none';
    currentEditingDoctorId = null;
}

// === VERIFY DOCTOR ===
async function verifyDoctor(doctorId) {
    if (!confirm('Voulez-vous vérifier ce médecin ?')) return;

    showLoading(true);
    try {
        const { data: currentUser } = await supabase.auth.getUser();

        const { error } = await supabase.rpc('verify_doctor', {
            p_doctor_id: doctorId,
            p_admin_id: currentUser.user.id
        });

        if (error) throw error;

        showSuccess('Médecin vérifié avec succès');
        loadDoctors();
    } catch (error) {
        console.error('Erreur vérification:', error);
        showError(error.message || 'Erreur lors de la vérification');
    } finally {
        showLoading(false);
    }
}

async function revokeVerification(doctorId) {
    if (!confirm('Voulez-vous révoquer la vérification de ce médecin ?')) return;

    showLoading(true);
    try {
        const { data: currentUser } = await supabase.auth.getUser();

        const { error } = await supabase.rpc('revoke_doctor_verification', {
            p_doctor_id: doctorId,
            p_admin_id: currentUser.user.id
        });

        if (error) throw error;

        showSuccess('Vérification révoquée');
        loadDoctors();
    } catch (error) {
        console.error('Erreur révocation:', error);
        showError(error.message || 'Erreur lors de la révocation');
    } finally {
        showLoading(false);
    }
}

// === TOGGLE STATUS ===
async function toggleDoctorStatus(doctorId, newStatus) {
    showLoading(true);
    try {
        const { data: currentUser } = await supabase.auth.getUser();

        const { error } = await supabase.rpc('toggle_doctor_status', {
            p_doctor_id: doctorId,
            p_is_active: newStatus,
            p_admin_id: currentUser.user.id
        });

        if (error) throw error;

        showSuccess(`Médecin ${newStatus ? 'activé' : 'désactivé'} avec succès`);
        loadDoctors();
    } catch (error) {
        console.error('Erreur changement statut:', error);
        showError(error.message || 'Erreur lors du changement de statut');
    } finally {
        showLoading(false);
    }
}

// === DELETE DOCTOR ===
function confirmDeleteDoctor(doctorId, doctorName) {
    currentEditingDoctorId = doctorId;
    document.getElementById('deleteDoctorName').textContent = doctorName;
    document.getElementById('deleteDoctorModal').style.display = 'flex';

    document.getElementById('confirmDeleteDoctorBtn').onclick = () => deleteDoctor(doctorId);
}

async function deleteDoctor(doctorId) {
    showLoading(true);
    try {
        const { error } = await supabase
            .from('doctors')
            .delete()
            .eq('id', doctorId);

        if (error) throw error;

        showSuccess('Médecin supprimé avec succès');
        closeDeleteDoctorModal();
        loadDoctors();
    } catch (error) {
        console.error('Erreur suppression:', error);
        showError(error.message || 'Erreur lors de la suppression');
    } finally {
        showLoading(false);
    }
}

function closeDeleteDoctorModal() {
    document.getElementById('deleteDoctorModal').style.display = 'none';
    currentEditingDoctorId = null;
}

// === SEARCH & FILTERS ===
function searchDoctors() {
    currentFilters.search = document.getElementById('searchDoctors').value;
    applyFilters();
}

function filterBySpecialty() {
    currentFilters.specialty = document.getElementById('filterSpecialty').value;
    applyFilters();
}

function filterByStatus() {
    currentFilters.status = document.getElementById('filterStatus').value;
    applyFilters();
}

function filterByVerified() {
    currentFilters.verified = document.getElementById('filterVerified').value;
    applyFilters();
}

// === STATISTICS ===
function updateStatistics() {
    const total = allDoctors.length;
    const verified = allDoctors.filter(d => d.is_verified).length;
    const active = allDoctors.filter(d => d.is_active).length;
    const accepting = allDoctors.filter(d => d.accepts_new_patients).length;

    document.getElementById('totalDoctors').textContent = total;
    document.getElementById('verifiedDoctors').textContent = verified;
    document.getElementById('activeDoctors').textContent = active;
    document.getElementById('acceptingDoctors').textContent = accepting;
}

// === PAGINATION ===
function renderPagination() {
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';

    // Previous button
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Précédent</button>`;

    // Page numbers
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (totalPages > 5) {
        html += '<span>...</span>';
        html += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Suivant</button>`;

    html += '</div>';
    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderDoctorsTable();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === UTILITY FUNCTIONS ===
function updateResultsCount() {
    const count = filteredDoctors.length;
    const total = allDoctors.length;
    document.getElementById('resultsCount').textContent =
        `${count} médecin${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''} sur ${total}`;
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
    loadDoctors();

    // Populate specialty filter
    if (window.Specialties) {
        const filterSelect = document.getElementById('filterSpecialty');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">Toutes les spécialités</option>';
            window.Specialties.MEDICAL_SPECIALTIES.forEach(s => {
                filterSelect.innerHTML += `<option value="${s.value}">${s.label}</option>`;
            });
        }
    }

    // Event listeners
    document.getElementById('searchDoctors')?.addEventListener('input', searchDoctors);
    document.getElementById('filterSpecialty')?.addEventListener('change', filterBySpecialty);
    document.getElementById('filterStatus')?.addEventListener('change', filterByStatus);
    document.getElementById('filterVerified')?.addEventListener('change', filterByVerified);
    document.getElementById('createDoctorForm')?.addEventListener('submit', createDoctor);
    document.getElementById('editDoctorForm')?.addEventListener('submit', saveDoctorChanges);
});

console.log('👨‍⚕️ Super Admin Doctor Management loaded');
