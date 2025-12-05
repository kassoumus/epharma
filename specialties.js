// ========================================
// MEDICAL SPECIALTIES - EPHARMA
// ========================================

const MEDICAL_SPECIALTIES = [
    // Médecine générale
    { value: 'medecine_generale', label: 'Médecine générale', category: 'Générale' },

    // Spécialités médicales
    { value: 'cardiologie', label: 'Cardiologie', category: 'Médical' },
    { value: 'dermatologie', label: 'Dermatologie', category: 'Médical' },
    { value: 'endocrinologie', label: 'Endocrinologie', category: 'Médical' },
    { value: 'gastro_enterologie', label: 'Gastro-entérologie', category: 'Médical' },
    { value: 'geriatrie', label: 'Gériatrie', category: 'Médical' },
    { value: 'hematologie', label: 'Hématologie', category: 'Médical' },
    { value: 'infectiologie', label: 'Infectiologie', category: 'Médical' },
    { value: 'medecine_interne', label: 'Médecine interne', category: 'Médical' },
    { value: 'nephrologie', label: 'Néphrologie', category: 'Médical' },
    { value: 'neurologie', label: 'Neurologie', category: 'Médical' },
    { value: 'oncologie', label: 'Oncologie', category: 'Médical' },
    { value: 'pediatrie', label: 'Pédiatrie', category: 'Médical' },
    { value: 'pneumologie', label: 'Pneumologie', category: 'Médical' },
    { value: 'psychiatrie', label: 'Psychiatrie', category: 'Médical' },
    { value: 'rhumatologie', label: 'Rhumatologie', category: 'Médical' },

    // Spécialités chirurgicales
    { value: 'chirurgie_generale', label: 'Chirurgie générale', category: 'Chirurgical' },
    { value: 'chirurgie_cardiaque', label: 'Chirurgie cardiaque', category: 'Chirurgical' },
    { value: 'chirurgie_digestive', label: 'Chirurgie digestive', category: 'Chirurgical' },
    { value: 'chirurgie_orthopedique', label: 'Chirurgie orthopédique', category: 'Chirurgical' },
    { value: 'chirurgie_plastique', label: 'Chirurgie plastique', category: 'Chirurgical' },
    { value: 'chirurgie_thoracique', label: 'Chirurgie thoracique', category: 'Chirurgical' },
    { value: 'chirurgie_vasculaire', label: 'Chirurgie vasculaire', category: 'Chirurgical' },
    { value: 'neurochirurgie', label: 'Neurochirurgie', category: 'Chirurgical' },
    { value: 'urologie', label: 'Urologie', category: 'Chirurgical' },

    // Spécialités sensorielles
    { value: 'ophtalmologie', label: 'Ophtalmologie', category: 'Sensoriel' },
    { value: 'orl', label: 'ORL (Oto-rhino-laryngologie)', category: 'Sensoriel' },

    // Gynécologie et obstétrique
    { value: 'gynecologie', label: 'Gynécologie', category: 'Femme et enfant' },
    { value: 'obstetrique', label: 'Obstétrique', category: 'Femme et enfant' },
    { value: 'gynecologie_obstetrique', label: 'Gynécologie-obstétrique', category: 'Femme et enfant' },

    // Spécialités diagnostiques
    { value: 'radiologie', label: 'Radiologie', category: 'Diagnostic' },
    { value: 'medecine_nucleaire', label: 'Médecine nucléaire', category: 'Diagnostic' },
    { value: 'anatomie_pathologique', label: 'Anatomie pathologique', category: 'Diagnostic' },
    { value: 'biologie_medicale', label: 'Biologie médicale', category: 'Diagnostic' },

    // Anesthésie et réanimation
    { value: 'anesthesie_reanimation', label: 'Anesthésie-réanimation', category: 'Urgence' },
    { value: 'medecine_urgence', label: 'Médecine d\'urgence', category: 'Urgence' },
    { value: 'reanimation', label: 'Réanimation', category: 'Urgence' },

    // Autres spécialités
    { value: 'allergologie', label: 'Allergologie', category: 'Autre' },
    { value: 'medecine_physique', label: 'Médecine physique et réadaptation', category: 'Autre' },
    { value: 'medecine_travail', label: 'Médecine du travail', category: 'Autre' },
    { value: 'medecine_sport', label: 'Médecine du sport', category: 'Autre' },
    { value: 'nutrition', label: 'Nutrition', category: 'Autre' },
    { value: 'addictologie', label: 'Addictologie', category: 'Autre' },
    { value: 'genetique', label: 'Génétique médicale', category: 'Autre' }
];

// === UTILITY FUNCTIONS ===
function getSpecialtyLabel(value) {
    const specialty = MEDICAL_SPECIALTIES.find(s => s.value === value);
    return specialty ? specialty.label : value;
}

function getSpecialtiesByCategory() {
    const grouped = {};
    MEDICAL_SPECIALTIES.forEach(specialty => {
        if (!grouped[specialty.category]) {
            grouped[specialty.category] = [];
        }
        grouped[specialty.category].push(specialty);
    });
    return grouped;
}

function searchSpecialties(query) {
    const lowerQuery = query.toLowerCase();
    return MEDICAL_SPECIALTIES.filter(s =>
        s.label.toLowerCase().includes(lowerQuery) ||
        s.value.toLowerCase().includes(lowerQuery)
    );
}

function getSpecialtyByValue(value) {
    return MEDICAL_SPECIALTIES.find(s => s.value === value);
}

// === RENDER FUNCTIONS ===
function renderSpecialtySelect(selectElement, selectedValue = null) {
    const grouped = getSpecialtiesByCategory();

    // Clear existing options
    selectElement.innerHTML = '<option value="">Sélectionner une spécialité</option>';

    // Add grouped options
    Object.keys(grouped).sort().forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        grouped[category].forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty.value;
            option.textContent = specialty.label;
            if (selectedValue === specialty.value) {
                option.selected = true;
            }
            optgroup.appendChild(option);
        });

        selectElement.appendChild(optgroup);
    });
}

// Export for global access
window.Specialties = {
    MEDICAL_SPECIALTIES,
    getSpecialtyLabel,
    getSpecialtiesByCategory,
    searchSpecialties,
    getSpecialtyByValue,
    renderSpecialtySelect
};

console.log('🏥 Medical specialties loaded:', MEDICAL_SPECIALTIES.length);
