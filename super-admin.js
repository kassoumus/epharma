// ========================================
// SUPER ADMIN - AUTHENTICATION & DATA
// ========================================

// === SUPER ADMIN DATA ===
const superAdmin = {
    email: 'admin@epharma.fr',
    password: 'superadmin123',
    name: 'Administrateur Système',
    role: 'super_admin'
};

// === DEMO USERS DATA ===
const demoUsers = [
    {
        id: 1,
        name: 'Pharmacie de la République',
        email: 'contact@pharmacie-republique.fr',
        role: 'pharmacy',
        status: 'active',
        createdAt: '2025-11-01',
        lastLogin: '2025-12-05'
    },
    {
        id: 2,
        name: 'Dr. Marie Dubois',
        email: 'dr.dubois@cabinet-sante.fr',
        role: 'doctor',
        status: 'active',
        createdAt: '2025-11-15',
        lastLogin: '2025-12-05'
    },
    {
        id: 3,
        name: 'Jean Dupont',
        email: 'jean.dupont@email.fr',
        role: 'patient',
        status: 'active',
        createdAt: '2025-11-20',
        lastLogin: '2025-12-04'
    },
    {
        id: 4,
        name: 'Pharmacie Voltaire',
        email: 'contact@pharmacie-voltaire.fr',
        role: 'pharmacy',
        status: 'active',
        createdAt: '2025-10-15',
        lastLogin: '2025-12-03'
    },
    {
        id: 5,
        name: 'Dr. Jean Martin',
        email: 'dr.martin@cardio-paris.fr',
        role: 'doctor',
        status: 'active',
        createdAt: '2025-10-20',
        lastLogin: '2025-12-05'
    },
    {
        id: 6,
        name: 'Marie Martin',
        email: 'marie.martin@email.fr',
        role: 'patient',
        status: 'inactive',
        createdAt: '2025-09-10',
        lastLogin: '2025-11-15'
    }
];

// === AUTHENTICATION ===
function superAdminLogin(email, password) {
    if (email === superAdmin.email && password === superAdmin.password) {
        const session = {
            adminName: superAdmin.name,
            email: superAdmin.email,
            role: superAdmin.role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('superAdminSession', JSON.stringify(session));
        return session;
    }
    return null;
}

function superAdminLogout() {
    localStorage.removeItem('superAdminSession');
    window.location.href = 'super-admin-login.html';
}

function requireSuperAdminAuth() {
    const sessionData = localStorage.getItem('superAdminSession');
    if (!sessionData) {
        window.location.href = 'super-admin-login.html';
        return null;
    }
    return JSON.parse(sessionData);
}

// === USER MANAGEMENT ===
function getUsers() {
    const stored = localStorage.getItem('epharma_users');
    return stored ? JSON.parse(stored) : demoUsers;
}

function saveUsers(users) {
    localStorage.setItem('epharma_users', JSON.stringify(users));
}

function createUser(userData) {
    const users = getUsers();
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...userData,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null,
        status: 'active'
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

function updateUser(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        return users[index];
    }
    return null;
}

function deleteUser(userId) {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);
    return true;
}

function toggleUserStatus(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        saveUsers(users);
        return user;
    }
    return null;
}

// === STATISTICS ===
function getStatistics() {
    const users = getUsers();

    return {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        pharmacies: users.filter(u => u.role === 'pharmacy').length,
        doctors: users.filter(u => u.role === 'doctor').length,
        patients: users.filter(u => u.role === 'patient').length,
        inactiveUsers: users.filter(u => u.status === 'inactive').length
    };
}

// === LOGIN FORM HANDLER ===
if (document.getElementById('superAdminLoginForm')) {
    document.getElementById('superAdminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const session = superAdminLogin(email, password);

        if (session) {
            window.location.href = 'super-admin-dashboard.html';
        } else {
            alert('Email ou mot de passe incorrect');
        }
    });
}

console.log('🔐 Super Admin system initialized');
