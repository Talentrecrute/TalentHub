export type Language = 'fr' | 'en'

export const translations = {
  // Navigation
  nav: {
    home: { fr: 'Accueil', en: 'Home' },
    findJobs: { fr: 'Trouver un emploi', en: 'Find Jobs' },
    dashboard: { fr: 'Tableau de bord', en: 'Dashboard' },
    postJob: { fr: 'Publier une offre', en: 'Post Job' },
    myApplications: { fr: 'Mes candidatures', en: 'My Applications' },
    profile: { fr: 'Profil', en: 'Profile' },
    signIn: { fr: 'Se connecter', en: 'Sign In' },
    signOut: { fr: 'Se déconnecter', en: 'Sign Out' },
  },

  // Common
  common: {
    viewAll: { fr: 'Voir tout', en: 'View All' },
    viewDetails: { fr: 'Voir détails', en: 'View Details' },
    save: { fr: 'Enregistrer', en: 'Save' },
    cancel: { fr: 'Annuler', en: 'Cancel' },
    edit: { fr: 'Modifier', en: 'Edit' },
    delete: { fr: 'Supprimer', en: 'Delete' },
    search: { fr: 'Rechercher', en: 'Search' },
    filter: { fr: 'Filtrer', en: 'Filter' },
    loading: { fr: 'Chargement...', en: 'Loading...' },
    noResults: { fr: 'Aucun résultat', en: 'No results' },
    back: { fr: 'Retour', en: 'Back' },
    next: { fr: 'Suivant', en: 'Next' },
    previous: { fr: 'Précédent', en: 'Previous' },
    submit: { fr: 'Soumettre', en: 'Submit' },
    apply: { fr: 'Postuler', en: 'Apply' },
    close: { fr: 'Fermer', en: 'Close' },
  },

  // Status
  status: {
    pending: { fr: 'En attente', en: 'Pending' },
    reviewed: { fr: 'Examinée', en: 'Reviewed' },
    accepted: { fr: 'Acceptée', en: 'Accepted' },
    rejected: { fr: 'Refusée', en: 'Rejected' },
    open: { fr: 'Ouverte', en: 'Open' },
    closed: { fr: 'Fermée', en: 'Closed' },
  },

  // Dashboard - Candidate
  candidateDashboard: {
    welcome: { fr: 'Bon retour', en: 'Welcome back' },
    overview: { fr: 'Voici votre aperçu de recherche d\'emploi', en: 'Here\'s your job search overview' },
    totalApplications: { fr: 'Total des candidatures', en: 'Total Applications' },
    pendingApplications: { fr: 'En attente', en: 'Pending' },
    savedJobs: { fr: 'Offres sauvegardées', en: 'Saved Jobs' },
    recentApplications: { fr: 'Candidatures récentes', en: 'Recent Applications' },
    completeProfile: { fr: 'Compléter votre profil', en: 'Complete Your Profile' },
    profileCompletion: { fr: 'Votre profil est complété à', en: 'Your profile is' },
    profileCompletionSuffix: { fr: '% . Un profil complet augmente vos chances!', en: '% complete. A complete profile increases your chances!' },
    noApplications: { fr: 'Aucune candidature', en: 'No applications yet' },
    startApplying: { fr: 'Commencez à postuler pour voir vos candidatures ici', en: 'Start applying to jobs to see them here' },
    browseJobs: { fr: 'Parcourir les offres', en: 'Browse Jobs' },
    noSavedJobs: { fr: 'Aucune offre sauvegardée', en: 'No saved jobs' },
    saveTip: { fr: 'Sauvegardez des offres pour les retrouver ici', en: 'Save jobs you\'re interested in to view them here' },
  },

  // Dashboard - Employer
  employerDashboard: {
    welcome: { fr: 'Bon retour', en: 'Welcome back' },
    overview: { fr: 'Gérez vos offres et candidatures', en: 'Manage your jobs and applications' },
    activeJobs: { fr: 'Offres actives', en: 'Active Jobs' },
    totalApplications: { fr: 'Total des candidatures', en: 'Total Applications' },
    newApplications: { fr: 'Nouvelles candidatures', en: 'New Applications' },
    recentJobs: { fr: 'Offres récentes', en: 'Recent Jobs' },
    recentApplications: { fr: 'Candidatures récentes', en: 'Recent Applications' },
    noJobs: { fr: 'Aucune offre publiée', en: 'No jobs posted yet' },
    createFirst: { fr: 'Créez votre première offre pour attirer des talents', en: 'Create your first job to attract talent' },
    postJob: { fr: 'Publier une offre', en: 'Post a Job' },
    viewAllApplications: { fr: 'Voir toutes les candidatures', en: 'View All Applications' },
  },

  // Applications
  applications: {
    title: { fr: 'Candidatures', en: 'Applications' },
    myApplications: { fr: 'Mes candidatures', en: 'My Applications' },
    total: { fr: 'candidature(s) au total', en: 'total application(s)' },
    filterByStatus: { fr: 'Filtrer par statut', en: 'Filter by status' },
    all: { fr: 'Toutes', en: 'All' },
    appliedOn: { fr: 'Postulé le', en: 'Applied on' },
    coverLetter: { fr: 'Lettre de motivation', en: 'Cover Letter' },
    viewJob: { fr: 'Voir l\'offre', en: 'View Job' },
    viewFullProfile: { fr: 'Voir le profil complet', en: 'View full profile' },
    sendEmail: { fr: 'Envoyer un email', en: 'Send Email' },
    updateStatus: { fr: 'Mettre à jour le statut', en: 'Update status' },
    noApplications: { fr: 'Aucune candidature', en: 'No applications' },
    noMatchingFilter: { fr: 'Aucune candidature avec ce statut', en: 'No applications matching this filter' },
    backToDashboard: { fr: 'Retour au tableau de bord', en: 'Back to Dashboard' },
  },

  // Jobs
  jobs: {
    title: { fr: 'Offres d\'emploi', en: 'Jobs' },
    findJob: { fr: 'Trouvez l\'emploi parfait', en: 'Find Your Perfect Job' },
    searchPlaceholder: { fr: 'Rechercher par titre, mot-clé ou entreprise', en: 'Search by title, keyword, or company' },
    jobsFound: { fr: 'offre(s) trouvée(s)', en: 'job(s) found' },
    noJobsFound: { fr: 'Aucune offre trouvée', en: 'No jobs found' },
    adjustFilters: { fr: 'Essayez d\'ajuster vos filtres', en: 'Try adjusting your filters' },
    clearFilters: { fr: 'Effacer les filtres', en: 'Clear Filters' },
    location: { fr: 'Localisation', en: 'Location' },
    remote: { fr: 'Télétravail', en: 'Remote' },
    salary: { fr: 'Salaire', en: 'Salary' },
    jobType: { fr: 'Type de contrat', en: 'Job Type' },
    experience: { fr: 'Expérience', en: 'Experience' },
    category: { fr: 'Catégorie', en: 'Category' },
    applyNow: { fr: 'Postuler maintenant', en: 'Apply Now' },
    saveJob: { fr: 'Sauvegarder', en: 'Save Job' },
    applied: { fr: 'Déjà postulé', en: 'Already Applied' },
    applications: { fr: 'candidature(s)', en: 'application(s)' },
    about: { fr: 'À propos de', en: 'About' },
    requirements: { fr: 'Exigences', en: 'Requirements' },
    responsibilities: { fr: 'Responsabilités', en: 'Responsibilities' },
    benefits: { fr: 'Avantages', en: 'Benefits' },
    similarJobs: { fr: 'Offres similaires', en: 'Similar Jobs' },
    backToJobs: { fr: 'Retour aux offres', en: 'Back to Jobs' },
  },

  // Profile
  profile: {
    title: { fr: 'Profil', en: 'Profile' },
    editProfile: { fr: 'Modifier le profil', en: 'Edit Profile' },
    saveChanges: { fr: 'Enregistrer', en: 'Save Changes' },
    fullName: { fr: 'Nom complet', en: 'Full Name' },
    email: { fr: 'Email', en: 'Email' },
    phone: { fr: 'Téléphone', en: 'Phone' },
    location: { fr: 'Localisation', en: 'Location' },
    bio: { fr: 'Biographie', en: 'Bio' },
    skills: { fr: 'Compétences', en: 'Skills' },
    experience: { fr: 'Expérience', en: 'Experience' },
    education: { fr: 'Formation', en: 'Education' },
    resume: { fr: 'CV', en: 'Resume' },
    uploadResume: { fr: 'Télécharger un CV', en: 'Upload Resume' },
    companyName: { fr: 'Nom de l\'entreprise', en: 'Company Name' },
    companyDescription: { fr: 'Description', en: 'Description' },
    website: { fr: 'Site web', en: 'Website' },
    industry: { fr: 'Secteur', en: 'Industry' },
    companySize: { fr: 'Taille de l\'entreprise', en: 'Company Size' },
  },

  // Employer
  employer: {
    manageJobs: { fr: 'Gérer les offres', en: 'Manage Jobs' },
    editJob: { fr: 'Modifier l\'offre', en: 'Edit Job' },
    toggleStatus: { fr: 'Changer le statut', en: 'Toggle Status' },
    viewApplications: { fr: 'Voir les candidatures', en: 'View Applications' },
    applicationsFor: { fr: 'Candidatures pour', en: 'Applications for' },
    noCompany: { fr: 'Aucune entreprise trouvée', en: 'No company found' },
    createCompanyFirst: { fr: 'Vous devez d\'abord créer une entreprise', en: 'You need to create a company first' },
  },

  // Errors
  errors: {
    somethingWrong: { fr: 'Une erreur est survenue', en: 'Something went wrong' },
    tryAgain: { fr: 'Veuillez réessayer', en: 'Please try again' },
    unauthorized: { fr: 'Non autorisé', en: 'Unauthorized' },
    notFound: { fr: 'Non trouvé', en: 'Not found' },
  },
}

// Helper function to get translation
export function t(key: string, lang: Language): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    value = value?.[k]
    if (!value) return key
  }
  
  return value?.[lang] || value?.en || key
}
