// ========================================
// EPHARMA - RESULTS PAGE JAVASCRIPT
// ========================================

// === DEMO DATA ===
const pharmacies = [
    {
        id: 1,
        name: "Pharmacie de la République",
        address: "45 Avenue de la République, 75011 Paris",
        lat: 48.8656,
        lng: 2.3798,
        distance: 0.3,
        phone: "01 43 55 12 34",
        hours: "8h00 - 20h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 15
    },
    {
        id: 2,
        name: "Pharmacie Saint-Antoine",
        address: "128 Rue du Faubourg Saint-Antoine, 75012 Paris",
        lat: 48.8503,
        lng: 2.3765,
        distance: 0.5,
        phone: "01 43 43 21 87",
        hours: "9h00 - 19h30",
        isOpen: true,
        hasStock: true,
        stockQuantity: 8
    },
    {
        id: 3,
        name: "Pharmacie Voltaire",
        address: "89 Boulevard Voltaire, 75011 Paris",
        lat: 48.8575,
        lng: 2.3798,
        distance: 0.7,
        phone: "01 48 05 67 89",
        hours: "8h30 - 20h30",
        isOpen: true,
        hasStock: true,
        stockQuantity: 12
    },
    {
        id: 4,
        name: "Pharmacie Bastille",
        address: "12 Place de la Bastille, 75011 Paris",
        lat: 48.8532,
        lng: 2.3689,
        distance: 0.9,
        phone: "01 43 07 45 23",
        hours: "7h30 - 21h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 20
    },
    {
        id: 5,
        name: "Pharmacie Charonne",
        address: "67 Rue de Charonne, 75011 Paris",
        lat: 48.8534,
        lng: 2.3821,
        distance: 1.1,
        phone: "01 43 71 34 56",
        hours: "9h00 - 19h00",
        isOpen: false,
        hasStock: true,
        stockQuantity: 5
    },
    {
        id: 6,
        name: "Pharmacie Oberkampf",
        address: "34 Rue Oberkampf, 75011 Paris",
        lat: 48.8645,
        lng: 2.3712,
        distance: 1.3,
        phone: "01 48 06 78 90",
        hours: "8h00 - 20h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 10
    },
    {
        id: 7,
        name: "Pharmacie Roquette",
        address: "156 Rue de la Roquette, 75011 Paris",
        lat: 48.8556,
        lng: 2.3834,
        distance: 1.5,
        phone: "01 43 79 12 34",
        hours: "9h00 - 19h30",
        isOpen: true,
        hasStock: true,
        stockQuantity: 7
    },
    {
        id: 8,
        name: "Pharmacie Nation",
        address: "2 Place de la Nation, 75012 Paris",
        lat: 48.8483,
        lng: 2.3956,
        distance: 1.8,
        phone: "01 43 73 45 67",
        hours: "8h30 - 20h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 18
    },
    {
        id: 9,
        name: "Pharmacie Père Lachaise",
        address: "78 Boulevard de Ménilmontant, 75020 Paris",
        lat: 48.8634,
        lng: 2.3889,
        distance: 2.0,
        phone: "01 43 58 90 12",
        hours: "9h00 - 19h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 6
    },
    {
        id: 10,
        name: "Pharmacie Ledru-Rollin",
        address: "45 Avenue Ledru-Rollin, 75012 Paris",
        lat: 48.8489,
        lng: 2.3723,
        distance: 2.2,
        phone: "01 43 43 56 78",
        hours: "8h00 - 20h30",
        isOpen: true,
        hasStock: true,
        stockQuantity: 14
    },
    {
        id: 11,
        name: "Pharmacie Belleville",
        address: "123 Rue de Belleville, 75020 Paris",
        lat: 48.8723,
        lng: 2.3867,
        distance: 2.5,
        phone: "01 43 58 23 45",
        hours: "9h00 - 19h30",
        isOpen: true,
        hasStock: true,
        stockQuantity: 9
    },
    {
        id: 12,
        name: "Pharmacie Daumesnil",
        address: "234 Avenue Daumesnil, 75012 Paris",
        lat: 48.8423,
        lng: 2.3912,
        distance: 2.8,
        phone: "01 43 44 67 89",
        hours: "8h30 - 20h00",
        isOpen: true,
        hasStock: true,
        stockQuantity: 11
    }
];

