/**
 * English Translations
 */

import type { TranslationDictionary } from '../types';

export const en: TranslationDictionary = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    select: 'Select',
    upload: 'Upload',
    download: 'Download',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    refresh: 'Refresh',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    logout: 'Logout',
    login: 'Login',
  },

  diseases: {
    title: 'Diseases',
    list: 'Disease List',
    details: 'Disease Details',
    search: 'Search Disease',
    category: 'Category',
    severity: 'Severity',
    symptoms: 'Symptoms',
    causes: 'Causes',
    treatment: 'Treatment',
    prevention: 'Prevention',
    
    categories: {
      brood: 'Brood Diseases',
      adult: 'Adult Bee Diseases',
      parasite: 'Parasites',
      virus: 'Viruses',
      queen: 'Queen Problems',
    },

    severity_levels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },

    // Brood diseases
    american_foulbrood: 'American Foulbrood',
    european_foulbrood: 'European Foulbrood',
    chalkbrood: 'Chalkbrood',
    sacbrood: 'Sacbrood',

    // Adult bee diseases
    nosema: 'Nosema',
    amoeba: 'Amoeba',
    paralysis: 'Paralysis',

    // Parasites
    varroa: 'Varroa',
    tracheal_mites: 'Tracheal Mites',
    small_hive_beetle: 'Small Hive Beetle',
    wax_moth: 'Wax Moth',

    // Viruses
    dwv: 'Deformed Wing Virus',
    abpv: 'Acute Bee Paralysis Virus',
    cbpv: 'Chronic Bee Paralysis Virus',
  },

  diagnosis: {
    title: 'Diagnosis',
    start: 'Start Diagnosis',
    wizard: 'Diagnosis Wizard',
    symptoms_selection: 'Select Symptoms',
    image_upload: 'Upload Image',
    results: 'Diagnosis Results',
    possible_diseases: 'Possible Diseases',
    confidence: 'Confidence Level',
    recommendations: 'Recommendations',
    save_results: 'Save Results',
    symptoms: 'Symptoms',
    addSymptom: 'Add Symptom',
    severity: 'Severity',
    possibleDiseases: 'Possible Diseases',
  },

  alerts: {
    title: 'Alerts',
    list: 'Alert List',
    create: 'Create Alert',
    dismiss: 'Dismiss',
    delete: 'Delete',
    dismiss_all: 'Dismiss All',
    no_alerts: 'No alerts',
    settings: 'Alert Settings',
    total: 'Total',
    pending: 'Pending',
    sent: 'Sent',
    critical: 'Critical',
    scheduledFor: 'Scheduled for',
    justNow: 'Just now',
    minutesAgo: '{{count}} minutes ago',
    hoursAgo: '{{count}} hours ago',
    daysAgo: '{{count}} days ago',
    
    types: {
      inspection_reminder: 'Inspection Reminder',
      treatment_reminder: 'Treatment Reminder',
      disease_outbreak: 'Disease Outbreak',
      weather_warning: 'Weather Warning',
      emergency: 'Emergency',
      inventory_low: 'Low Inventory',
      expiry_warning: 'Expiry Warning',
      safety_period: 'Safety Period',
      harvest_ready: 'Harvest Ready',
      custom: 'Custom Alert',
    },

    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },

    statuses: {
      pending: 'Pending',
      sent: 'Sent',
      dismissed: 'Dismissed',
      expired: 'Expired',
    },

    entities: {
      hive: 'Hive',
      treatment: 'Treatment',
      disease: 'Disease',
      inspection: 'Inspection',
      inventory: 'Inventory',
    },

    channels: {
      push: 'Push Notifications',
      email: 'Email',
      sms: 'SMS',
      in_app: 'In-App',
    },

    settings_labels: {
      enabled_types: 'Enabled Alert Types',
      quiet_hours: 'Quiet Hours',
      notification_channels: 'Notification Channels',
      priority_threshold: 'Priority Threshold',
      auto_expire_days: 'Auto-Expire After (days)',
    },

    messages: {
      created: 'Alert created successfully',
      dismissed: 'Alert dismissed',
      dismissed_all: 'All alerts dismissed',
      deleted: 'Alert deleted',
      settings_updated: 'Settings updated',
      type_disabled: 'Alert type is disabled',
      below_threshold: 'Priority is below threshold',
      in_quiet_hours: 'Alert scheduled after quiet hours',
    },

    recurring: {
      title: 'Recurring Alerts',
      schedule: 'Schedule Recurring Alert',
      cancel: 'Cancel Recurring Alert',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      time: 'Time',
      day_of_week: 'Day of Week',
      day_of_month: 'Day of Month',
    },

    statistics: {
      title: 'Alert Statistics',
      total: 'Total',
      pending: 'Pending',
      sent: 'Sent',
      dismissed: 'Dismissed',
      expired: 'Expired',
      by_type: 'By Type',
      by_priority: 'By Priority',
    },
    nextSteps: 'Next Steps',
    overallSeverity: 'Overall Severity',
    analysisDate: 'Analysis Date',
    noResults: 'No Results',
    
    steps: {
      symptoms: 'Symptoms',
      images: 'Images',
      analysis: 'Analysis',
      results: 'Results',
    },

    wizard: {
      selectCategory: 'Select Disease Category',
      categoryDescription: 'Choose the category that matches the observed symptoms',
      selectSymptoms: 'Select Observed Symptoms',
      symptomsDescription: 'Choose all symptoms you have observed in the hive',
      uploadImages: 'Upload Images (Optional)',
      imagesDescription: 'Add clear images of symptoms to improve diagnosis accuracy',
      reviewAndAnalyze: 'Review and Analyze',
      analysisDescription: 'Review the entered information before starting analysis',
      results: 'Diagnosis Results',
      category: 'Category',
      symptoms: 'Symptoms',
      images: 'Images',
      analysis: 'Analysis',
      symptomsCount: 'Number of Symptoms',
      imagesCount: 'Number of Images',
      selectedSymptoms: 'Selected Symptoms',
      commonSymptoms: 'Common Symptoms',
      uploadedImages: 'Uploaded Images',
      addImages: 'Add Images',
      imagesOptional: 'Images are optional but improve diagnosis accuracy',
      analyzing: 'Analyzing...',
      analyze: 'Analyze',
    },

    image_quality: {
      good: 'Good Quality',
      acceptable: 'Acceptable Quality',
      poor: 'Poor Quality',
      blur: 'Image is blurry',
      lighting: 'Poor lighting',
      resolution: 'Low resolution',
    },

    errors: {
      noSymptoms: 'At least one symptom must be added',
      analysisFailed: 'Analysis failed, please try again',
    },
  },

  treatments: {
    title: 'Treatments',
    list: 'Treatment List',
    schedule: 'Schedule',
    scheduleNew: 'Schedule New Treatment',
    scheduleTimeline: 'Treatment Schedule Timeline',
    noSchedules: 'No treatment schedules',
    details: 'Treatment Details',
    treatment: 'Treatment',
    selectTreatment: 'Select Treatment',
    treatmentInfo: 'Treatment Information',
    type: 'Treatment Type',
    dosage: 'Dosage',
    duration: 'Duration',
    safetyPeriod: 'Safety Period',
    cost: 'Cost',
    totalCost: 'Total Cost',
    instructions: 'Instructions',
    sideEffects: 'Side Effects',
    startDate: 'Start Date',
    numberOfDoses: 'Number of Doses',
    intervalDays: 'Interval Between Doses (days)',
    notesPlaceholder: 'Add additional notes...',
    totalDoses: 'Total Doses',
    completedDoses: 'Completed Doses',
    doses: 'Doses',
    dose: 'Dose',
    
    types: {
      chemical: 'Chemical',
      organic: 'Organic',
      biological: 'Biological',
      mechanical: 'Mechanical',
      thermal: 'Thermal',
    },

    status: {
      active: 'Active',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paused: 'Paused',
      overdue: 'Overdue',
    },

    doseStatus: {
      pending: 'Pending',
      completed: 'Completed',
      overdue: 'Overdue',
      missed: 'Missed',
      cancelled: 'Cancelled',
    },
  },

  alerts: {
    title: 'Alerts',
    list: 'Alert List',
    create: 'Create Alert',
    settings: 'Alert Settings',
    
    types: {
      inspection_reminder: 'Inspection Reminder',
      treatment_reminder: 'Treatment Reminder',
      disease_outbreak: 'Disease Outbreak',
      weather_warning: 'Weather Warning',
      emergency: 'Emergency',
      inventory_low: 'Low Inventory',
      expiry_warning: 'Expiry Warning',
    },

    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },

    status: {
      pending: 'Pending',
      sent: 'Sent',
      dismissed: 'Dismissed',
      expired: 'Expired',
    },
  },

  hives: {
    title: 'Hives',
    list: 'Hive List',
    details: 'Hive Details',
    health: 'Health',
    records: 'Records',
    history: 'History',
    statistics: 'Statistics',
    
    health_status: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      critical: 'Critical',
    },
  },

  sync: {
    title: 'Sync',
    status: 'Sync Status',
    online: 'Online',
    offline: 'Offline',
    syncing: 'Syncing...',
    synced: 'Synced',
    pending: 'Pending',
    error: 'Error',
    lastSync: 'Last Sync',
    never: 'Never synced',
    justNow: 'Just now',
    minutesAgo: '{{count}} minutes ago',
    hoursAgo: '{{count}} hours ago',
    daysAgo: '{{count}} days ago',
    pendingOperations: 'Pending Operations',
    syncNow: 'Sync Now',
    autoSync: 'Auto Sync',
    conflicts: 'Conflicts',
    
    messages: {
      syncSuccess: 'Sync successful',
      syncFailed: 'Sync failed',
      noConnection: 'No internet connection',
      conflictsResolved: 'Conflicts resolved',
    },
    
    conflictResolution: {
      title: 'Conflict Resolution',
      resolve: 'Resolve Conflict',
      useLocal: 'Use Local Version',
      useRemote: 'Use Remote Version',
      merge: 'Merge',
      latest: 'Use Latest',
    },
  },

  errors: {
    network_error: 'Network Error',
    database_error: 'Database Error',
    not_found: 'Not Found',
    unauthorized: 'Unauthorized',
    validation_error: 'Validation Error',
    unknown_error: 'Unknown Error',
    try_again: 'Try Again',
  },

  validation: {
    required: 'This field is required',
    invalid_email: 'Invalid email',
    invalid_phone: 'Invalid phone number',
    min_length: 'Minimum {{min}} characters',
    max_length: 'Maximum {{max}} characters',
    min_value: 'Minimum {{min}}',
    max_value: 'Maximum {{max}}',
  },

  dates: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    this_week: 'This Week',
    last_week: 'Last Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    this_year: 'This Year',
    last_year: 'Last Year',
  },

  time: {
    seconds: {
      zero: 'No seconds',
      one: '1 second',
      other: '{{count}} seconds',
    },
    minutes: {
      zero: 'No minutes',
      one: '1 minute',
      other: '{{count}} minutes',
    },
    hours: {
      zero: 'No hours',
      one: '1 hour',
      other: '{{count}} hours',
    },
    days: {
      zero: 'No days',
      one: '1 day',
      other: '{{count}} days',
    },
  },

  hiveRecord: {
    title: 'Hive Record',
    history: 'History',
    timeline: 'Timeline',
    statistics: 'Statistics',
    report: 'Report',
    
    // Disease History
    diseaseHistory: 'Disease History',
    activeDiseases: 'Active Diseases',
    resolvedDiseases: 'Resolved Diseases',
    diseaseStatus: {
      active: 'Active',
      treating: 'Treating',
      resolved: 'Resolved',
      chronic: 'Chronic',
    },
    diseaseOutcome: {
      recovered: 'Recovered',
      improved: 'Improved',
      unchanged: 'Unchanged',
      worsened: 'Worsened',
      fatal: 'Fatal',
    },
    
    // Treatment History
    treatmentHistory: 'Treatment History',
    activeTreatments: 'Active Treatments',
    completedTreatments: 'Completed Treatments',
    effectiveness: 'Effectiveness',
    sideEffects: 'Side Effects',
    
    // Inspection History
    inspectionHistory: 'Inspection History',
    lastInspection: 'Last Inspection',
    nextInspection: 'Next Inspection',
    condition: 'Condition',
    hiveCondition: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      critical: 'Critical',
    },
    population: 'Population',
    resources: 'Resources',
    health: 'Health',
    weather: 'Weather',
    actionsTaken: 'Actions Taken',
    
    // Images
    images: 'Images',
    imageGallery: 'Image Gallery',
    uploadImage: 'Upload Image',
    imageContext: {
      disease: 'Disease',
      treatment: 'Treatment',
      inspection: 'Inspection',
      general: 'General',
    },
    
    // Notes
    notes: 'Notes',
    addNote: 'Add Note',
    noteContext: {
      disease: 'Disease',
      treatment: 'Treatment',
      inspection: 'Inspection',
      general: 'General',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    
    // Statistics
    totalDiseases: 'Total Diseases',
    totalTreatments: 'Total Treatments',
    totalInspections: 'Total Inspections',
    totalImages: 'Total Images',
    totalNotes: 'Total Notes',
    totalCost: 'Total Cost',
    averageEffectiveness: 'Average Effectiveness',
    healthScore: 'Health Score',
    healthTrend: {
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining',
    },
    mostCommonDisease: 'Most Common Disease',
    
    // Reports
    generateReport: 'Generate Report',
    reportType: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
      custom: 'Custom',
    },
    reportFormat: {
      json: 'JSON',
      csv: 'CSV',
      pdf: 'PDF',
    },
    includeSections: 'Include Sections',
    includeDiseases: 'Include Diseases',
    includeTreatments: 'Include Treatments',
    includeInspections: 'Include Inspections',
    includeImages: 'Include Images',
    includeNotes: 'Include Notes',
    includeStatistics: 'Include Statistics',
    
    // Search and Filter
    searchRecords: 'Search Records',
    filterByDate: 'Filter by Date',
    filterByDisease: 'Filter by Disease',
    filterByTreatment: 'Filter by Treatment',
    filterByCondition: 'Filter by Condition',
    hasImages: 'Has Images',
    hasNotes: 'Has Notes',
    
    // Messages
    noRecords: 'No records',
    noDiseases: 'No diseases',
    noTreatments: 'No treatments',
    noInspections: 'No inspections',
    noImages: 'No images',
    noNotes: 'No notes',
    recordCreated: 'Record created successfully',
    recordUpdated: 'Record updated successfully',
    recordDeleted: 'Record deleted successfully',
    reportGenerated: 'Report generated successfully',
  },
};
