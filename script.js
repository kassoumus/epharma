// ========================================
// EPHARMA - JAVASCRIPT INTERACTIONS
// ========================================

// === DOM ELEMENTS ===
const medicamentSearch = document.getElementById('medicamentSearch');
const locationSearch = document.getElementById('locationSearch');
const clearBtn = document.getElementById('clearBtn');
const locateBtn = document.getElementById('locateBtn');
const searchBtn = document.getElementById('searchBtn');
const suggestionsDropdown = document.getElementById('suggestionsDropdown');
const searchTagsContainer = document.getElementById('searchTagsContainer');

// === DEMO DATA ===
const popularMedicaments = [
    'Doliprane 1000mg',
    'Aspégic 500mg',
    'Ibuprofène 400mg',
    'Spasfon',
    'Efferalgan',
    'Advil',
    'Dafalgan',
    'Nurofen'
];

// === CATEGORY SELECTOR ===
let currentCategory = 'pharmacy';
const categoryButtons = document.querySelectorAll('.category-btn');

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update current category
        currentCategory = btn.dataset.category;

        // Update placeholder text
        updatePlaceholder();

        // Clear current search
        searchedMedicaments = [];
        medicamentSearch.value = '';
        renderTags();
    });
});

function updatePlaceholder() {
    const placeholders = {
        'pharmacy': 'Rechercher un ou plusieurs médicaments (Entrée pour ajouter)',
        'health-center': 'Rechercher un centre de santé ou hôpital',
        'doctor': 'Rechercher un médecin par nom ou spécialité'
    };
    medicamentSearch.placeholder = placeholders[currentCategory] || placeholders.pharmacy;
}

// === SEARCH STATE ===
let searchedMedicaments = []; // Array to store multiple medications

// === SEARCH INPUT HANDLERS ===
medicamentSearch.addEventListener('input', (e) => {
    const value = e.target.value;

    // Show/hide clear button
    if (value.length > 0 || searchedMedicaments.length > 0) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }

    // Show suggestions
    if (value.length > 0) {
        showSuggestions(value);
    } else {
        hideSuggestions();
    }
});

// Handle Enter key to add medication
medicamentSearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = medicamentSearch.value.trim();
        if (value) {
            addMedicamentTag(value);
            medicamentSearch.value = '';
            hideSuggestions();
        } else if (searchedMedicaments.length > 0) {
            // If input is empty but we have tags, perform search
            performSearch();
        }
    }
});

// Clear button handler
clearBtn.addEventListener('click', () => {
    medicamentSearch.value = '';
    searchedMedicaments = [];
    renderTags();
    clearBtn.style.display = 'none';
    hideSuggestions();
    medicamentSearch.focus();
});

// === TAG MANAGEMENT ===
function addMedicamentTag(medicament) {
    // Avoid duplicates
    if (!searchedMedicaments.includes(medicament)) {
        searchedMedicaments.push(medicament);
        renderTags();
        clearBtn.style.display = 'flex';
    }
}

function removeMedicamentTag(medicament) {
    searchedMedicaments = searchedMedicaments.filter(m => m !== medicament);
    renderTags();

    if (searchedMedicaments.length === 0 && !medicamentSearch.value) {
        clearBtn.style.display = 'none';
    }
}

function renderTags() {
    searchTagsContainer.innerHTML = '';

    searchedMedicaments.forEach(medicament => {
        const tag = document.createElement('div');
        tag.className = 'search-tag';
        tag.innerHTML = `
            <span class="search-tag-text">${medicament}</span>
            <button class="search-tag-remove" onclick="removeMedicamentTag('${medicament.replace(/'/g, "\\'")}')">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        searchTagsContainer.appendChild(tag);
    });
}

// === LOCATION HANDLERS ===
locateBtn.addEventListener('click', async () => {
    // Add loading state
    locateBtn.style.opacity = '0.5';
    locateBtn.style.cursor = 'wait';

    if ('geolocation' in navigator) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            // Simulate reverse geocoding (in production, use a real API)
            locationSearch.value = 'Ma position actuelle';

            // Show success feedback
            locateBtn.style.opacity = '1';
            locateBtn.style.cursor = 'pointer';

            // Add a subtle animation
            locateBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                locateBtn.style.transform = 'scale(1)';
            }, 200);

        } catch (error) {
            console.error('Erreur de géolocalisation:', error);
            alert('Impossible d\'accéder à votre position. Veuillez vérifier vos paramètres de localisation.');
            locateBtn.style.opacity = '1';
            locateBtn.style.cursor = 'pointer';
        }
    } else {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        locateBtn.style.opacity = '1';
        locateBtn.style.cursor = 'pointer';
    }
});

// === SUGGESTIONS ===
function showSuggestions(query) {
    const filtered = popularMedicaments.filter(med =>
        med.toLowerCase().includes(query.toLowerCase()) &&
        !searchedMedicaments.includes(med) // Don't show already added meds
    );

    if (filtered.length > 0) {
        // Build suggestions HTML
        let suggestionsHTML = '<div class="suggestions-header">Suggestions populaires</div>';

        filtered.slice(0, 5).forEach(med => {
            suggestionsHTML += `
                <div class="suggestion-item" onclick="selectSuggestion('${med.replace(/'/g, "\\'")}')">
                    <svg class="suggestion-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>${med}</span>
                </div>
            `;
        });

        suggestionsDropdown.innerHTML = suggestionsHTML;
        suggestionsDropdown.style.display = 'block';
    } else {
        hideSuggestions();
    }
}

function hideSuggestions() {
    suggestionsDropdown.style.display = 'none';
}

function selectSuggestion(medicament) {
    addMedicamentTag(medicament);
    medicamentSearch.value = '';
    hideSuggestions();
    medicamentSearch.focus();
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        hideSuggestions();
    }
});

// === SEARCH FUNCTIONALITY ===
function performSearch() {
    const location = locationSearch.value.trim() || 'Niamey'; // Default to Niamey

    if (currentCategory === 'pharmacy') {
        if (searchedMedicaments.length === 0) {
            alert('Veuillez entrer au moins un médicament');
            return;
        }

        const medicamentsParam = searchedMedicaments.join(',');
        window.location.href = `results.html?medicaments=${encodeURIComponent(medicamentsParam)}&location=${encodeURIComponent(location)}`;
    } else if (currentCategory === 'health-center') {
        window.location.href = 'health-centers.html';
    } else if (currentCategory === 'doctor') {
        window.location.href = 'doctors.html';
    }
}

searchBtn.addEventListener('click', performSearch);

// === ENTER KEY SUPPORT ===
medicamentSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = medicamentSearch.value.trim();
        if (value && currentCategory === 'pharmacy') {
            addMedicamentTag(value);
            medicamentSearch.value = '';
            suggestionsDropdown.style.display = 'none';
        } else {
            performSearch();
        }
    }
});

locationSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});

// === ANIMATIONS ===
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// === SCROLL EFFECTS ===
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// === FEATURE CARDS ANIMATION ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';

            setTimeout(() => {
                entry.target.style.transition = 'all 0.6s ease-out';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);

            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // Set default location to Niamey
    if (locationSearch && !locationSearch.value) {
        locationSearch.value = 'Niamey';
    }
    console.log('📍 Default location set to: Niamey, Niger');
});
console.log('🚀 Epharma initialized');
console.log('📍 Multi-category search enabled');
console.log('✅ Pharmacies, Centres de santé, Médecins');
