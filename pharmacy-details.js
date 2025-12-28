// ========================================
// EPHARMA - PHARMACY DETAILS PAGE
// ========================================

// === PHARMACY DATA (Extended from results.js) ===
const pharmaciesData = {
    1: {
        id: 1,
        name: "Pharmacie Sabo",
        address: "Route Ouallam, Niamey",
        lat: 13.5245,
        lng: 2.0985,
        distance: 0.5,
        phone: "(+227) 20 35 01 99",
        email: "contact@pharmacie-sabo.ne",
        isOpen: true,
        rating: 4.8,
        reviewsCount: 127,
        hours: {
            lundi: "8h00 - 20h00",
            mardi: "8h00 - 20h00",
            mercredi: "8h00 - 20h00",
            jeudi: "8h00 - 20h00",
            vendredi: "8h00 - 20h00",
            samedi: "9h00 - 19h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: true },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: true },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: false }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 15, price: "2500 FCFA" },
            { name: "Aspégic 500mg", stock: 8, price: "3200 FCFA" },
            { name: "Ibuprofène 400mg", stock: 12, price: "2800 FCFA" }
        ],
        reviews: [
            {
                author: "Amadou D.",
                rating: 5,
                comment: "Excellent service, personnel très aimable et professionnel. Toujours de bon conseil.",
                date: "2025-11-28"
            },
            {
                author: "Fatouma M.",
                rating: 5,
                comment: "Pharmacie très bien située, accueil chaleureux. Je recommande vivement !",
                date: "2025-11-25"
            }
        ]
    },
    2: {
        id: 2,
        name: "Pharmacie Air",
        address: "Niamey",
        lat: 13.5137,
        lng: 2.1098,
        distance: 0.3,
        phone: "(+227) 20 74 01 29",
        email: "contact@pharmacie-air.ne",
        isOpen: true,
        rating: 4.6,
        reviewsCount: 89,
        hours: {
            lundi: "8h00 - 19h00",
            mardi: "8h00 - 19h00",
            mercredi: "8h00 - 19h00",
            jeudi: "8h00 - 19h00",
            vendredi: "8h00 - 19h00",
            samedi: "9h00 - 18h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: false },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: false },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: true }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 12, price: "2500 FCFA" }
        ],
        reviews: [
            {
                author: "Mariama B.",
                rating: 5,
                comment: "Très professionnels, toujours disponibles pour répondre aux questions.",
                date: "2025-11-22"
            }
        ]
    },
    3: {
        id: 3,
        name: "Pharmacie Ar-Rahma",
        address: "Quartier Sarey Koubou, Ilot N° 6276, Niamey",
        lat: 13.5089,
        lng: 2.1156,
        distance: 0.8,
        phone: "(+227) 88 92 00 86",
        email: "contact@pharmacie-arrahma.ne",
        isOpen: true,
        rating: 4.7,
        reviewsCount: 95,
        hours: {
            lundi: "8h30 - 19h30",
            mardi: "8h30 - 19h30",
            mercredi: "8h30 - 19h30",
            jeudi: "8h30 - 19h30",
            vendredi: "8h30 - 19h30",
            samedi: "9h00 - 18h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: false },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: true },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: false }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 10, price: "2500 FCFA" },
            { name: "Paracétamol 500mg", stock: 20, price: "1500 FCFA" }
        ],
        reviews: []
    },
    4: {
        id: 4,
        name: "Pharmacie Dendi Koira Kano",
        address: "Koira Kano Nord, Niamey",
        lat: 13.5198,
        lng: 2.1234,
        distance: 1.2,
        phone: "(+227) 21 31 73 31",
        email: "contact@pharmacie-dendi.ne",
        isOpen: true,
        rating: 4.5,
        reviewsCount: 78,
        hours: {
            lundi: "9h00 - 20h00",
            mardi: "9h00 - 20h00",
            mercredi: "9h00 - 20h00",
            jeudi: "9h00 - 20h00",
            vendredi: "9h00 - 20h00",
            samedi: "9h00 - 19h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: true },
            { name: "Livraison à domicile", icon: "truck", available: false },
            { name: "Parking", icon: "car", available: true },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: false },
            { name: "Tests COVID", icon: "shield", available: true }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 8, price: "2500 FCFA" }
        ],
        reviews: []
    },
    5: {
        id: 5,
        name: "Pharmacie 03 Août",
        address: "Boulevard Mali-Bero, Niamey",
        lat: 13.5118,
        lng: 2.1436,
        distance: 1.5,
        phone: "(+227) 20 35 18 18",
        email: "contact@pharmacie-03aout.ne",
        isOpen: true,
        rating: 4.8,
        reviewsCount: 112,
        hours: {
            lundi: "8h00 - 19h00",
            mardi: "8h00 - 19h00",
            mercredi: "8h00 - 19h00",
            jeudi: "8h00 - 19h00",
            vendredi: "8h00 - 19h00",
            samedi: "9h00 - 18h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: true },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: true },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: true }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 18, price: "2500 FCFA" },
            { name: "Aspégic 500mg", stock: 10, price: "3200 FCFA" }
        ],
        reviews: []
    },
    6: {
        id: 6,
        name: "Pharmacie 7 Thérapies",
        address: "Quartier Bobiel Ilot 5069 /H, Niamey",
        lat: 13.5067,
        lng: 2.1189,
        distance: 1.8,
        phone: "(+227) 21 66 21 58",
        email: "contact@pharmacie-7therapies.ne",
        isOpen: true,
        rating: 4.6,
        reviewsCount: 87,
        hours: {
            lundi: "9h00 - 18h30",
            mardi: "9h00 - 18h30",
            mercredi: "9h00 - 18h30",
            jeudi: "9h00 - 18h30",
            vendredi: "9h00 - 18h30",
            samedi: "9h00 - 17h00",
            dimanche: "Fermé"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: false },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: false },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: false }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 14, price: "2500 FCFA" }
        ],
        reviews: []
    },
    7: {
        id: 7,
        name: "Pharmacie de la Gare",
        address: "Boulevard Mali Bero, Niamey",
        lat: 13.5334,
        lng: 2.0976,
        distance: 2.0,
        phone: "Non spécifié",
        email: "contact@pharmacie-gare.ne",
        isOpen: true,
        rating: 4.9,
        reviewsCount: 145,
        hours: {
            lundi: "24h/24",
            mardi: "24h/24",
            mercredi: "24h/24",
            jeudi: "24h/24",
            vendredi: "24h/24",
            samedi: "24h/24",
            dimanche: "24h/24"
        },
        services: [
            { name: "Garde de nuit", icon: "moon", available: true },
            { name: "Livraison à domicile", icon: "truck", available: true },
            { name: "Parking", icon: "car", available: true },
            { name: "Paiement carte", icon: "credit-card", available: true },
            { name: "Tiers payant", icon: "file-text", available: true },
            { name: "Tests COVID", icon: "shield", available: true }
        ],
        products: [
            { name: "Doliprane 1000mg", stock: 20, price: "2500 FCFA" },
            { name: "Aspégic 500mg", stock: 15, price: "3200 FCFA" },
            { name: "Ibuprofène 400mg", stock: 18, price: "2800 FCFA" }
        ],
        reviews: []
    }
};

