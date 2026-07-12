/**
 * French Translations
 * Traductions françaises
 */

import type { TranslationDictionary } from '../types';

export const fr: TranslationDictionary = {
  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    clear: 'Effacer',
    select: 'Sélectionner',
    upload: 'Télécharger',
    download: 'Télécharger',
    export: 'Exporter',
    import: 'Importer',
    print: 'Imprimer',
    refresh: 'Actualiser',
    settings: 'Paramètres',
    help: 'Aide',
    about: 'À propos',
    logout: 'Déconnexion',
    login: 'Connexion',
  },

  diseases: {
    title: 'Maladies',
    list: 'Liste des maladies',
    details: 'Détails de la maladie',
    search: 'Rechercher une maladie',
    category: 'Catégorie',
    severity: 'Gravité',
    symptoms: 'Symptômes',
    causes: 'Causes',
    treatment: 'Traitement',
    prevention: 'Prévention',
    
    categories: {
      brood: 'Maladies du couvain',
      adult: 'Maladies des abeilles adultes',
      parasite: 'Parasites',
      virus: 'Virus',
      queen: 'Problèmes de reine',
    },

    severity_levels: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    },

    // Maladies du couvain
    american_foulbrood: 'Loque américaine',
    european_foulbrood: 'Loque européenne',
    chalkbrood: 'Couvain plâtré',
    sacbrood: 'Couvain sacciforme',

    // Maladies des abeilles adultes
    nosema: 'Nosémose',
    amoeba: 'Amibiase',
    paralysis: 'Paralysie',

    // Parasites
    varroa: 'Varroa',
    tracheal_mites: 'Acariens trachéaux',
    small_hive_beetle: 'Petit coléoptère des ruches',
    wax_moth: 'Fausse teigne',

    // Virus
    dwv: 'Virus des ailes déformées',
    abpv: 'Virus de la paralysie aiguë',
    cbpv: 'Virus de la paralysie chronique',
  },

  diagnosis: {
    title: 'Diagnostic',
    start: 'Commencer le diagnostic',
    wizard: 'Assistant de diagnostic',
    symptoms_selection: 'Sélectionner les symptômes',
    image_upload: 'Télécharger une image',
    results: 'Résultats du diagnostic',
    possible_diseases: 'Maladies possibles',
    confidence: 'Niveau de confiance',
    recommendations: 'Recommandations',
    save_results: 'Enregistrer les résultats',
    symptoms: 'Symptômes',
    addSymptom: 'Ajouter un symptôme',
    severity: 'Gravité',
  },

  alerts: {
    title: 'Alertes',
    list: 'Liste des alertes',
    create: 'Créer une alerte',
    dismiss: 'Ignorer',
    delete: 'Supprimer',
    dismiss_all: 'Tout ignorer',
    no_alerts: 'Aucune alerte',
    settings: 'Paramètres des alertes',
    total: 'Total',
    pending: 'En attente',
    sent: 'Envoyée',
    critical: 'Critique',
    scheduledFor: 'Programmée pour',
    justNow: 'À l\'instant',
    minutesAgo: 'Il y a {{count}} minutes',
    hoursAgo: 'Il y a {{count}} heures',
    daysAgo: 'Il y a {{count}} jours',
    
    types: {
      inspection_reminder: 'Rappel d\'inspection',
      treatment_reminder: 'Rappel de traitement',
      disease_outbreak: 'Épidémie de maladie',
      weather_warning: 'Avertissement météo',
      emergency: 'Urgence',
      inventory_low: 'Stock faible',
      expiry_warning: 'Avertissement d\'expiration',
      safety_period: 'Période de sécurité',
      harvest_ready: 'Prêt pour la récolte',
      custom: 'Alerte personnalisée',
    },

    priorities: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique',
    },

    statuses: {
      pending: 'En attente',
      sent: 'Envoyée',
      dismissed: 'Ignorée',
      expired: 'Expirée',
    },

    entities: {
      hive: 'Ruche',
      treatment: 'Traitement',
      disease: 'Maladie',
      inspection: 'Inspection',
      inventory: 'Inventaire',
    },

    channels: {
      push: 'Notifications push',
      email: 'Email',
      sms: 'SMS',
      in_app: 'Dans l\'application',
    },

    settings_labels: {
      enabled_types: 'Types d\'alertes activés',
      quiet_hours: 'Heures silencieuses',
      notification_channels: 'Canaux de notification',
      priority_threshold: 'Seuil de priorité',
      auto_expire_days: 'Expiration automatique (jours)',
    },

    messages: {
      created: 'Alerte créée avec succès',
      dismissed: 'Alerte ignorée',
      dismissed_all: 'Toutes les alertes ignorées',
      deleted: 'Alerte supprimée',
      settings_updated: 'Paramètres mis à jour',
      type_disabled: 'Type d\'alerte désactivé',
      below_threshold: 'Priorité inférieure au seuil',
      in_quiet_hours: 'Alerte programmée après les heures silencieuses',
    },

    recurring: {
      title: 'Alertes récurrentes',
      schedule: 'Programmer une alerte récurrente',
      cancel: 'Annuler une alerte récurrente',
      frequency: 'Fréquence',
      daily: 'Quotidienne',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuelle',
      time: 'Heure',
      day_of_week: 'Jour de la semaine',
      day_of_month: 'Jour du mois',
    },

    statistics: {
      title: 'Statistiques des alertes',
      total: 'Total',
      pending: 'En attente',
      sent: 'Envoyées',
      dismissed: 'Ignorées',
      expired: 'Expirées',
      by_type: 'Par type',
      by_priority: 'Par priorité',
    },
    possibleDiseases: 'Maladies possibles',
    nextSteps: 'Prochaines étapes',
    overallSeverity: 'Gravité globale',
    analysisDate: 'Date d\'analyse',
    noResults: 'Aucun résultat',
    
    steps: {
      symptoms: 'Symptômes',
      images: 'Images',
      analysis: 'Analyse',
      results: 'Résultats',
    },

    wizard: {
      selectCategory: 'Sélectionner la catégorie de maladie',
      categoryDescription: 'Choisissez la catégorie correspondant aux symptômes observés',
      selectSymptoms: 'Sélectionner les symptômes observés',
      symptomsDescription: 'Choisissez tous les symptômes que vous avez observés dans la ruche',
      uploadImages: 'Télécharger des images (Optionnel)',
      imagesDescription: 'Ajoutez des images claires des symptômes pour améliorer la précision du diagnostic',
      reviewAndAnalyze: 'Réviser et analyser',
      analysisDescription: 'Vérifiez les informations saisies avant de commencer l\'analyse',
      results: 'Résultats du diagnostic',
      category: 'Catégorie',
      symptoms: 'Symptômes',
      images: 'Images',
      analysis: 'Analyse',
      symptomsCount: 'Nombre de symptômes',
      imagesCount: 'Nombre d\'images',
      selectedSymptoms: 'Symptômes sélectionnés',
      commonSymptoms: 'Symptômes courants',
      uploadedImages: 'Images téléchargées',
      addImages: 'Ajouter des images',
      imagesOptional: 'Les images sont optionnelles mais améliorent la précision du diagnostic',
      analyzing: 'Analyse en cours...',
      analyze: 'Analyser',
    },

    image_quality: {
      good: 'Bonne qualité',
      acceptable: 'Qualité acceptable',
      poor: 'Mauvaise qualité',
      blur: 'Image floue',
      lighting: 'Mauvais éclairage',
      resolution: 'Résolution faible',
    },

    errors: {
      noSymptoms: 'Au moins un symptôme doit être ajouté',
      analysisFailed: 'L\'analyse a échoué, veuillez réessayer',
    },
  },

  treatments: {
    title: 'Traitements',
    list: 'Liste des traitements',
    schedule: 'Planifier',
    scheduleNew: 'Planifier un nouveau traitement',
    scheduleTimeline: 'Calendrier des traitements',
    noSchedules: 'Aucun calendrier de traitement',
    details: 'Détails du traitement',
    treatment: 'Traitement',
    selectTreatment: 'Sélectionner un traitement',
    treatmentInfo: 'Informations sur le traitement',
    type: 'Type de traitement',
    dosage: 'Dosage',
    duration: 'Durée',
    safetyPeriod: 'Période de sécurité',
    cost: 'Coût',
    totalCost: 'Coût total',
    instructions: 'Instructions',
    sideEffects: 'Effets secondaires',
    startDate: 'Date de début',
    numberOfDoses: 'Nombre de doses',
    intervalDays: 'Intervalle entre les doses (jours)',
    notesPlaceholder: 'Ajouter des notes supplémentaires...',
    totalDoses: 'Total des doses',
    completedDoses: 'Doses terminées',
    doses: 'Doses',
    dose: 'Dose',
    
    types: {
      chemical: 'Chimique',
      organic: 'Organique',
      biological: 'Biologique',
      mechanical: 'Mécanique',
      thermal: 'Thermique',
    },

    status: {
      active: 'Actif',
      scheduled: 'Planifié',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      paused: 'En pause',
      overdue: 'En retard',
    },

    doseStatus: {
      pending: 'En attente',
      completed: 'Terminé',
      overdue: 'En retard',
      missed: 'Manqué',
      cancelled: 'Annulé',
    },
  },

  alerts: {
    title: 'Alertes',
    list: 'Liste des alertes',
    create: 'Créer une alerte',
    settings: 'Paramètres des alertes',
    
    types: {
      inspection_reminder: 'Rappel d\'inspection',
      treatment_reminder: 'Rappel de traitement',
      disease_outbreak: 'Épidémie de maladie',
      weather_warning: 'Alerte météo',
      emergency: 'Urgence',
      inventory_low: 'Stock faible',
      expiry_warning: 'Avertissement d\'expiration',
    },

    priority: {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique',
    },

    status: {
      pending: 'En attente',
      sent: 'Envoyé',
      dismissed: 'Rejeté',
      expired: 'Expiré',
    },
  },

  hives: {
    title: 'Ruches',
    list: 'Liste des ruches',
    details: 'Détails de la ruche',
    health: 'Santé',
    records: 'Enregistrements',
    history: 'Historique',
    statistics: 'Statistiques',
    
    health_status: {
      excellent: 'Excellent',
      good: 'Bon',
      fair: 'Acceptable',
      poor: 'Mauvais',
      critical: 'Critique',
    },
  },

  sync: {
    title: 'Synchronisation',
    status: 'État de synchronisation',
    online: 'En ligne',
    offline: 'Hors ligne',
    syncing: 'Synchronisation...',
    synced: 'Synchronisé',
    pending: 'En attente',
    error: 'Erreur',
    lastSync: 'Dernière synchronisation',
    never: 'Jamais synchronisé',
    justNow: 'À l\'instant',
    minutesAgo: 'Il y a {{count}} minutes',
    hoursAgo: 'Il y a {{count}} heures',
    daysAgo: 'Il y a {{count}} jours',
    pendingOperations: 'Opérations en attente',
    syncNow: 'Synchroniser maintenant',
    autoSync: 'Synchronisation automatique',
    conflicts: 'Conflits',
    
    messages: {
      syncSuccess: 'Synchronisation réussie',
      syncFailed: 'Échec de la synchronisation',
      noConnection: 'Pas de connexion Internet',
      conflictsResolved: 'Conflits résolus',
    },
    
    conflictResolution: {
      title: 'Résolution des conflits',
      resolve: 'Résoudre le conflit',
      useLocal: 'Utiliser la version locale',
      useRemote: 'Utiliser la version distante',
      merge: 'Fusionner',
      latest: 'Utiliser la plus récente',
    },
  },

  errors: {
    network_error: 'Erreur réseau',
    database_error: 'Erreur de base de données',
    not_found: 'Non trouvé',
    unauthorized: 'Non autorisé',
    validation_error: 'Erreur de validation',
    unknown_error: 'Erreur inconnue',
    try_again: 'Réessayer',
  },

  validation: {
    required: 'Ce champ est requis',
    invalid_email: 'Email invalide',
    invalid_phone: 'Numéro de téléphone invalide',
    min_length: 'Minimum {{min}} caractères',
    max_length: 'Maximum {{max}} caractères',
    min_value: 'Minimum {{min}}',
    max_value: 'Maximum {{max}}',
  },

  dates: {
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    this_week: 'Cette semaine',
    last_week: 'La semaine dernière',
    this_month: 'Ce mois-ci',
    last_month: 'Le mois dernier',
    this_year: 'Cette année',
    last_year: 'L\'année dernière',
  },

  time: {
    seconds: {
      zero: 'Aucune seconde',
      one: '1 seconde',
      other: '{{count}} secondes',
    },
    minutes: {
      zero: 'Aucune minute',
      one: '1 minute',
      other: '{{count}} minutes',
    },
    hours: {
      zero: 'Aucune heure',
      one: '1 heure',
      other: '{{count}} heures',
    },
    days: {
      zero: 'Aucun jour',
      one: '1 jour',
      other: '{{count}} jours',
    },
  },

  hiveRecord: {
    title: 'Registre de la Ruche',
    history: 'Historique',
    timeline: 'Chronologie',
    statistics: 'Statistiques',
    report: 'Rapport',
    
    // Disease History
    diseaseHistory: 'Historique des Maladies',
    activeDiseases: 'Maladies Actives',
    resolvedDiseases: 'Maladies Résolues',
    diseaseStatus: {
      active: 'Actif',
      treating: 'En Traitement',
      resolved: 'Résolu',
      chronic: 'Chronique',
    },
    diseaseOutcome: {
      recovered: 'Guéri',
      improved: 'Amélioré',
      unchanged: 'Inchangé',
      worsened: 'Aggravé',
      fatal: 'Fatal',
    },
    
    // Treatment History
    treatmentHistory: 'Historique des Traitements',
    activeTreatments: 'Traitements Actifs',
    completedTreatments: 'Traitements Terminés',
    effectiveness: 'Efficacité',
    sideEffects: 'Effets Secondaires',
    
    // Inspection History
    inspectionHistory: 'Historique des Inspections',
    lastInspection: 'Dernière Inspection',
    nextInspection: 'Prochaine Inspection',
    condition: 'Condition',
    hiveCondition: {
      excellent: 'Excellent',
      good: 'Bon',
      fair: 'Acceptable',
      poor: 'Mauvais',
      critical: 'Critique',
    },
    population: 'Population',
    resources: 'Ressources',
    health: 'Santé',
    weather: 'Météo',
    actionsTaken: 'Actions Prises',
    
    // Images
    images: 'Images',
    imageGallery: 'Galerie d\'Images',
    uploadImage: 'Télécharger une Image',
    imageContext: {
      disease: 'Maladie',
      treatment: 'Traitement',
      inspection: 'Inspection',
      general: 'Général',
    },
    
    // Notes
    notes: 'Notes',
    addNote: 'Ajouter une Note',
    noteContext: {
      disease: 'Maladie',
      treatment: 'Traitement',
      inspection: 'Inspection',
      general: 'Général',
    },
    priority: {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
    },
    
    // Statistics
    totalDiseases: 'Total des Maladies',
    totalTreatments: 'Total des Traitements',
    totalInspections: 'Total des Inspections',
    totalImages: 'Total des Images',
    totalNotes: 'Total des Notes',
    totalCost: 'Coût Total',
    averageEffectiveness: 'Efficacité Moyenne',
    healthScore: 'Score de Santé',
    healthTrend: {
      improving: 'En Amélioration',
      stable: 'Stable',
      declining: 'En Déclin',
    },
    mostCommonDisease: 'Maladie la Plus Courante',
    
    // Reports
    generateReport: 'Générer un Rapport',
    reportType: {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      custom: 'Personnalisé',
    },
    reportFormat: {
      json: 'JSON',
      csv: 'CSV',
      pdf: 'PDF',
    },
    includeSections: 'Inclure les Sections',
    includeDiseases: 'Inclure les Maladies',
    includeTreatments: 'Inclure les Traitements',
    includeInspections: 'Inclure les Inspections',
    includeImages: 'Inclure les Images',
    includeNotes: 'Inclure les Notes',
    includeStatistics: 'Inclure les Statistiques',
    
    // Search and Filter
    searchRecords: 'Rechercher des Enregistrements',
    filterByDate: 'Filtrer par Date',
    filterByDisease: 'Filtrer par Maladie',
    filterByTreatment: 'Filtrer par Traitement',
    filterByCondition: 'Filtrer par Condition',
    hasImages: 'A des Images',
    hasNotes: 'A des Notes',
    
    // Messages
    noRecords: 'Aucun enregistrement',
    noDiseases: 'Aucune maladie',
    noTreatments: 'Aucun traitement',
    noInspections: 'Aucune inspection',
    noImages: 'Aucune image',
    noNotes: 'Aucune note',
    recordCreated: 'Enregistrement créé avec succès',
    recordUpdated: 'Enregistrement mis à jour avec succès',
    recordDeleted: 'Enregistrement supprimé avec succès',
    reportGenerated: 'Rapport généré avec succès',
  },
};
