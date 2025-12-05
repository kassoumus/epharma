// ========================================
// EPHARMA - ADMIN INTERFACE
// ========================================

// === DEMO CREDENTIALS ===
const DEMO_ACCOUNTS = [
    {
        email: "contact@pharmacie-republique.fr",
        password: "demo123",
        pharmacyId: 1,
        pharmacyName: "Pharmacie de la République"
    },
    {
        email: "contact@pharmacie-stantoine.fr",
        password: "demo123",
        pharmacyId: 2,
        pharmacyName: "Pharmacie Saint-Antoine"
    }
];

// === AUTHENTICATION ===
function login(email, password) {
    const account = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);

    if (account) {
        // Store session
        const session = {
            email: account.email,
            pharmacyId: account.pharmacyId,
            pharmacyName: account.pharmacyName,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('epharma_admin_session', JSON.stringify(session));
        return true;
    }

    return false;
}

function logout() {
    localStorage.removeItem('epharma_admin_session');
    window.location.href = 'admin-login.html';
}

function getSession() {
    const sessionData = localStorage.getItem('epharma_admin_session');
    return sessionData ? JSON.parse(sessionData) : null;
}

function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return session;
}

// === LOGIN PAGE ===
if (document.getElementById('adminLoginForm')) {
    const form = document.getElementById('adminLoginForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (login(email, password)) {
            // Success
            window.location.href = 'admin-dashboard.html';
        } else {
            // Error
            alert('❌ Email ou mot de passe incorrect.\n\nUtilisez les identifiants de démonstration affichés ci-dessous.');
        }
    });
}

// === DEMO DATA MANAGEMENT ===
function initializeDemoData() {
    // Initialize products if not exists
    if (!localStorage.getItem('epharma_products')) {
        const demoProducts = [
            { id: 1, name: "Doliprane 1000mg", stock: 150, price: 2.50, threshold: 20, pharmacyId: 1 },
            { id: 2, name: "Aspégic 500mg", stock: 80, price: 3.20, threshold: 15, pharmacyId: 1 },
            { id: 3, name: "Ibuprofène 400mg", stock: 120, price: 2.80, threshold: 20, pharmacyId: 1 },
            { id: 4, name: "Spasfon", stock: 45, price: 4.50, threshold: 10, pharmacyId: 1 },
            { id: 5, name: "Efferalgan", stock: 90, price: 2.90, threshold: 15, pharmacyId: 1 },
            { id: 6, name: "Advil 400mg", stock: 12, price: 3.50, threshold: 20, pharmacyId: 1 },
            { id: 7, name: "Dafalgan", stock: 65, price: 2.70, threshold: 15, pharmacyId: 1 },
            { id: 8, name: "Nurofen", stock: 8, price: 4.20, threshold: 10, pharmacyId: 1 }
        ];
        localStorage.setItem('epharma_products', JSON.stringify(demoProducts));
    }

    // Initialize reservations if not exists
    if (!localStorage.getItem('epharma_reservations')) {
        const demoReservations = [
            {
                id: 1,
                customerName: "Marie Dupont",
                phone: "06 12 34 56 78",
                products: "Doliprane 1000mg x2",
                status: "pending",
                date: new Date().toISOString().split('T')[0],
                time: "14:30",
                pharmacyId: 1
            },
            {
                id: 2,
                customerName: "Jean Martin",
                phone: "06 98 76 54 32",
                products: "Aspégic 500mg x1, Ibuprofène 400mg x1",
                status: "confirmed",
                date: new Date().toISOString().split('T')[0],
                time: "10:15",
                pharmacyId: 1
            },
            {
                id: 3,
                customerName: "Sophie Bernard",
                phone: "07 45 23 67 89",
                products: "Spasfon x3",
                status: "pending",
                date: new Date().toISOString().split('T')[0],
                time: "16:00",
                pharmacyId: 1
            }
        ];
        localStorage.setItem('epharma_reservations', JSON.stringify(demoReservations));
    }
}

// === PRODUCTS CRUD ===
function getProducts(pharmacyId) {
    const products = JSON.parse(localStorage.getItem('epharma_products') || '[]');
    return products.filter(p => p.pharmacyId === pharmacyId);
}

function addProduct(product) {
    const products = JSON.parse(localStorage.getItem('epharma_products') || '[]');
    const newProduct = {
        ...product,
        id: Date.now()
    };
    products.push(newProduct);
    localStorage.setItem('epharma_products', JSON.stringify(products));
    return newProduct;
}

function updateProduct(id, updates) {
    const products = JSON.parse(localStorage.getItem('epharma_products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('epharma_products', JSON.stringify(products));
        return products[index];
    }
    return null;
}

function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('epharma_products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('epharma_products', JSON.stringify(filtered));
}

// === RESERVATIONS ===
function getReservations(pharmacyId) {
    const reservations = JSON.parse(localStorage.getItem('epharma_reservations') || '[]');
    return reservations.filter(r => r.pharmacyId === pharmacyId);
}

function updateReservationStatus(id, status) {
    const reservations = JSON.parse(localStorage.getItem('epharma_reservations') || '[]');
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
        reservations[index].status = status;
        localStorage.setItem('epharma_reservations', JSON.stringify(reservations));
        return reservations[index];
    }
    return null;
}

// === STATISTICS ===
function getStatistics(pharmacyId) {
    const products = getProducts(pharmacyId);
    const reservations = getReservations(pharmacyId);
    const today = new Date().toISOString().split('T')[0];

    return {
        reservationsToday: reservations.filter(r => r.date === today).length,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock <= p.threshold).length,
        averageRating: 4.8,
        weeklyViews: 342,
        pendingReservations: reservations.filter(r => r.status === 'pending').length
    };
}

// === INITIALIZE ===
initializeDemoData();

console.log('🔐 Admin system initialized');
console.log('📧 Demo email: contact@pharmacie-republique.fr');
console.log('🔑 Demo password: demo123');
