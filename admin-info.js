// ========================================
// PHARMACY ADMIN - INFORMATION PAGE - SUPABASE INTEGRATION
// ========================================

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
let currentPharmacyId = null;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', async () => {
    // Setup tabs
    setupTabs();

    // Generate hours form
    generateHoursForm();

    // Load pharmacy data from Supabase
    await loadPharmacyInfo();

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
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await window.supabaseAPI.signOut();
        window.location.href = 'admin-login.html';
    });
}

// === LOAD PHARMACY INFO FROM SUPABASE ===
async function loadPharmacyInfo() {
    try {
        // Get current user
        const user = await window.supabaseAPI.getCurrentUser();
        if (!user) {
            window.location.href = 'admin-login.html';
            return;
        }

        // Get pharmacy for current user
        const pharmacy = await window.supabaseAPI.getPharmacyByUserId(user.id);
        if (!pharmacy) {
            showToast('Aucune pharmacie associée à cet utilisateur', 'error');
            return;
        }

        currentPharmacyId = pharmacy.id;

        // Map Supabase data to UI format
        const data = mapSupabaseToUI(pharmacy);

        populateForms(data);
        console.log('✅ Pharmacy info loaded from Supabase');
    } catch (error) {
        console.error('Error loading pharmacy info:', error);
        showToast('Erreur lors du chargement des informations', 'error');
    }
}

// === MAP SUPABASE DATA TO UI FORMAT ===
function mapSupabaseToUI(pharmacy) {
    // Parse hours from JSONB if exists
    let hours = {};
    if (pharmacy.opening_hours) {
        try {
            const hoursData = typeof pharmacy.opening_hours === 'string'
                ? JSON.parse(pharmacy.opening_hours)
                : pharmacy.opening_hours;

            // Convert to UI format
            Object.keys(hoursData).forEach(day => {
                const dayNum = parseInt(day);
                hours[dayNum] = {
                    open: hoursData[day].open || false,
                    open_time: hoursData[day].open_time || '08:00',
                    close_time: hoursData[day].close_time || '19:00'
                };
            });
        } catch (e) {
            console.warn('Error parsing hours:', e);
        }
    }

    // Default hours if none exist
    if (Object.keys(hours).length === 0) {
        for (let i = 0; i < 7; i++) {
            hours[i] = {
                open: i < 6, // Mon-Sat open by default
                open_time: '08:00',
                close_time: '19:00'
            };
        }
    }

    // Parse services from JSONB array to object
    let services = {
        night_shift: false,
        delivery: false,
        parking: pharmacy.has_parking || false,
        credit_card: false,
        tiers_payant: false,
        covid_tests: false
    };

    if (pharmacy.services) {
        try {
            const servicesArray = typeof pharmacy.services === 'string'
                ? JSON.parse(pharmacy.services)
                : pharmacy.services;

            if (Array.isArray(servicesArray)) {
                servicesArray.forEach(service => {
                    services[service] = true;
                });
            }
        } catch (e) {
            console.warn('Error parsing services:', e);
        }
    }

    return {
        name: pharmacy.name || '',
        registration_number: pharmacy.registration_number || '',
        address: pharmacy.address || '',
        city: pharmacy.city || '',
        postal_code: pharmacy.postal_code || '',
        description: pharmacy.description || '',
        latitude: pharmacy.latitude || null,
        longitude: pharmacy.longitude || null,
        phone: pharmacy.phone || '',
        email: pharmacy.email || '',
        website: pharmacy.website || '',
        facebook: pharmacy.facebook || '',
        hours: hours,
        night_shift: pharmacy.is_open_24_7 || false,
        special_notes: pharmacy.special_notes || '',
        services: services
    };
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
    // Hours in UI format
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

    // Services as array
    const services = [];
    if (document.getElementById('serviceNightShift').checked) services.push('night_shift');
    if (document.getElementById('serviceDelivery').checked) services.push('delivery');
    if (document.getElementById('serviceParking').checked) services.push('parking');
    if (document.getElementById('serviceCreditCard').checked) services.push('credit_card');
    if (document.getElementById('serviceTiersPayant').checked) services.push('tiers_payant');
    if (document.getElementById('serviceCovidTests').checked) services.push('covid_tests');

    return {
        name: document.getElementById('pharmacyNameInput').value,
        registration_number: document.getElementById('registrationNumber').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postal_code: document.getElementById('postalCode').value || null,
        description: document.getElementById('description').value || null,
        latitude: parseFloat(document.getElementById('latitude').value) || null,
        longitude: parseFloat(document.getElementById('longitude').value) || null,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        website: document.getElementById('website').value || null,
        facebook: document.getElementById('facebook').value || null,
        opening_hours: hours, // This will be stored as JSONB
        is_open_24_7: document.getElementById('nightShift').checked,
        special_notes: document.getElementById('specialNotes').value || null,
        services: services, // This will be stored as JSONB array
        has_parking: services.includes('parking')
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

// === SAVE ALL INFO TO SUPABASE ===
async function saveAllInfo() {
    try {
        if (!currentPharmacyId) {
            showToast('Aucune pharmacie sélectionnée', 'error');
            return;
        }

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

        // Save to Supabase using updatePharmacy RPC
        const result = await window.supabaseAPI.updatePharmacy(currentPharmacyId, data);

        if (!result.success) {
            throw new Error(result.error);
        }

        // Update sidebar
        document.getElementById('pharmacyName').textContent = data.name;
        document.getElementById('pharmacyEmail').textContent = data.email;

        // Show success
        showToast('Modifications enregistrées avec succès !', 'success');

        // Restore button
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;

        console.log('✅ Pharmacy info saved to Supabase');

    } catch (error) {
        console.error('Error saving pharmacy info:', error);
        showToast('Erreur lors de l\'enregistrement: ' + error.message, 'error');

        // Restore button
        const saveBtn = document.getElementById('saveAllBtn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = saveBtn.dataset.originalText || 'Enregistrer les modifications';
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

console.log('💊 Pharmacy Info Page initialized with Supabase');