// === STATE ===
let map;
let markers = [];
let activeFilter = 'all';
let activePharmacyId = null;

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const medicamentsQuery = urlParams.get('q') || 'Doliprane 1000mg';
    const location = urlParams.get('loc') || 'Paris';

    // Parse multiple medications (comma-separated)
    const searchedMedicaments = medicamentsQuery.split(',').map(m => m.trim());

    // Update search inputs
    document.getElementById('medicamentSearchCompact').value = searchedMedicaments.join(', ');
    document.getElementById('locationSearchCompact').value = location;

    // Update results info
    document.getElementById('searchQuery').textContent = searchedMedicaments.join(', ');
    document.getElementById('searchLocation').textContent = location;

    initializeMap();
    renderPharmacies(pharmacies);
    initializeFilters();
    initializeSearch();

    console.log('🔍 Recherche:', searchedMedicaments);
});

// === MAP INITIALIZATION ===
function initializeMap() {
    // Center on Paris
    map = L.map('map').setView([48.8566, 2.3522], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add markers for all pharmacies
    pharmacies.forEach(pharmacy => {
        addMarker(pharmacy);
    });

    // Map controls
    document.getElementById('centerMapBtn').addEventListener('click', () => {
        map.setView([48.8566, 2.3522], 13);
    });
}

// === ADD MARKER ===
function addMarker(pharmacy) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${pharmacy.isOpen ? '#10b981' : '#ef4444'};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            ">
                +
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    const marker = L.marker([pharmacy.lat, pharmacy.lng], { icon })
        .addTo(map)
        .bindPopup(`
            <div class="popup-pharmacy-name">${pharmacy.name}</div>
            <div class="popup-pharmacy-address">${pharmacy.address}</div>
            <div class="popup-pharmacy-status">${pharmacy.isOpen ? 'Ouvert' : 'Fermé'}</div>
        `);

    marker.pharmacyId = pharmacy.id;

    marker.on('click', () => {
        highlightPharmacy(pharmacy.id);
        scrollToPharmacy(pharmacy.id);
    });

    markers.push(marker);
}

// === RENDER PHARMACIES ===
function renderPharmacies(pharmaciesToRender) {
    const pharmacyList = document.getElementById('pharmacyList');
    pharmacyList.innerHTML = '';

    pharmaciesToRender.forEach(pharmacy => {
        const card = createPharmacyCard(pharmacy);
        pharmacyList.appendChild(card);
    });

    // Update count
    document.getElementById('resultsCount').textContent = pharmaciesToRender.length;
}

