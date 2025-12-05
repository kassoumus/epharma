// ========================================
// PERMISSIONS SYSTEM - EPHARMA
// ========================================

// === PERMISSION DEFINITIONS ===
const PERMISSIONS = {
    // User Management
    'users.view': ['super_admin', 'admin_support', 'admin_moderator'],
    'users.create': ['super_admin'],
    'users.edit': ['super_admin', 'admin_moderator'],
    'users.delete': ['super_admin'],
    'users.assign': ['super_admin'],

    // Pharmacy Management
    'pharmacy.view_all': ['super_admin', 'admin_support', 'admin_moderator'],
    'pharmacy.view_own': ['super_admin', 'admin_support', 'admin_moderator', 'pharmacy'],
    'pharmacy.edit_all': ['super_admin'],
    'pharmacy.edit_own': ['super_admin', 'pharmacy'],
    'pharmacy.delete': ['super_admin'],

    // Doctor Management
    'doctor.view_all': ['super_admin', 'admin_support', 'admin_moderator'],
    'doctor.view_own': ['super_admin', 'admin_support', 'admin_moderator', 'doctor'],
    'doctor.edit_all': ['super_admin'],
    'doctor.edit_own': ['super_admin', 'doctor'],
    'doctor.delete': ['super_admin'],

    // Appointments
    'appointments.view_all': ['super_admin', 'admin_support'],
    'appointments.view_own': ['super_admin', 'doctor'],
    'appointments.manage': ['super_admin', 'doctor'],

    // Reservations
    'reservations.view_all': ['super_admin', 'admin_support'],
    'reservations.view_own': ['super_admin', 'pharmacy'],
    'reservations.manage': ['super_admin', 'pharmacy'],

    // System
    'system.settings': ['super_admin'],
    'system.logs': ['super_admin', 'admin_support'],
    'system.backup': ['super_admin']
};

// === ROLE DEFINITIONS ===
const ROLES = {
    super_admin: {
        label: 'Super Administrateur',
        color: '#8b5cf6',
        description: 'Accès complet à toutes les fonctionnalités'
    },
    admin_support: {
        label: 'Admin Support',
        color: '#3b82f6',
        description: 'Lecture seule et assistance utilisateurs'
    },
    admin_moderator: {
        label: 'Admin Modérateur',
        color: '#10b981',
        description: 'Validation et modération du contenu'
    },
    pharmacy: {
        label: 'Pharmacien',
        color: '#6366f1',
        description: 'Gestion de sa pharmacie'
    },
    doctor: {
        label: 'Médecin',
        color: '#f59e0b',
        description: 'Gestion de son cabinet'
    },
    patient: {
        label: 'Patient',
        color: '#8b5cf6',
        description: 'Accès patient'
    }
};

// === PERMISSION CHECKING ===
function hasPermission(userRole, permission) {
    if (!PERMISSIONS[permission]) {
        console.warn(`Permission "${permission}" not defined`);
        return false;
    }

    return PERMISSIONS[permission].includes(userRole);
}

function hasAnyPermission(userRole, permissions) {
    return permissions.some(permission => hasPermission(userRole, permission));
}

function hasAllPermissions(userRole, permissions) {
    return permissions.every(permission => hasPermission(userRole, permission));
}

// === ROLE CHECKING ===
function isAdmin(role) {
    return ['super_admin', 'admin_support', 'admin_moderator'].includes(role);
}

function isSuperAdmin(role) {
    return role === 'super_admin';
}

function canManageUsers(role) {
    return hasPermission(role, 'users.create') || hasPermission(role, 'users.edit');
}

function canViewAllData(role) {
    return hasPermission(role, 'pharmacy.view_all') && hasPermission(role, 'doctor.view_all');
}

// === ACCESS CONTROL ===
function requirePermission(permission) {
    const session = getCurrentSession();
    if (!session) {
        redirectToLogin();
        return false;
    }

    if (!hasPermission(session.role, permission)) {
        showAccessDenied();
        return false;
    }

    return true;
}

function requireRole(allowedRoles) {
    const session = getCurrentSession();
    if (!session) {
        redirectToLogin();
        return false;
    }

    if (!allowedRoles.includes(session.role)) {
        showAccessDenied();
        return false;
    }

    return true;
}

// === UTILITY FUNCTIONS ===
function getCurrentSession() {
    // Try super admin first
    let session = localStorage.getItem('superAdminSession');
    if (session) {
        const data = JSON.parse(session);
        return { ...data, role: 'super_admin' };
    }

    // Try pharmacy admin
    session = localStorage.getItem('pharmacySession');
    if (session) {
        const data = JSON.parse(session);
        return { ...data, role: 'pharmacy' };
    }

    // Try doctor admin
    session = localStorage.getItem('doctorSession');
    if (session) {
        const data = JSON.parse(session);
        return { ...data, role: 'doctor' };
    }

    return null;
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

function showAccessDenied() {
    alert('Accès refusé. Vous n\'avez pas les permissions nécessaires pour cette action.');
}

function getRoleLabel(role) {
    return ROLES[role]?.label || role;
}

function getRoleColor(role) {
    return ROLES[role]?.color || '#6b7280';
}

function getRoleDescription(role) {
    return ROLES[role]?.description || '';
}

// === ACTIVITY LOGGING ===
function logActivity(action, details = {}) {
    const session = getCurrentSession();
    if (!session) return;

    const log = {
        timestamp: new Date().toISOString(),
        userId: session.userId || session.doctorId || session.pharmacyId,
        userEmail: session.email,
        userRole: session.role,
        action: action,
        details: details
    };

    // Get existing logs
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push(log);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
        logs.shift();
    }

    localStorage.setItem('activity_logs', JSON.stringify(logs));
    console.log('Activity logged:', log);
}

function getActivityLogs(filters = {}) {
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');

    let filtered = logs;

    if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return filtered.reverse(); // Most recent first
}

// Export for global access
window.Permissions = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isSuperAdmin,
    canManageUsers,
    canViewAllData,
    requirePermission,
    requireRole,
    getCurrentSession,
    getRoleLabel,
    getRoleColor,
    getRoleDescription,
    logActivity,
    getActivityLogs,
    PERMISSIONS,
    ROLES
};

console.log('🔐 Permissions system initialized');