// === GET PHARMACY ID FROM URL ===
const urlParams = new URLSearchParams(window.location.search);
const pharmacyId = parseInt(urlParams.get('id')) || 1;
const pharmacy = pharmaciesData[pharmacyId] || pharmaciesData[1];

// === INITIALIZE PAGE ===
document.addEventListener('DOMContentLoaded', () => {
    renderPharmacyDetails();
    initializeActions();
    initializeReservationForm();
});

// === RENDER PHARMACY DETAILS ===
function renderPharmacyDetails() {
    // Header
    document.getElementById('pharmacyName').textContent = pharmacy.name;
    document.getElementById('pharmacyAddress').textContent = pharmacy.address;
    document.getElementById('pharmacyPhone').textContent = pharmacy.phone;
    document.getElementById('pharmacyPhone').href = `tel:${pharmacy.phone.replace(/\s/g, '')}`;

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = `pharmacy-status-badge ${pharmacy.isOpen ? 'status-open' : 'status-closed'}`;
    statusBadge.querySelector('span').textContent = pharmacy.isOpen ? 'Ouvert' : 'Fermé';

    // Rating
    const stars = '★'.repeat(Math.round(pharmacy.rating)) + '☆'.repeat(5 - Math.round(pharmacy.rating));
    document.querySelector('.pharmacy-rating .stars').textContent = stars;
    document.querySelector('.rating-text').textContent = `${pharmacy.rating} (${pharmacy.reviewsCount} avis)`;

    // Distance
    document.getElementById('distanceBadge').querySelector('span').textContent = `${pharmacy.distance} km`;

    // Opening hours
    renderOpeningHours();

    // Services
    renderServices();

    // Products
    renderProducts();

    // Reviews
    renderReviews();
}