// === CREATE PHARMACY CARD ===
function createPharmacyCard(pharmacy) {
    const card = document.createElement('div');
    card.className = 'pharmacy-card';
    card.id = `pharmacy-${pharmacy.id}`;
    card.dataset.pharmacyId = pharmacy.id;

    card.innerHTML = `
        <div class="pharmacy-header">
            <div class="pharmacy-info">
                <div class="pharmacy-name">${pharmacy.name}</div>
                <div class="pharmacy-address">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    ${pharmacy.address}
                </div>
            </div>
            <div class="pharmacy-distance">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${pharmacy.distance} km
            </div>
        </div>
        
        <div class="pharmacy-details">
            <div class="pharmacy-detail ${pharmacy.isOpen ? 'open' : 'closed'}">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                ${pharmacy.isOpen ? 'Ouvert' : 'Fermé'} • ${pharmacy.hours}
            </div>
            <div class="pharmacy-detail">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19.92C22 20.4696 21.5523 20.9167 21.0027 20.9201C19.4882 20.9314 18.0001 20.586 16.6429 19.9101C15.3769 19.2797 14.2687 18.3657 13.3952 17.2339C12.5217 16.1021 11.9049 14.7816 11.5859 13.3725C11.2669 11.9634 11.2527 10.4998 11.5442 9.08421C11.6889 8.37263 12.2781 7.84916 13.0033 7.84916H16.0033C16.5556 7.84916 17.0033 8.29688 17.0033 8.84916C17.0033 9.40145 16.5556 9.84916 16.0033 9.84916H13.5442C13.2669 11.0634 13.2811 12.3269 13.5859 13.5375C13.8907 14.7481 14.4787 15.8686 15.2952 16.8089C16.1117 17.7492 17.1319 18.4847 18.2714 18.9601C19.4109 19.4355 20.6382 19.6389 21.8642 19.5542C22.4165 19.5208 22.8642 19.9685 22.8642 20.5208C22.8642 21.0731 22.4165 21.5208 21.8642 21.5542C20.4882 21.6389 19.1109 21.4355 17.7714 20.9601C16.4319 20.4847 15.2117 19.7492 14.2952 18.8089C13.3787 17.8686 12.7907 16.7481 12.4859 15.5375C12.1811 14.3269 12.1669 13.0634 12.4442 11.8492H9.00329C8.45101 11.8492 8.00329 11.4014 8.00329 10.8492C8.00329 10.2969 8.45101 9.84916 9.00329 9.84916H12.4442C12.7215 8.63493 13.3095 7.51445 14.126 6.57415C14.9425 5.63384 15.9627 4.89834 17.1022 4.42293C18.2417 3.94752 19.469 3.74411 20.695 3.82882C21.2473 3.86221 21.695 4.30993 21.695 4.86221C21.695 5.4145 21.2473 5.86221 20.695 5.82882C19.469 5.74411 18.2417 5.94752 17.1022 6.42293C15.9627 6.89834 14.9425 7.63384 14.126 8.57415C13.3095 9.51445 12.7215 10.6349 12.4442 11.8492H15.0033C15.5556 11.8492 16.0033 12.2969 16.0033 12.8492C16.0033 13.4014 15.5556 13.8492 15.0033 13.8492H12.5442C12.2669 15.0634 12.2811 16.3269 12.5859 17.5375C12.8907 18.7481 13.4787 19.8686 14.2952 20.8089C15.1117 21.7492 16.1319 22.4847 17.2714 22.9601C18.4109 23.4355 19.6382 23.6389 20.8642 23.5542C21.4165 23.5208 21.8642 23.9685 21.8642 24.5208C21.8642 25.0731 21.4165 25.5208 20.8642 25.5542C19.4882 25.6389 18.1109 25.4355 16.7714 24.9601" stroke="currentColor" stroke-width="2"/>
                </svg>
                ${pharmacy.phone}
            </div>
        </div>
        
        <div class="pharmacy-stock">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="pharmacy-stock-text">En stock (${pharmacy.stockQuantity} disponibles)</span>
        </div>
        
        <div class="pharmacy-actions">
            <button class="pharmacy-btn pharmacy-btn-primary" onclick="viewPharmacy(${pharmacy.id})">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Voir détails
            </button>
            <button class="pharmacy-btn pharmacy-btn-secondary" onclick="getDirections(${pharmacy.id})">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Itinéraire
            </button>
        </div>
    `;

    // Click handler
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            highlightPharmacy(pharmacy.id);
            centerMapOnPharmacy(pharmacy);
        }
    });

    return card;
}

// === FILTERS ===
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            const filter = btn.dataset.filter;
            activeFilter = filter;
            applyFilter(filter);
        });
    });
}

function applyFilter(filter) {
    let filtered = pharmacies;

    switch (filter) {
        case 'open':
            filtered = pharmacies.filter(p => p.isOpen);
            break;
        case 'nearby':
            filtered = pharmacies.filter(p => p.distance <= 1.0);
            break;
        case 'all':
        default:
            filtered = pharmacies;
    }

    renderPharmacies(filtered);
}

// === SEARCH ===
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtnCompact');
    searchBtn.addEventListener('click', () => {
        alert('Nouvelle recherche - Cette fonctionnalité sera disponible prochainement !');
    });
}

// === PHARMACY ACTIONS ===
function viewPharmacy(id) {
    window.location.href = `pharmacy-details.html?id=${id}`;
}

function getDirections(id) {
    const pharmacy = pharmacies.find(p => p.id === id);
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;
    window.open(url, '_blank');
}

function highlightPharmacy(id) {
    // Remove previous highlight
    document.querySelectorAll('.pharmacy-card').forEach(card => {
        card.classList.remove('active');
    });

    // Add new highlight
    const card = document.getElementById(`pharmacy-${id}`);
    if (card) {
        card.classList.add('active');
        activePharmacyId = id;
    }
}

function scrollToPharmacy(id) {
    const card = document.getElementById(`pharmacy-${id}`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function centerMapOnPharmacy(pharmacy) {
    map.setView([pharmacy.lat, pharmacy.lng], 15);

    // Open popup
    const marker = markers.find(m => m.pharmacyId === pharmacy.id);
    if (marker) {
        marker.openPopup();
    }
}

// === CONSOLE LOG ===
console.log('🗺️ Epharma Results Page initialized!');
console.log(`📍 ${pharmacies.length} pharmacies loaded`);
console.log('📍 Étape 2: Affichage des résultats - COMPLETE');
