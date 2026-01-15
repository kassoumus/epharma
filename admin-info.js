// ========================================
// PHARMACY ADMIN - INFORMATION PAGE
// ========================================

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication (optional - allow page to work for testing)
    try {
        if (typeof requirePharmacyAuth === 'function') {
            const session = requirePharmacyAuth();
            if (!session) {
                console.warn('No pharmacy session found, using demo mode');
            }
        }
    } catch (error) {
        console.warn('Authentication check failed, using demo mode:', error);
    }

    // Setup tabs
    setupTabs();

    // Generate hours form
    generateHoursForm();

    // Load pharmacy data
    loadPharmacyInfo();

    // Setup event listeners
    setupEventListeners();
});

// === SETUP TABS ===
function setupTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// === GENERATE HOURS FORM ===
function generateHoursForm() {
    const hoursGrid = document.getElementById('hoursGrid');
    hoursGrid.innerHTML = '';

    DAYS_OF_WEEK.forEach((day, index) => {
        const dayRow = document.createElement('div');
        dayRow.className = 'hours-row';
        dayRow.innerHTML = `
            <div class="hours-day">
                <label class="admin-checkbox">
                    <input type="checkbox" id="open_${index}" class="day-open-checkbox" data-day="${index}">
                    <span>${day}</span>
                </label>
            </div>
            <div class="hours-times" id="times_${index}">
                <div class="hours-time-group">
                    <label>Ouverture</label>
                    <input type="time" id="open_time_${index}" class="admin-form-input" value="08:00">
                </div>
                <div class="hours-time-group">
                    <label>Fermeture</label>
                    <input type="time" id="close_time_${index}" class="admin-form-input" value="19:00">
                </div>
            </div>
        `;
        hoursGrid.appendChild(dayRow);

        // Toggle times visibility
        const checkbox = dayRow.querySelector('.day-open-checkbox');
        const timesDiv = dayRow.querySelector('.hours-times');

        checkbox.addEventListener('change', () => {
            timesDiv.style.display = checkbox.checked ? 'flex' : 'none';
        });

        // Default: all days open
        checkbox.checked = index < 6; // Monday to Saturday
        timesDiv.style.display = checkbox.checked ? 'flex' : 'none';
    });
}

// === SETUP EVENT LISTENERS ===
function setupEventListeners() {
    // Save button
    document.getElementById('saveAllBtn').addEventListener('click', saveAllInfo);

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (typeof logout === 'function') {
            logout();
        }
        window.location.href = 'admin-login.html';
    });
}

// === LOAD PHARMACY INFO ===
async function loadPharmacyInfo() {
    try {
        const pharmacyId = getPharmacyId();

        // In production, fetch from Supabase
        // const { data, error } = await supabase
        //     .from('pharmacies')
        //     .select('*')
        //     .eq('id', pharmacyId)
        //     .single();

        // Mock data for now
        const data = {
            name: 'Pharmacie de la République',
            registration_number: 'PH-NIA-2024-001',
            address: '45 Avenue de la République',
            city: 'Niamey',
            postal_code: '',
            description: 'Pharmacie moderne au cœur de Niamey, offrant un service de qualité et des conseils personnalisés.',
            latitude: 13.5137,
            longitude: 2.1098,
            phone: '(+227) 20 35 01 99',
            email: 'contact@pharmacie-republique.ne',
            website: 'https://www.pharmacie-republique.ne',
            facebook: '@pharmacierepublique',
            hours: {
                0: { open: true, open_time: '08:00', close_time: '20:00' },
                1: { open: true, open_time: '08:00', close_time: '20:00' },
                2: { open: true, open_time: '08:00', close_time: '20:00' },
                3: { open: true, open_time: '08:00', close_time: '20:00' },
                4: { open: true, open_time: '08:00', close_time: '20:00' },
                5: { open: true, open_time: '09:00', close_time: '19:00' },
                6: { open: false, open_time: '', close_time: '' }
            },
            night_shift: true,
            special_notes: 'Garde le dimanche sur rendez-vous',
            services: {
                night_shift: true,
                delivery: true,
                parking: true,
                credit_card: true,
                tiers_payant: true,
                covid_tests: false
            }
        };

        populateForms(data);
    } catch (error) {
        console.error('Error loading pharmacy info:', error);
        showToast('Erreur lors du chargement des informations', 'error');
    }
}

