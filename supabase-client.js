// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================

// Load environment variables from .env.local
const SUPABASE_URL = 'https://jdsjpdpdcbbphelrohjr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkc2pwZHBkY2JicGhlbHJvaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDc3MzUsImV4cCI6MjA4MDUyMzczNX0.0n_xBZWVcR_Y93UC00Pspbov23Df6v3_xffoITDhOJg';

// Initialize Supabase client with error handling
let supabase;
try {
    if (!window.supabase) {
        throw new Error('Supabase library not loaded. Please ensure the Supabase script is loaded before supabase-client.js');
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
} catch (error) {
    console.error('❌ Erreur d\'initialisation:', error.message);
    // Create a dummy supabase object to prevent further errors
    supabase = null;
}

// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// Helper function to check if Supabase is initialized
function checkSupabaseInitialized() {
    if (!supabase) {
        const errorMsg = 'Erreur d\'initialisation: Supabase n\'est pas initialisé. Veuillez recharger la page.';
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
}

async function signUp(email, password, userData) {
    checkSupabaseInitialized();
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData
        }
    });

    if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
}

async function signIn(email, password) {
    checkSupabaseInitialized();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
}

async function signOut() {
    checkSupabaseInitialized();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function getCurrentUser() {
    checkSupabaseInitialized();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ========================================
// PHARMACIES FUNCTIONS
// ========================================

async function getPharmacies(filters = {}) {
    let query = supabase
        .from('pharmacies')
        .select('*');

    if (filters.city) {
        query = query.eq('city', filters.city);
    }

    if (filters.is_open_24_7) {
        query = query.eq('is_open_24_7', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching pharmacies:', error);
        return [];
    }

    return data;
}

async function getPharmacyById(id) {
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching pharmacy:', error);
        return null;
    }

    return data;
}

async function getPharmacyByUserId(userId) {
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching pharmacy by user:', error);
        return null;
    }

    return data;
}

async function createPharmacyWithUser(userId, pharmacyData) {
    const { data, error } = await supabase.rpc('create_pharmacy_with_user', {
        p_user_id: userId,
        p_pharmacy_name: pharmacyData.name,
        p_address: pharmacyData.address,
        p_city: pharmacyData.city,
        p_phone: pharmacyData.phone,
        p_postal_code: pharmacyData.postal_code || null,
        p_email: pharmacyData.email || null,
        p_latitude: pharmacyData.latitude || null,
        p_longitude: pharmacyData.longitude || null,
        p_is_open_24_7: pharmacyData.is_open_24_7 || false,
        p_has_parking: pharmacyData.has_parking || false
    });

    if (error) {
        console.error('Error creating pharmacy with user:', error);
        return { success: false, error: error.message };
    }

    return { success: true, pharmacyId: data };
}

async function createPharmacyStandalone(pharmacyData) {
    const { data, error } = await supabase.rpc('create_pharmacy_standalone', {
        p_pharmacy_name: pharmacyData.name,
        p_address: pharmacyData.address,
        p_city: pharmacyData.city,
        p_phone: pharmacyData.phone,
        p_postal_code: pharmacyData.postal_code || null,
        p_email: pharmacyData.email || null,
        p_latitude: pharmacyData.latitude || null,
        p_longitude: pharmacyData.longitude || null,
        p_is_open_24_7: pharmacyData.is_open_24_7 || false,
        p_has_parking: pharmacyData.has_parking || false
    });

    if (error) {
        console.error('Error creating standalone pharmacy:', error);
        return { success: false, error: error.message };
    }

    return { success: true, pharmacyId: data };
}

async function updatePharmacy(pharmacyId, updates) {
    const { data, error } = await supabase.rpc('update_pharmacy', {
        p_pharmacy_id: pharmacyId,
        p_name: updates.name || null,
        p_address: updates.address || null,
        p_city: updates.city || null,
        p_postal_code: updates.postal_code || null,
        p_phone: updates.phone || null,
        p_email: updates.email || null,
        p_latitude: updates.latitude || null,
        p_longitude: updates.longitude || null,
        p_is_open_24_7: updates.is_open_24_7 !== undefined ? updates.is_open_24_7 : null,
        p_has_parking: updates.has_parking !== undefined ? updates.has_parking : null
    });

    if (error) {
        console.error('Error updating pharmacy:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function assignUserToPharmacy(pharmacyId, userId) {
    const { data, error } = await supabase.rpc('assign_user_to_pharmacy', {
        p_pharmacy_id: pharmacyId,
        p_user_id: userId
    });

    if (error) {
        console.error('Error assigning user to pharmacy:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function removeUserFromPharmacy(pharmacyId) {
    const { data, error } = await supabase.rpc('remove_user_from_pharmacy', {
        p_pharmacy_id: pharmacyId
    });

    if (error) {
        console.error('Error removing user from pharmacy:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function deletePharmacy(pharmacyId) {
    const { data, error } = await supabase.rpc('delete_pharmacy', {
        p_pharmacy_id: pharmacyId
    });

    if (error) {
        console.error('Error deleting pharmacy:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function getPharmaciesStats() {
    const { data, error } = await supabase.rpc('get_pharmacies_stats');

    if (error) {
        console.error('Error fetching pharmacies stats:', error);
        return null;
    }

    return data && data.length > 0 ? data[0] : null;
}

async function searchPharmaciesByProduct(productName, location) {
    // Search for pharmacies that have the product in stock
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            pharmacies (*)
        `)
        .ilike('name', `%${productName}%`)
        .eq('stock_status', 'in_stock');

    if (error) {
        console.error('Error searching pharmacies:', error);
        return [];
    }

    return data;
}


// ========================================
// HEALTH CENTERS FUNCTIONS
// ========================================

async function getHealthCenters(filters = {}) {
    let query = supabase
        .from('health_centers')
        .select('*');

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.city) {
        query = query.eq('city', filters.city);
    }

    if (filters.has_emergency) {
        query = query.eq('has_emergency', true);
    }

    if (filters.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
    }

    if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
    }

    // For public pages, only show approved and active centers
    if (filters.publicOnly) {
        query = query.eq('is_approved', true).eq('is_active', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching health centers:', error);
        return [];
    }

    return data;
}

async function getHealthCenterById(id) {
    const { data, error } = await supabase
        .from('health_centers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching health center:', error);
        return null;
    }

    return data;
}

async function createHealthCenter(centerData) {
    const { data, error } = await supabase
        .from('health_centers')
        .insert([centerData])
        .select();

    if (error) {
        console.error('Error creating health center:', error);
        return { success: false, error: error.message };
    }

    return { success: true, center: data[0] };
}

async function updateHealthCenter(centerId, updates) {
    const { data, error } = await supabase
        .from('health_centers')
        .update(updates)
        .eq('id', centerId)
        .select();

    if (error) {
        console.error('Error updating health center:', error);
        return { success: false, error: error.message };
    }

    return { success: true, center: data[0] };
}

async function deleteHealthCenter(centerId) {
    const { error } = await supabase
        .from('health_centers')
        .delete()
        .eq('id', centerId);

    if (error) {
        console.error('Error deleting health center:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function approveHealthCenter(centerId, adminId) {
    const { data, error } = await supabase.rpc('approve_health_center', {
        p_health_center_id: centerId,
        p_admin_id: adminId
    });

    if (error) {
        console.error('Error approving health center:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function toggleHealthCenterStatus(centerId, isActive, adminId) {
    const { data, error } = await supabase.rpc('toggle_health_center_status', {
        p_health_center_id: centerId,
        p_is_active: isActive,
        p_admin_id: adminId
    });

    if (error) {
        console.error('Error toggling health center status:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function changeHealthCenterManager(centerId, newManagerId, adminId) {
    const { data, error } = await supabase.rpc('change_health_center_manager', {
        p_health_center_id: centerId,
        p_new_manager_id: newManagerId,
        p_admin_id: adminId
    });

    if (error) {
        console.error('Error changing health center manager:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}


// ========================================
// DOCTORS FUNCTIONS
// ========================================

async function getDoctors(filters = {}) {
    let query = supabase
        .from('doctors')
        .select('*');

    if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
    }

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.accepts_new_patients) {
        query = query.eq('accepts_new_patients', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }

    return data;
}

async function getDoctorById(id) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching doctor:', error);
        return null;
    }

    return data;
}

// ========================================
// APPOINTMENTS FUNCTIONS
// ========================================

async function createAppointment(appointmentData) {
    const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();

    if (error) {
        console.error('Error creating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function getAppointmentsByDoctor(doctorId) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }

    return data;
}

async function updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await supabase
        .from('appointments')
        .update({ status: status })
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function deleteAppointment(appointmentId) {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ========================================
// APPOINTMENTS RPC FUNCTIONS (FOR BOOKING SYSTEM)
// ========================================

async function getAvailableSlots(doctorId, date) {
    const { data, error } = await supabase.rpc('get_available_slots', {
        p_doctor_id: doctorId,
        p_date: date
    });

    if (error) {
        console.error('Error fetching available slots:', error);
        return [];
    }

    return data || [];
}

async function bookAppointment(doctorId, appointmentData) {
    const { data, error } = await supabase.rpc('create_appointment_with_validation', {
        p_doctor_id: doctorId,
        p_patient_name: appointmentData.patient_name,
        p_patient_phone: appointmentData.patient_phone,
        p_patient_email: appointmentData.patient_email || null,
        p_appointment_date: appointmentData.appointment_date,
        p_appointment_time: appointmentData.appointment_time,
        p_type: appointmentData.type || 'Consultation générale',
        p_reason: appointmentData.reason || null,
        p_patient_id: appointmentData.patient_id || null,
        p_created_by: appointmentData.created_by || null
    });

    if (error) {
        console.error('Error booking appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointmentId: data };
}

async function confirmAppointmentRPC(appointmentId, userId) {
    const { data, error } = await supabase.rpc('confirm_appointment', {
        p_appointment_id: appointmentId,
        p_user_id: userId
    });

    if (error) {
        console.error('Error confirming appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function cancelAppointmentRPC(appointmentId, userId, reason = null) {
    const { data, error } = await supabase.rpc('cancel_appointment', {
        p_appointment_id: appointmentId,
        p_user_id: userId,
        p_reason: reason
    });

    if (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function completeAppointmentRPC(appointmentId, doctorUserId, notes = null) {
    const { data, error } = await supabase.rpc('complete_appointment', {
        p_appointment_id: appointmentId,
        p_doctor_user_id: doctorUserId,
        p_notes: notes
    });

    if (error) {
        console.error('Error completing appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function getAppointmentStats(doctorId) {
    const { data, error } = await supabase.rpc('get_doctor_appointment_stats', {
        p_doctor_id: doctorId
    });

    if (error) {
        console.error('Error fetching appointment stats:', error);
        return {
            today_appointments: 0,
            week_appointments: 0,
            month_appointments: 0,
            pending_appointments: 0,
            upcoming_appointments: 0
        };
    }

    return data[0] || {};
}

async function getMyAppointments() {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            doctors (
                id,
                first_name,
                last_name,
                specialties,
                health_center_id,
                health_centers (
                    name,
                    address,
                    city
                )
            )
        `)
        .or(`patient_id.eq.${user.id},created_by.eq.${user.id}`)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching my appointments:', error);
        return [];
    }

    return data || [];
}

async function getUpcomingAppointments(doctorId) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching upcoming appointments:', error);
        return [];
    }

    return data || [];
}

// ========================================
// PRODUCTS FUNCTIONS
// ========================================

async function getProductsByPharmacy(pharmacyId) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('pharmacy_id', pharmacyId);

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

async function updateProduct(productId, updates) {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select();

    if (error) {
        console.error('Error updating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product: data[0] };
}

async function createProduct(productData) {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
    }

    return { success: true, product: data[0] };
}

async function deleteProduct(productId) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// ========================================
// REVIEWS FUNCTIONS
// ========================================

async function getReviews(entityType, entityId) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data;
}

async function createReview(reviewData) {
    const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select();

    if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: error.message };
    }

    return { success: true, review: data[0] };
}

// ========================================
// PATIENTS FUNCTIONS
// ========================================

async function getPatientsByDoctor(doctorId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('last_visit', { ascending: false });

    if (error) {
        console.error('Error fetching patients:', error);
        return [];
    }

    return data;
}

async function createPatient(patientData) {
    const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select();

    if (error) {
        console.error('Error creating patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, patient: data[0] };
}

async function updatePatient(patientId, updates) {
    const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select();

    if (error) {
        console.error('Error updating patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true, patient: data[0] };
}

async function deletePatient(patientId) {
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

    if (error) {
        console.error('Error deleting patient:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

async function getPatientById(patientId) {
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

    if (error) {
        console.error('Error fetching patient:', error);
        return null;
    }

    return data;
}

// ========================================
// ENHANCED APPOINTMENTS FUNCTIONS
// ========================================

async function updateAppointment(appointmentId, updates) {
    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select();

    if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true, appointment: data[0] };
}

async function getAppointmentsByDateRange(doctorId, startDate, endDate) {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments by date range:', error);
        return [];
    }

    return data;
}

// ========================================
// DOCTOR PROFILE FUNCTIONS
// ========================================

async function getDoctorProfile(doctorId) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

    if (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
    }

    return data;
}

async function getDoctorProfileByUserId(userId) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching doctor profile by user ID:', error);
        return null;
    }

    return data;
}

async function updateDoctorProfile(doctorId, profileData) {
    const { data, error } = await supabase
        .from('doctors')
        .update(profileData)
        .eq('id', doctorId)
        .select();

    if (error) {
        console.error('Error updating doctor profile:', error);
        return { success: false, error: error.message };
    }

    return { success: true, profile: data[0] };
}

// Export functions
window.supabaseAPI = {
    // Auth
    signUp,
    signIn,
    signOut,
    getCurrentUser,

    // Pharmacies
    getPharmacies,
    getPharmacyById,
    getPharmacyByUserId,
    createPharmacyWithUser,
    createPharmacyStandalone,
    updatePharmacy,
    assignUserToPharmacy,
    removeUserFromPharmacy,
    deletePharmacy,
    getPharmaciesStats,
    searchPharmaciesByProduct,

    // Health Centers
    getHealthCenters,
    getHealthCenterById,
    createHealthCenter,
    updateHealthCenter,
    deleteHealthCenter,
    approveHealthCenter,
    toggleHealthCenterStatus,
    changeHealthCenterManager,

    // Doctors
    getDoctors,
    getDoctorById,
    getDoctorProfile,
    getDoctorProfileByUserId,
    updateDoctorProfile,

    // Appointments
    createAppointment,
    getAppointmentsByDoctor,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange,
    // Appointment RPC (Booking System)
    getAvailableSlots,
    bookAppointment,
    confirmAppointmentRPC,
    cancelAppointmentRPC,
    completeAppointmentRPC,
    getAppointmentStats,
    getMyAppointments,
    getUpcomingAppointments,

    // Patients
    getPatientsByDoctor,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,

    // Products
    getProductsByPharmacy,
    updateProduct,
    createProduct,
    deleteProduct,

    // Reviews
    getReviews,
    createReview
};

console.log('✅ Supabase API initialized');
