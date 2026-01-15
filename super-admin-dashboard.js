// ========================================
// SUPER ADMIN DASHBOARD - USER MANAGEMENT & STATISTICS
// ========================================

let currentEditingUserId = null;
let registrationsChart = null;
let roleDistributionChart = null;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const session = requireSuperAdminAuth();
    if (!session) return;

    // Set admin name
    document.getElementById('adminName').textContent = session.adminName;

    // Load data
    loadStatistics();
    loadUsers();

    // Setup event listeners
    setupEventListeners();

    // Update time
    updateTime();
    setInterval(updateTime, 1000);
});

// === SETUP EVENT LISTENERS ===
function setupEventListeners() {
    // Navigation between sections
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Search
    document.getElementById('searchUsers').addEventListener('input', applyFilters);

    // Filters
    document.getElementById('roleFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    // Add user button
    document.getElementById('addUserBtn').addEventListener('click', openAddUserModal);

    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Form submit
    document.getElementById('userForm').addEventListener('submit', handleUserFormSubmit);

    // Close modal on outside click
    document.getElementById('userModal').addEventListener('click', (e) => {
        if (e.target.id === 'userModal') {
            closeModal();
        }
    });

    // Stats period filter
    const statsPeriodSelect = document.getElementById('statsPeriod');
    if (statsPeriodSelect) {
        statsPeriodSelect.addEventListener('change', () => {
            loadStatisticsSection();
        });
    }
}

// === SECTION NAVIGATION ===
function switchSection(section) {
    // Hide all sections
    const sections = ['usersSection', 'statsSection'];
    sections.forEach(s => {
        const element = document.getElementById(s);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Show selected section
    const sectionElement = document.getElementById(`${section}Section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    // Update navigation active state
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeNav = document.querySelector(`[data-section="${section}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Update header title
    const headerTitle = document.querySelector('.admin-header-left h1');
    const headerSubtitle = document.querySelector('.admin-header-left p');

    if (section === 'stats') {
        headerTitle.textContent = 'Statistiques';
        headerSubtitle.textContent = 'Vue d\'ensemble des activités de la plateforme';
        loadStatisticsSection();
    } else if (section === 'users') {
        headerTitle.textContent = 'Gestion des Utilisateurs';
        headerSubtitle.textContent = 'Gérez tous les utilisateurs de la plateforme';
    } else if (section === 'roles') {
        headerTitle.textContent = 'Rôles & Permissions';
        headerSubtitle.textContent = 'Gérez les rôles et permissions';
    }
}

// === LOAD STATISTICS (for cards) ===
function loadStatistics() {
    const stats = getStatistics();

    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('pharmacyCount').textContent = stats.pharmacies;
    document.getElementById('doctorCount').textContent = stats.doctors;
}

// === LOAD STATISTICS SECTION ===
async function loadStatisticsSection() {
    const period = document.getElementById('statsPeriod').value;

    // Get statistics data
    const stats = getDetailedStatistics(period);

    // Update stat cards
    document.getElementById('statsTotalUsers').textContent = stats.totalUsers;
    document.getElementById('statsPharmacies').textContent = stats.pharmacies.total;
    document.getElementById('statsDoctors').textContent = stats.doctors.total;
    document.getElementById('statsHealthCenters').textContent = stats.healthCenters.total;

    document.getElementById('approvedPharmacies').textContent = stats.pharmacies.approved;
    document.getElementById('pendingPharmacies').textContent = stats.pharmacies.pending;
    document.getElementById('activeDoctors').textContent = stats.doctors.active;
    document.getElementById('approvedHealthCenters').textContent = stats.healthCenters.approved;

    // Update trend
    const trendElement = document.getElementById('usersTrend');
    const trendPercent = stats.usersTrend;
    const trendIcon = trendPercent >= 0 ? '↑' : '↓';
    const trendColor = trendPercent >= 0 ? '#10b981' : '#ef4444';
    trendElement.style.color = trendColor;
    trendElement.innerHTML = `<span>${trendIcon} ${Math.abs(trendPercent)}%</span> vs période précédente`;

    // Create charts
    createRegistrationsChart(stats.registrations);
    createRoleDistributionChart(stats.roleDistribution);

    // Load recent activity
    loadRecentActivity();
}

// === CREATE REGISTRATIONS CHART ===
function createRegistrationsChart(data) {
    const ctx = document.getElementById('registrationsChart');
    if (!ctx) return;

    // Destroy existing chart
    if (registrationsChart) {
        registrationsChart.destroy();
    }

    registrationsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Nouvelles inscriptions',
                data: data.values,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// === CREATE ROLE DISTRIBUTION CHART ===
function createRoleDistributionChart(data) {
    const ctx = document.getElementById('roleDistributionChart');
    if (!ctx) return;

    // Destroy existing chart
    if (roleDistributionChart) {
        roleDistributionChart.destroy();
    }

    roleDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#3b82f6',
                    '#f59e0b',
                    '#8b5cf6',
                    '#10b981',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// === LOAD RECENT ACTIVITY ===
function loadRecentActivity() {
    const activities = getRecentActivity();
    const tbody = document.getElementById('recentActivityTable');

    if (!tbody) return;

    tbody.innerHTML = '';

    activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${activity.user}</strong></td>
            <td>${activity.action}</td>
            <td><span class="role-badge role-${activity.type}">${activity.type}</span></td>
            <td>${formatDateTime(activity.date)}</td>
        `;
        tbody.appendChild(row);
    });
}

// === GET DETAILED STATISTICS ===
function getDetailedStatistics(period) {
    const users = getUsers();
    const pharmacies = getPharmacies();
    const doctors = getDoctors();
    const healthCenters = getHealthCenters();

    // Calculate registrations over time
    const now = new Date();
    const daysAgo = parseInt(period);
    const registrations = {
        labels: [],
        values: []
    };

    for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        registrations.labels.push(dateStr);

        // Count users registered on this day (simulated)
        const count = Math.floor(Math.random() * 5);
        registrations.values.push(count);
    }

    // Calculate role distribution
    const roleCounts = {};
    users.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    const roleDistribution = {
        labels: Object.keys(roleCounts).map(role => getRoleLabel(role)),
        values: Object.values(roleCounts)
    };

    // Calculate trend
    const previousPeriodUsers = Math.max(1, users.length - Math.floor(Math.random() * 10));
    const usersTrend = Math.round(((users.length - previousPeriodUsers) / previousPeriodUsers) * 100);

    return {
        totalUsers: users.length,
        pharmacies: {
            total: pharmacies.length,
            approved: pharmacies.filter(p => p.status === 'approved').length,
            pending: pharmacies.filter(p => p.status === 'pending').length
        },
        doctors: {
            total: doctors.length,
            active: doctors.filter(d => d.status === 'active').length
        },
        healthCenters: {
            total: healthCenters.length,
            approved: healthCenters.filter(h => h.status === 'approved').length
        },
        usersTrend,
        registrations,
        roleDistribution
    };
}

// === GET RECENT ACTIVITY ===
function getRecentActivity() {
    return [
        {
            user: 'Dr. Amadou Diallo',
            action: 'Nouvelle inscription',
            type: 'doctor',
            date: new Date(Date.now() - 1000 * 60 * 15)
        },
        {
            user: 'Pharmacie Sabo',
            action: 'Profil mis à jour',
            type: 'pharmacy',
            date: new Date(Date.now() - 1000 * 60 * 45)
        },
        {
            user: 'Centre de Santé Niamey',
            action: 'Nouvelle inscription',
            type: 'health_center',
            date: new Date(Date.now() - 1000 * 60 * 120)
        },
        {
            user: 'Fatima Ibrahim',
            action: 'Compte activé',
            type: 'patient',
            date: new Date(Date.now() - 1000 * 60 * 180)
        },
        {
            user: 'Pharmacie Air',
            action: 'Approuvée',
            type: 'pharmacy',
            date: new Date(Date.now() - 1000 * 60 * 240)
        }
    ];
}

// === DUMMY DATA GETTERS ===
function getPharmacies() {
    return [
        { id: 1, name: 'Pharmacie Sabo', status: 'approved' },
        { id: 2, name: 'Pharmacie Air', status: 'approved' },
        { id: 3, name: 'Pharmacie Ar-Rahma', status: 'pending' }
    ];
}

function getDoctors() {
    return [
        { id: 1, name: 'Dr. Amadou', status: 'active' },
        { id: 2, name: 'Dr. Fatouma', status: 'active' }
    ];
}

function getHealthCenters() {
    return [
        { id: 1, name: 'Centre Niamey', status: 'approved' },
        { id: 2, name: 'Centre Dosso', status: 'approved' }
    ];
}

// === LOAD USERS ===
function loadUsers(filters = {}) {
    let users = getUsers();

    // Apply filters
    if (filters.role && filters.role !== 'all') {
        users = users.filter(u => u.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
        users = users.filter(u => u.status === filters.status);
    }

    if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
    }

    // Render table
    renderUsersTable(users);
}

// === RENDER USERS TABLE ===
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td><span class="role-badge role-${user.role}">${getRoleLabel(user.role)}</span></td>
            <td><span class="user-status-${user.status}">${user.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}</td>
            <td>
                <div class="admin-table-actions">
                    <button class="admin-action-btn" onclick="editUser(${user.id})" title="Modifier">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="admin-action-btn" onclick="toggleStatus(${user.id})" title="${user.status === 'active' ? 'Désactiver' : 'Activer'}">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                            ${user.status === 'active' ? '<path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>' : ''}
                        </svg>
                    </button>
                    <button class="admin-action-btn admin-action-delete" onclick="deleteUserConfirm(${user.id})" title="Supprimer">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// === APPLY FILTERS ===
function applyFilters() {
    const filters = {
        search: document.getElementById('searchUsers').value,
        role: document.getElementById('roleFilter').value,
        status: document.getElementById('statusFilter').value
    };
    loadUsers(filters);
}

// === MODAL FUNCTIONS ===
function openAddUserModal() {
    currentEditingUserId = null;
    document.getElementById('modalTitle').textContent = 'Nouvel utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('active');
}

function openEditUserModal(user) {
    currentEditingUserId = user.id;
    document.getElementById('modalTitle').textContent = 'Modifier l\'utilisateur';
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userModal').classList.add('active');
}

function closeModal() {
    document.getElementById('userModal').classList.remove('active');
    currentEditingUserId = null;
}

// === USER ACTIONS ===
function editUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        openEditUserModal(user);
    }
}

function toggleStatus(userId) {
    const user = toggleUserStatus(userId);
    if (user) {
        loadStatistics();
        applyFilters();
    }
}

function deleteUserConfirm(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        deleteUser(userId);
        loadStatistics();
        applyFilters();
    }
}

// === FORM SUBMIT ===
function handleUserFormSubmit(e) {
    e.preventDefault();

    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };

    if (currentEditingUserId) {
        // Update existing user
        updateUser(currentEditingUserId, userData);
    } else {
        // Create new user
        createUser(userData);
    }

    closeModal();
    loadStatistics();
    applyFilters();
}

// === UTILITY FUNCTIONS ===
function getRoleLabel(role) {
    const labels = {
        'super_admin': 'Super Admin',
        'admin_support': 'Admin Support',
        'admin_moderator': 'Admin Modérateur',
        'pharmacy': 'Pharmacien',
        'doctor': 'Médecin',
        'patient': 'Patient',
        'health_center': 'Centre de Santé'
    };
    return labels[role] || role;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function formatDateTime(date) {
    if (!date) return '-';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentTime').innerHTML = `
        <div>${timeString}</div>
        <div style="font-size: 0.75rem; opacity: 0.7;">${dateString}</div>
    `;
}

// Make functions globally accessible
window.editUser = editUser;
window.toggleStatus = toggleStatus;
window.deleteUserConfirm = deleteUserConfirm;

console.log('🎯 Super Admin Dashboard initialized');