// === POPULATE FORMS ===
function populateForms(data) {
    // General info
    document.getElementById('pharmacyNameInput').value = data.name || '';
    document.getElementById('registrationNumber').value = data.registration_number || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('city').value = data.city || '';
    document.getElementById('postalCode').value = data.postal_code || '';
    document.getElementById('description').value = data.description || '';
    document.getElementById('latitude').value = data.latitude || '';
    document.getElementById('longitude').value = data.longitude || '';

    // Contact info
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('website').value = data.website || '';
    document.getElementById('facebook').value = data.facebook || '';

    // Hours
    if (data.hours) {
        Object.keys(data.hours).forEach(dayIndex => {
            const dayData = data.hours[dayIndex];
            const checkbox = document.getElementById(`open_${dayIndex}`);
            const openTime = document.getElementById(`open_time_${dayIndex}`);
            const closeTime = document.getElementById(`close_time_${dayIndex}`);
            const timesDiv = document.getElementById(`times_${dayIndex}`);

            if (checkbox && openTime && closeTime) {
                checkbox.checked = dayData.open;
                openTime.value = dayData.open_time || '08:00';
                closeTime.value = dayData.close_time || '19:00';
                timesDiv.style.display = dayData.open ? 'flex' : 'none';
            }
        });
    }

    document.getElementById('nightShift').checked = data.night_shift || false;
    document.getElementById('specialNotes').value = data.special_notes || '';

    // Services
    if (data.services) {
        document.getElementById('serviceNightShift').checked = data.services.night_shift || false;
        document.getElementById('serviceDelivery').checked = data.services.delivery || false;
        document.getElementById('serviceParking').checked = data.services.parking || false;
        document.getElementById('serviceCreditCard').checked = data.services.credit_card || false;
        document.getElementById('serviceTiersPayant').checked = data.services.tiers_payant || false;
        document.getElementById('serviceCovidTests').checked = data.services.covid_tests || false;
    }

    // Update sidebar
    document.getElementById('pharmacyName').textContent = data.name;
    document.getElementById('pharmacyEmail').textContent = data.email;
}

// === COLLECT FORM DATA ===
function collectFormData() {
    // General info
    const generalData = {
        name: document.getElementById('pharmacyNameInput').value,
        registration_number: document.getElementById('registrationNumber').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postal_code: document.getElementById('postalCode').value,
        description: document.getElementById('description').value,
        latitude: parseFloat(document.getElementById('latitude').value) || null,
        longitude: parseFloat(document.getElementById('longitude').value) || null
    };

    // Contact info
    const contactData = {
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value,
        facebook: document.getElementById('facebook').value
    };

    // Hours
    const hours = {};
    DAYS_OF_WEEK.forEach((day, index) => {
        const checkbox = document.getElementById(`open_${index}`);
        const openTime = document.getElementById(`open_time_${index}`);
        const closeTime = document.getElementById(`close_time_${index}`);

        hours[index] = {
            open: checkbox.checked,
            open_time: checkbox.checked ? openTime.value : '',
            close_time: checkbox.checked ? closeTime.value : ''
        };
    });

    const hoursData = {
        hours: hours,
        night_shift: document.getElementById('nightShift').checked,
        special_notes: document.getElementById('specialNotes').value
    };

    // Services
    const servicesData = {
        services: {
            night_shift: document.getElementById('serviceNightShift').checked,
            delivery: document.getElementById('serviceDelivery').checked,
            parking: document.getElementById('serviceParking').checked,
            credit_card: document.getElementById('serviceCreditCard').checked,
            tiers_payant: document.getElementById('serviceTiersPayant').checked,
            covid_tests: document.getElementById('serviceCovidTests').checked
        }
    };

    return {
        ...generalData,
        ...contactData,
        ...hoursData,
        ...servicesData
    };
}

// === VALIDATE DATA ===
function validateData(data) {
    const errors = [];

    // Required fields
    if (!data.name) errors.push('Le nom de la pharmacie est requis');
    if (!data.registration_number) errors.push('Le numéro d\'agrément est requis');
    if (!data.address) errors.push('L\'adresse est requise');
    if (!data.city) errors.push('La ville est requise');
    if (!data.phone) errors.push('Le téléphone est requis');
    if (!data.email) errors.push('L\'email est requis');

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
        errors.push('Format d\'email invalide');
    }

    // Display errors
    if (errors.length > 0) {
        alert('Erreurs de validation:\n\n' + errors.join('\n'));
        return false;
    }

    return true;
}

// === SAVE ALL INFO ===
async function saveAllInfo() {
    try {
        // Collect data
        const data = collectFormData();

        // Validate
        if (!validateData(data)) {
            return;
        }

        // Show loading
        const saveBtn = document.getElementById('saveAllBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4"/></svg> Enregistrement...';

        // In production, save to Supabase
        // const pharmacyId = getPharmacyId();
        // const { error } = await supabase
        //     .from('pharmacies')
        //     .update(data)
        //     .eq('id', pharmacyId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update sidebar
        document.getElementById('pharmacyName').textContent = data.name;
        document.getElementById('pharmacyEmail').textContent = data.email;

        // Show success
        showToast('Modifications enregistrées avec succès !', 'success');

        // Restore button
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;

    } catch (error) {
        console.error('Error saving pharmacy info:', error);
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

// === SHOW TOAST ===
function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = 'admin-toast ' + (type === 'error' ? 'error' : 'success');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// === HELPER FUNCTIONS ===
function getPharmacyId() {
    // In production, get from session
    return localStorage.getItem('pharmacyId') || 1;
}

console.log('💊 Pharmacy Info Page initialized');