// === RENDER OPENING HOURS ===
function renderOpeningHours() {
    const hoursContainer = document.getElementById('openingHours');
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();

    let hoursHTML = '';
    for (const [day, hours] of Object.entries(pharmacy.hours)) {
        const isToday = day === today;
        hoursHTML += `
            <div class="hours-row ${isToday ? 'hours-today' : ''}">
                <span class="hours-day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
                <span class="hours-time">${hours}</span>
            </div>
        `;
    }
    hoursContainer.innerHTML = hoursHTML;
}

// === RENDER SERVICES ===
function renderServices() {
    const servicesContainer = document.getElementById('servicesGrid');

    let servicesHTML = '';
    pharmacy.services.forEach(service => {
        servicesHTML += `
            <div class="service-item ${service.available ? 'service-available' : 'service-unavailable'}">
                <div class="service-icon">
                    ${getServiceIcon(service.icon)}
                </div>
                <span class="service-name">${service.name}</span>
                ${service.available ?
                '<svg class="service-check" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/></svg>' :
                '<svg class="service-cross" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/></svg>'
            }
            </div>
        `;
    });
    servicesContainer.innerHTML = servicesHTML;
}

function getServiceIcon(iconName) {
    const icons = {
        moon: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/></svg>',
        truck: '<svg viewBox="0 0 24 24" fill="none"><path d="M16 3H1V16H16V3Z" stroke="currentColor" stroke-width="2"/><path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" stroke-width="2"/><circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" stroke-width="2"/></svg>',
        car: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 17H4C2.89543 17 2 16.1046 2 15V11L4.48 5.212C4.79 4.452 5.53 4 6.35 4H17.65C18.47 4 19.21 4.452 19.52 5.212L22 11V15C22 16.1046 21.1046 17 20 17H19" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="2"/></svg>',
        'credit-card': '<svg viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M1 10H23" stroke="currentColor" stroke-width="2"/></svg>',
        'file-text': '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/><path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/></svg>',
        shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/></svg>'
    };
    return icons[iconName] || '';
}

// === RENDER PRODUCTS ===
function renderProducts() {
    const productsContainer = document.getElementById('productsList');

    let productsHTML = '';
    pharmacy.products.forEach(product => {
        productsHTML += `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-stock">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>${product.stock} en stock</span>
                    </div>
                </div>
                <!-- Prix masqué -->
            </div>
        `;
    });
    productsContainer.innerHTML = productsHTML;
}

// === RENDER REVIEWS ===
function renderReviews() {
    const reviewsContainer = document.getElementById('reviewsList');

    let reviewsHTML = '';
    pharmacy.reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        reviewsHTML += `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.author}</div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <div class="review-rating">${stars}</div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `;
    });
    reviewsContainer.innerHTML = reviewsHTML;
}

// === INITIALIZE ACTIONS ===
function initializeActions() {
    // Call button
    document.getElementById('callBtn').addEventListener('click', () => {
        window.location.href = `tel:${pharmacy.phone.replace(/\s/g, '')}`;
    });

    // Directions button
    document.getElementById('directionsBtn').addEventListener('click', () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;
        window.open(url, '_blank');
    });

    // Share button
    document.getElementById('shareBtn').addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: pharmacy.name,
                text: `Découvrez ${pharmacy.name} sur Epharma`,
                url: window.location.href
            }).catch(err => console.log('Erreur de partage:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        }
    });
}

// === INITIALIZE RESERVATION FORM ===
function initializeReservationForm() {
    const form = document.getElementById('reservationForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('reservationName').value,
            phone: document.getElementById('reservationPhone').value,
            products: document.getElementById('reservationProducts').value,
            message: document.getElementById('reservationMessage').value,
            pharmacy: pharmacy.name
        };

        console.log('Réservation:', formData);

        // Show success message
        alert(`✅ Réservation envoyée !\n\nVous recevrez une confirmation par SMS au ${formData.phone}.\n\nMerci d'avoir choisi ${pharmacy.name} !`);

        // Reset form
        form.reset();
    });
}

// === CONSOLE LOG ===
console.log('🏥 Pharmacy Details Page initialized');
console.log('📍 Pharmacy:', pharmacy.name);
