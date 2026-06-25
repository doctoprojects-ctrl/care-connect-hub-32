// Centralized translation dictionary for English / French.
// Add new keys here as you translate more screens.

export const translations = {
  en: {
    // App / shell
    app_title: 'Medical Practice Management System',
    app_short: 'MediCare PMS',
    welcome: 'Welcome,',
    logout: 'Log out',
    notifications: 'Notifications',
    language: 'Language',

    // Auth
    login_title: 'Medical Practice System',
    login_subtitle: 'Enter your username and PIN to access the system',
    username: 'Username',
    pin: 'PIN',
    username_placeholder: 'Enter username',
    pin_placeholder: 'Enter PIN',
    login: 'Login',
    logging_in: 'Logging in...',
    login_success_title: 'Login successful',
    login_success_desc: 'Welcome to the Medical Practice Management System',
    login_failed_title: 'Login failed',
    login_failed_desc: 'Invalid username or PIN. Please try again.',
    login_error_title: 'Login error',
    login_error_desc: 'An error occurred during login. Please try again.',
    demo_users: 'Demo Users:',

    // Sidebar / nav
    nav_dashboard: 'Dashboard',
    nav_patients: 'Patients',
    nav_my_patients: 'My Patients',
    nav_appointments: 'Appointments',
    nav_my_appointments: 'My Appointments',
    nav_calendar: 'Calendar View',
    nav_pharmacy: 'Pharmacy',
    nav_equipment: 'Equipment',
    nav_invoices: 'Invoices',
    nav_credits: 'Patient Credits',
    nav_statements: 'Statements',
    nav_services: 'Service Prices',
    nav_cashup: 'Cash Up',
    nav_reports: 'Reports',
    nav_users: 'User Management',
    nav_doctors: 'Doctors',
    nav_qr: 'QR Generator',
    nav_settings: 'Settings',
    nav_profile: 'My Profile',
    nav_manual: 'User Manual',
    nav_queue: 'Queue',
    nav_ads: 'Advertisements',

    // Dashboard
    dashboard_welcome: 'Welcome to your medical practice management system',
    stat_total_patients: 'Total Patients',
    stat_today_appts: "Today's Appointments",
    stat_confirmed_appts: 'Confirmed Appointments',
    stat_pending_appts: 'Pending Appointments',
    recent_activity: 'Recent Activity',
    upcoming_appts: 'Upcoming Appointments',
    quick_actions: 'Quick Actions',
    qa_add_patient: 'Add New Patient',
    qa_book_appt: 'Book Appointment',
    qa_generate_qr: 'Generate QR Code',
    qa_view_reports: 'View Reports',

    // Generic
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    print: 'Print',
    search: 'Search',
    loading: 'Loading...',
    not_found_title: 'Page not found',
    not_found_desc: 'The page you are looking for does not exist.',
    go_home: 'Go to dashboard',

    // Manual
    manual_title: 'User Manual',
    manual_intro:
      'This guide explains the main features of the system for each role. Use the sidebar to navigate between modules.',
    manual_admin_h: 'Administrator',
    manual_admin_b:
      'Full access. Manage users, services, equipment, view all reports, run cash-ups and supervise the pharmacy.',
    manual_doctor_h: 'Doctor',
    manual_doctor_b:
      'View your appointments and patients, capture vitals, write consultation notes, prescriptions and medical certificates.',
    manual_reception_h: 'Reception',
    manual_reception_b:
      'Register patients, book appointments (a charge is created automatically), accept payments and manage credits & statements.',
    manual_cashier_h: 'Pharmacy Cashier',
    manual_cashier_b:
      'Sell pharmacy items, scan barcodes, collect patient invoice payments and perform shift cash-up.',
    manual_supervisor_h: 'Pharmacy Supervisor',
    manual_supervisor_b:
      'Receive stock (GRV), create items with new or existing barcodes, balance the pharmacy and view reports.',
    manual_lang_h: 'Language',
    manual_lang_b:
      'Use the EN / FR switch in the top bar to toggle the interface between English and French at any time.',
  },

  fr: {
    // App / shell
    app_title: 'Système de Gestion de Cabinet Médical',
    app_short: 'MediCare PMS',
    welcome: 'Bienvenue,',
    logout: 'Déconnexion',
    notifications: 'Notifications',
    language: 'Langue',

    // Auth
    login_title: 'Système Médical',
    login_subtitle: "Entrez votre nom d'utilisateur et votre code PIN pour accéder au système",
    username: "Nom d'utilisateur",
    pin: 'Code PIN',
    username_placeholder: "Entrez le nom d'utilisateur",
    pin_placeholder: 'Entrez le code PIN',
    login: 'Connexion',
    logging_in: 'Connexion en cours...',
    login_success_title: 'Connexion réussie',
    login_success_desc: 'Bienvenue dans le système de gestion du cabinet médical',
    login_failed_title: 'Échec de la connexion',
    login_failed_desc: "Nom d'utilisateur ou PIN invalide. Veuillez réessayer.",
    login_error_title: 'Erreur de connexion',
    login_error_desc: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
    demo_users: 'Utilisateurs de démo :',

    // Sidebar / nav
    nav_dashboard: 'Tableau de bord',
    nav_patients: 'Patients',
    nav_my_patients: 'Mes patients',
    nav_appointments: 'Rendez-vous',
    nav_my_appointments: 'Mes rendez-vous',
    nav_calendar: 'Calendrier',
    nav_pharmacy: 'Pharmacie',
    nav_equipment: 'Équipements',
    nav_invoices: 'Factures',
    nav_credits: 'Crédits patients',
    nav_statements: 'Relevés',
    nav_services: 'Tarifs des services',
    nav_cashup: 'Clôture de caisse',
    nav_reports: 'Rapports',
    nav_users: 'Gestion des utilisateurs',
    nav_doctors: 'Médecins',
    nav_qr: 'Générateur QR',
    nav_settings: 'Paramètres',
    nav_profile: 'Mon profil',
    nav_manual: "Manuel d'utilisation",

    // Dashboard
    dashboard_welcome: 'Bienvenue dans votre système de gestion du cabinet médical',
    stat_total_patients: 'Total des patients',
    stat_today_appts: "Rendez-vous d'aujourd'hui",
    stat_confirmed_appts: 'Rendez-vous confirmés',
    stat_pending_appts: 'Rendez-vous en attente',
    recent_activity: 'Activité récente',
    upcoming_appts: 'Prochains rendez-vous',
    quick_actions: 'Actions rapides',
    qa_add_patient: 'Ajouter un nouveau patient',
    qa_book_appt: 'Prendre un rendez-vous',
    qa_generate_qr: 'Générer un code QR',
    qa_view_reports: 'Voir les rapports',

    // Generic
    save: 'Enregistrer',
    cancel: 'Annuler',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    print: 'Imprimer',
    search: 'Rechercher',
    loading: 'Chargement...',
    not_found_title: 'Page introuvable',
    not_found_desc: "La page que vous recherchez n'existe pas.",
    go_home: 'Aller au tableau de bord',

    // Manual
    manual_title: "Manuel d'utilisation",
    manual_intro:
      'Ce guide présente les principales fonctionnalités du système pour chaque rôle. Utilisez la barre latérale pour naviguer entre les modules.',
    manual_admin_h: 'Administrateur',
    manual_admin_b:
      "Accès complet. Gère les utilisateurs, les services, les équipements, consulte tous les rapports, effectue les clôtures de caisse et supervise la pharmacie.",
    manual_doctor_h: 'Médecin',
    manual_doctor_b:
      "Consultez vos rendez-vous et patients, saisissez les constantes, rédigez les notes de consultation, ordonnances et certificats médicaux.",
    manual_reception_h: 'Réception',
    manual_reception_b:
      "Enregistrez les patients, prenez les rendez-vous (une facture est créée automatiquement), encaissez les paiements et gérez les crédits et relevés.",
    manual_cashier_h: 'Caissier(ère) Pharmacie',
    manual_cashier_b:
      "Vendez des articles de pharmacie, scannez les codes-barres, encaissez les factures patients et effectuez la clôture de caisse à la fin du service.",
    manual_supervisor_h: 'Superviseur Pharmacie',
    manual_supervisor_b:
      "Réceptionnez la marchandise (BRG), créez des articles avec un code-barres existant ou généré, équilibrez la pharmacie et consultez les rapports.",
    manual_lang_h: 'Langue',
    manual_lang_b:
      "Utilisez le sélecteur EN / FR dans la barre supérieure pour basculer l'interface entre l'anglais et le français à tout moment.",
  },
} as const;

export type TranslationKey = keyof typeof translations['en'];