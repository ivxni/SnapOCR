import { Language } from '../contexts/LanguageContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemo } from 'react';

// Define translation keys
export type TranslationKey = 
  // Common
  | 'common.ok'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.retry'
  | 'common.error'
  | 'common.success'
  | 'common.version'
  | 'common.logout'
  | 'common.and'
  
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.upload'
  | 'dashboard.history'
  | 'dashboard.profile'
  | 'dashboard.recentDocuments'
  | 'dashboard.viewAll'
  | 'dashboard.noDocuments'
  | 'dashboard.uploadFirst'
  | 'dashboard.documentsRemaining'
  | 'dashboard.upgrade'
  | 'dashboard.reactivate'
  
  // Upload
  | 'upload.title'
  | 'upload.selectImage'
  | 'upload.takePhoto'
  | 'upload.processing'
  | 'upload.success'
  | 'upload.error'
  | 'upload.permissionRequired'
  | 'upload.cameraPermission'
  | 'upload.successMessage'
  | 'upload.errorMessage'
  | 'upload.confirm'
  | 'upload.selectImageDescription'
  | 'upload.takePhotoDescription'
  
  // History
  | 'history.title'
  | 'history.noDocuments'
  | 'history.uploadFirst'
  | 'history.loadingDocuments'
  | 'history.errorLoading'
  | 'history.status.completed'
  | 'history.status.processing'
  | 'history.status.failed'
  
  // Document View
  | 'docView.title'
  | 'docView.loading'
  | 'docView.error'
  | 'docView.noPdf'
  | 'docView.invalidDocument'
  | 'docView.failedToLoad'
  | 'docView.pdfRenderError'
  | 'docView.sharingFailed'
  
  // Profile
  | 'profile.title'
  | 'profile.editProfile'
  | 'profile.notifications'
  | 'profile.security'
  | 'profile.helpSupport'
  | 'profile.appearance'
  | 'profile.language'
  | 'profile.logout'
  | 'profile.account'
  | 'profile.preferences'
  | 'profile.loadingProfile'
  | 'profile.errorProfile'
  | 'profile.settings'
  | 'profile.darkMode'
  | 'profile.changePassword'
  | 'profile.privacyPolicy'
  | 'profile.termsOfService'
  | 'profile.logoutTitle'
  | 'profile.logoutConfirm'
  | 'profile.selectTheme'
  | 'profile.systemDefault'
  | 'profile.lightMode'
  | 'profile.themeChangeNote'
  | 'profile.firstName'
  | 'profile.lastName'
  | 'profile.email'
  | 'profile.allFieldsRequired'
  | 'profile.profileUpdated'
  | 'profile.updateFailed'
  | 'profile.currentPassword'
  | 'profile.newPassword'
  | 'profile.confirmPassword'
  | 'profile.passwordsDoNotMatch'
  | 'profile.passwordTooShort'
  | 'profile.passwordChanged'
  | 'profile.passwordChangeFailed'
  | 'profile.passwordRequirements'
  | 'profile.minLength'
  | 'profile.hasLetter'
  | 'profile.hasNumber'
  | 'profile.passwordsMatch'
  
  // Subscription
  | 'subscription.title'
  | 'subscription.plan'
  | 'subscription.billing'
  | 'subscription.trialEnds'
  | 'subscription.nextBilling'
  | 'subscription.documents'
  | 'subscription.resetsOn'
  | 'subscription.startFreeTrial'
  | 'subscription.subscribeMontly'
  | 'subscription.subscribeYearly'
  | 'subscription.cancelTrial'
  | 'subscription.cancelSubscription'
  | 'subscription.cancel'
  | 'subscription.changePlan'
  | 'subscription.current'
  | 'subscription.switchToMonthly'
  | 'subscription.switchToYearly'
  | 'subscription.reactivate'
  | 'subscription.restore'
  | 'subscription.subscriptionEnding'
  | 'subscription.limitReached'
  | 'subscription.free'
  | 'subscription.premium'
  | 'subscription.trial'
  | 'subscription.monthly'
  | 'subscription.yearly'
  | 'subscription.documentsRemaining'
  | 'subscription.trialDescription'
  | 'subscription.monthlyDescription'
  | 'subscription.yearlyDescription'
  | 'subscription.freeDescription'
  | 'subscription.feature.documents'
  | 'subscription.feature.documentsWeekly'
  | 'subscription.feature.priority'
  | 'subscription.feature.standard'
  | 'subscription.feature.cancel'
  | 'subscription.feature.savings'
  | 'subscription.feature.premium'
  | 'subscription.chooseYourPlan'
  | 'subscription.recommended'
  | 'subscription.managePlan'
  | 'subscription.accessUntil'
  | 'subscription.days7'
  | 'subscription.continueFree'
  | 'common.annually'
  
  // Language
  | 'language.title'
  | 'language.description'
  | 'language.info'
  | 'language.selectLanguage'
  | 'language.changeNote';

// Define translation dictionaries
type TranslationDictionary = {
  [key in TranslationKey]?: string;
};

// English translations (default)
const en: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.loading': 'Loading...',
  'common.retry': 'Retry',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.version': 'Version',
  'common.logout': 'Log Out',
  'common.and': 'and',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welcome',
  'dashboard.upload': 'Upload',
  'dashboard.history': 'History',
  'dashboard.profile': 'Profile',
  'dashboard.recentDocuments': 'Recent Documents',
  'dashboard.viewAll': 'View All Documents',
  'dashboard.noDocuments': 'No documents yet',
  'dashboard.uploadFirst': 'Upload your first document to get started',
  'dashboard.documentsRemaining': 'documents remaining',
  'dashboard.upgrade': 'Upgrade',
  'dashboard.reactivate': 'Reactivate',
  
  // Upload
  'upload.title': 'Upload Document',
  'upload.selectImage': 'Select Image',
  'upload.takePhoto': 'Take Photo',
  'upload.processing': 'Processing...',
  'upload.success': 'Document uploaded successfully',
  'upload.error': 'Error uploading document',
  'upload.permissionRequired': 'Permission Required',
  'upload.cameraPermission': 'Camera permission is required to take photos',
  'upload.successMessage': 'Your document has been uploaded and is being processed',
  'upload.errorMessage': 'There was an error uploading your document. Please try again.',
  'upload.confirm': 'Confirm',
  'upload.selectImageDescription': 'Choose an image from your gallery',
  'upload.takePhotoDescription': 'Take a new photo with your camera',
  
  // History
  'history.title': 'Document History',
  'history.noDocuments': 'No documents yet',
  'history.uploadFirst': 'Upload your first document to get started',
  'history.loadingDocuments': 'Loading documents...',
  'history.errorLoading': 'Error loading documents',
  'history.status.completed': 'Completed',
  'history.status.processing': 'Processing',
  'history.status.failed': 'Failed',
  
  // Document View
  'docView.title': 'Document Viewer',
  'docView.loading': 'Loading document...',
  'docView.error': 'Error loading document',
  'docView.noPdf': 'No PDF document available',
  'docView.invalidDocument': 'Invalid document ID',
  'docView.failedToLoad': 'Failed to load document',
  'docView.pdfRenderError': 'Error rendering PDF document',
  'docView.sharingFailed': 'Sharing failed',
  
  // Profile
  'profile.title': 'Profile',
  'profile.editProfile': 'Edit Profile',
  'profile.notifications': 'Notifications',
  'profile.security': 'Security',
  'profile.helpSupport': 'Help & Support',
  'profile.appearance': 'Appearance',
  'profile.language': 'Language',
  'profile.logout': 'Log Out',
  'profile.account': 'Account',
  'profile.preferences': 'Preferences',
  'profile.loadingProfile': 'Loading profile...',
  'profile.errorProfile': 'Error loading profile',
  'profile.settings': 'Settings',
  'profile.darkMode': 'Dark Mode',
  'profile.changePassword': 'Change Password',
  'profile.privacyPolicy': 'Privacy Policy',
  'profile.termsOfService': 'Terms of Service',
  'profile.logoutTitle': 'Log Out',
  'profile.logoutConfirm': 'Are you sure you want to log out?',
  'profile.selectTheme': 'Select Theme',
  'profile.systemDefault': 'System Default',
  'profile.lightMode': 'Light Mode',
  'profile.themeChangeNote': 'Changes will be applied immediately to the app interface.',
  'profile.firstName': 'First Name',
  'profile.lastName': 'Last Name',
  'profile.email': 'Email',
  'profile.allFieldsRequired': 'Please fill in all fields',
  'profile.profileUpdated': 'Profile updated successfully',
  'profile.updateFailed': 'Failed to update profile',
  'profile.currentPassword': 'Current Password',
  'profile.newPassword': 'New Password',
  'profile.confirmPassword': 'Confirm Password',
  'profile.passwordsDoNotMatch': 'Passwords do not match',
  'profile.passwordTooShort': 'Password must be at least 6 characters',
  'profile.passwordChanged': 'Password changed successfully',
  'profile.passwordChangeFailed': 'Failed to change password',
  'profile.passwordRequirements': 'Password does not meet requirements',
  'profile.minLength': 'At least 6 characters',
  'profile.hasLetter': 'Contains at least one letter',
  'profile.hasNumber': 'Contains at least one number',
  'profile.passwordsMatch': 'Passwords match',
  
  // Subscription
  'subscription.title': 'Subscription',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Billing Cycle',
  'subscription.trialEnds': 'Trial Ends',
  'subscription.nextBilling': 'Next Billing Date',
  'subscription.documents': 'Documents',
  'subscription.resetsOn': 'Resets On',
  'subscription.startFreeTrial': 'Start Free Trial',
  'subscription.subscribeMontly': 'Subscribe Monthly',
  'subscription.subscribeYearly': 'Subscribe Yearly',
  'subscription.cancelTrial': 'Cancel Trial',
  'subscription.cancelSubscription': 'Cancel Subscription',
  'subscription.cancel': 'Cancel Subscription',
  'subscription.changePlan': 'Change Plan',
  'subscription.current': 'Current Plan',
  'subscription.switchToMonthly': 'Switch to Monthly',
  'subscription.switchToYearly': 'Switch to Yearly',
  'subscription.reactivate': 'Reactivate Subscription',
  'subscription.restore': 'Restore Purchases',
  'subscription.subscriptionEnding': 'Your subscription will end on',
  'subscription.limitReached': 'Document limit reached',
  'subscription.free': 'Free',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Trial',
  'subscription.monthly': 'Monthly',
  'subscription.yearly': 'Yearly',
  'subscription.documentsRemaining': 'remaining',
  'subscription.trialDescription': 'Try all premium features free for 7 days',
  'subscription.monthlyDescription': 'Pay monthly with flexibility',
  'subscription.yearlyDescription': 'Save money with our yearly plan',
  'subscription.freeDescription': 'Limited features at no cost',
  'subscription.feature.documents': '50 documents per month',
  'subscription.feature.documentsWeekly': '5 documents per week',
  'subscription.feature.priority': 'Priority OCR processing',
  'subscription.feature.standard': 'Standard OCR processing',
  'subscription.feature.cancel': 'Cancel anytime',
  'subscription.feature.savings': 'Save on yearly subscription',
  'subscription.feature.premium': 'Additional premium features',
  'subscription.chooseYourPlan': 'Choose the plan that suits your needs',
  'subscription.recommended': 'Recommended',
  'subscription.managePlan': 'Manage Your Plan',
  'subscription.accessUntil': 'Access until',
  'subscription.days7': '7 days',
  'subscription.continueFree': 'Continue with Free',
  'common.annually': 'annually',
  
  // Language
  'language.title': 'Language',
  'language.description': 'Select your preferred language for the app interface. The app will restart to apply changes.',
  'language.info': 'Some content may still appear in English regardless of your language selection.',
  'language.selectLanguage': 'Select your preferred language',
  'language.changeNote': 'Changes will be applied immediately to the app interface.'
};

// Spanish translations
const es: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.loading': 'Cargando...',
  'common.retry': 'Reintentar',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'common.version': 'Versión',
  'common.logout': 'Cerrar Sesión',
  'common.and': 'y',
  
  // Dashboard
  'dashboard.title': 'Panel Principal',
  'dashboard.welcome': 'Bienvenido',
  'dashboard.upload': 'Subir',
  'dashboard.history': 'Historial',
  'dashboard.profile': 'Perfil',
  'dashboard.recentDocuments': 'Documentos Recientes',
  'dashboard.viewAll': 'Ver Todos los Documentos',
  'dashboard.noDocuments': 'Aún no hay documentos',
  'dashboard.uploadFirst': 'Sube tu primer documento para comenzar',
  'dashboard.documentsRemaining': 'documentos restantes',
  'dashboard.upgrade': 'Actualizar',
  'dashboard.reactivate': 'Reactivar',
  
  // Upload
  'upload.title': 'Subir Documento',
  'upload.selectImage': 'Seleccionar Imagen',
  'upload.takePhoto': 'Tomar Foto',
  'upload.processing': 'Procesando...',
  'upload.success': 'Documento subido con éxito',
  'upload.error': 'Error al subir el documento',
  'upload.permissionRequired': 'Permiso Requerido',
  'upload.cameraPermission': 'Se requiere permiso de cámara para tomar fotos',
  'upload.successMessage': 'Tu documento ha sido subido y está siendo procesado',
  'upload.errorMessage': 'Hubo un error al subir tu documento. Por favor, inténtalo de nuevo.',
  'upload.confirm': 'Confirmar',
  'upload.selectImageDescription': 'Elige una imagen de tu galería',
  'upload.takePhotoDescription': 'Toma una nueva foto con tu cámara',
  
  // History
  'history.title': 'Historial de Documentos',
  'history.noDocuments': 'Aún no hay documentos',
  'history.uploadFirst': 'Sube tu primer documento para comenzar',
  'history.loadingDocuments': 'Cargando documentos...',
  'history.errorLoading': 'Error al cargar documentos',
  'history.status.completed': 'Completado',
  'history.status.processing': 'Procesando',
  'history.status.failed': 'Fallido',
  
  // Document View
  'docView.title': 'Visor de Documento',
  'docView.loading': 'Cargando documento...',
  'docView.error': 'Error al cargar el documento',
  'docView.noPdf': 'No hay documento PDF disponible',
  'docView.invalidDocument': 'ID de documento inválido',
  'docView.failedToLoad': 'Error al cargar el documento',
  'docView.pdfRenderError': 'Error al renderizar el documento PDF',
  'docView.sharingFailed': 'Fallo al compartir',
  
  // Profile
  'profile.title': 'Perfil',
  'profile.editProfile': 'Editar Perfil',
  'profile.notifications': 'Notificaciones',
  'profile.security': 'Seguridad',
  'profile.helpSupport': 'Ayuda y Soporte',
  'profile.appearance': 'Apariencia',
  'profile.language': 'Idioma',
  'profile.logout': 'Cerrar Sesión',
  'profile.account': 'Cuenta',
  'profile.preferences': 'Preferencias',
  'profile.loadingProfile': 'Cargando perfil...',
  'profile.errorProfile': 'Error al cargar el perfil',
  'profile.settings': 'Configuración',
  'profile.darkMode': 'Modo Oscuro',
  'profile.changePassword': 'Cambiar Contraseña',
  'profile.privacyPolicy': 'Política de Privacidad',
  'profile.termsOfService': 'Términos de Servicio',
  'profile.logoutTitle': 'Cerrar Sesión',
  'profile.logoutConfirm': '¿Estás seguro de que quieres cerrar sesión?',
  'profile.selectTheme': 'Seleccionar Tema',
  'profile.systemDefault': 'Sistema Predeterminado',
  'profile.lightMode': 'Modo Claro',
  'profile.themeChangeNote': 'Los cambios se aplicarán inmediatamente a la interfaz de la aplicación.',
  'profile.firstName': 'Nombre',
  'profile.lastName': 'Apellido',
  'profile.email': 'Correo electrónico',
  'profile.allFieldsRequired': 'Por favor complete todos los campos',
  'profile.profileUpdated': 'Perfil actualizado con éxito',
  'profile.updateFailed': 'Error al actualizar el perfil',
  'profile.currentPassword': 'Contraseña actual',
  'profile.newPassword': 'Nueva contraseña',
  'profile.confirmPassword': 'Confirmar contraseña',
  'profile.passwordsDoNotMatch': 'Las contraseñas no coinciden',
  'profile.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
  'profile.passwordChanged': 'Contraseña cambiada con éxito',
  'profile.passwordChangeFailed': 'Error al cambiar la contraseña',
  'profile.passwordRequirements': 'Contraseña no cumple con los requisitos',
  'profile.minLength': 'Al menos 6 caracteres',
  'profile.hasLetter': 'Contiene al menos una letra',
  'profile.hasNumber': 'Contiene al menos un número',
  'profile.passwordsMatch': 'Contraseñas coinciden',
  
  // Language
  'language.title': 'Idioma',
  'language.description': 'Selecciona tu idioma preferido para la interfaz de la aplicación. La aplicación se reiniciará para aplicar los cambios.',
  'language.info': 'Algunos contenidos pueden seguir apareciendo en inglés independientemente de tu selección de idioma.',
  'language.selectLanguage': 'Selecciona tu idioma preferido',
  'language.changeNote': 'Los cambios se aplicarán inmediatamente a la interfaz de la aplicación.'
};

// German translations
const de: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Abbrechen',
  'common.save': 'Speichern',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.loading': 'Wird geladen...',
  'common.retry': 'Wiederholen',
  'common.error': 'Fehler',
  'common.success': 'Erfolg',
  'common.version': 'Version',
  'common.logout': 'Abmelden',
  'common.and': 'und',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Willkommen',
  'dashboard.upload': 'Hochladen',
  'dashboard.history': 'Verlauf',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Neueste Dokumente',
  'dashboard.viewAll': 'Alle Dokumente anzeigen',
  'dashboard.noDocuments': 'Noch keine Dokumente',
  'dashboard.uploadFirst': 'Laden Sie Ihr erstes Dokument hoch, um zu beginnen',
  'dashboard.documentsRemaining': 'Dokumente verbleibend',
  'dashboard.upgrade': 'Upgrade',
  'dashboard.reactivate': 'Reaktivieren',
  
  // Upload
  'upload.title': 'Dokument hochladen',
  'upload.selectImage': 'Bild auswählen',
  'upload.takePhoto': 'Foto aufnehmen',
  'upload.processing': 'Verarbeitung...',
  'upload.success': 'Dokument erfolgreich hochgeladen',
  'upload.error': 'Fehler beim Hochladen des Dokuments',
  'upload.permissionRequired': 'Berechtigung erforderlich',
  'upload.cameraPermission': 'Kameraberechtigung ist erforderlich, um Fotos aufzunehmen',
  'upload.successMessage': 'Ihr Dokument wurde hochgeladen und wird verarbeitet',
  'upload.errorMessage': 'Beim Hochladen Ihres Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
  'upload.confirm': 'Bestätigen',
  'upload.selectImageDescription': 'Wählen Sie ein Bild aus Ihrer Galerie',
  'upload.takePhotoDescription': 'Machen Sie ein neues Foto mit Ihrer Kamera',
  
  // History
  'history.title': 'Dokumentenverlauf',
  'history.noDocuments': 'Noch keine Dokumente',
  'history.uploadFirst': 'Laden Sie Ihr erstes Dokument hoch, um zu beginnen',
  'history.loadingDocuments': 'Dokumente werden geladen...',
  'history.errorLoading': 'Fehler beim Laden der Dokumente',
  'history.status.completed': 'Abgeschlossen',
  'history.status.processing': 'Verarbeitung',
  'history.status.failed': 'Fehlgeschlagen',
  
  // Document View
  'docView.title': 'Dokumentenansicht',
  'docView.loading': 'Dokument wird geladen...',
  'docView.error': 'Fehler beim Laden des Dokuments',
  'docView.noPdf': 'Kein PDF-Dokument verfügbar',
  'docView.invalidDocument': 'Ungültige Dokument-ID',
  'docView.failedToLoad': 'Fehler beim Laden des Dokuments',
  'docView.pdfRenderError': 'Fehler beim Rendern des PDF-Dokuments',
  'docView.sharingFailed': 'Freigabe fehlgeschlagen',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Profil bearbeiten',
  'profile.notifications': 'Benachrichtigungen',
  'profile.security': 'Sicherheit',
  'profile.helpSupport': 'Hilfe & Support',
  'profile.appearance': 'Erscheinungsbild',
  'profile.language': 'Sprache',
  'profile.logout': 'Abmelden',
  'profile.account': 'Konto',
  'profile.preferences': 'Einstellungen',
  'profile.loadingProfile': 'Profil wird geladen...',
  'profile.errorProfile': 'Fehler beim Laden des Profils',
  'profile.settings': 'Einstellungen',
  'profile.darkMode': 'Dunkelmodus',
  'profile.changePassword': 'Passwort ändern',
  'profile.privacyPolicy': 'Datenschutzrichtlinie',
  'profile.termsOfService': 'Nutzungsbedingungen',
  'profile.logoutTitle': 'Abmelden',
  'profile.logoutConfirm': 'Sind Sie sicher, dass Sie sich abmelden möchten?',
  'profile.selectTheme': 'Thema auswählen',
  'profile.systemDefault': 'Systemstandard',
  'profile.lightMode': 'Hellmodus',
  'profile.themeChangeNote': 'Änderungen werden sofort auf die App-Oberfläche angewendet.',
  'profile.firstName': 'Vorname',
  'profile.lastName': 'Nachname',
  'profile.email': 'E-Mail',
  'profile.allFieldsRequired': 'Bitte füllen Sie alle Felder aus',
  'profile.profileUpdated': 'Profil erfolgreich aktualisiert',
  'profile.updateFailed': 'Fehler beim Aktualisieren des Profils',
  'profile.currentPassword': 'Aktuelles Passwort',
  'profile.newPassword': 'Neues Passwort',
  'profile.confirmPassword': 'Passwort bestätigen',
  'profile.passwordsDoNotMatch': 'Passwörter stimmen nicht überein',
  'profile.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein',
  'profile.passwordChanged': 'Passwort erfolgreich geändert',
  'profile.passwordChangeFailed': 'Fehler beim Ändern des Passworts',
  'profile.passwordRequirements': 'Passwort erfüllt nicht die Anforderungen',
  'profile.minLength': 'Mindestens 6 Zeichen',
  'profile.hasLetter': 'Enthält mindestens einen Buchstaben',
  'profile.hasNumber': 'Enthält mindestens eine Zahl',
  'profile.passwordsMatch': 'Passwörter stimmen überein',
  
  // Language
  'language.title': 'Sprache',
  'language.description': 'Wählen Sie Ihre bevorzugte Sprache für die App-Oberfläche. Die App wird neu gestartet, um Änderungen zu übernehmen.',
  'language.info': 'Einige Inhalte können unabhängig von Ihrer Sprachauswahl weiterhin auf Englisch angezeigt werden.',
  // German translations
  // Subscription section in the German dictionary
  'subscription.title': 'Abonnement',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Abrechnungszyklus',
  'subscription.trialEnds': 'Testphase endet',
  'subscription.nextBilling': 'Nächste Abrechnung',
  'subscription.documents': 'Dokumente',
  'subscription.resetsOn': 'Zurückgesetzt am',
  'subscription.startFreeTrial': 'Kostenlose Testphase starten',
  'subscription.subscribeMontly': 'Monatlich abonnieren',
  'subscription.subscribeYearly': 'Jährlich abonnieren',
  'subscription.cancelTrial': 'Testphase beenden',
  'subscription.cancelSubscription': 'Abonnement kündigen',
  'subscription.cancel': 'Abonnement kündigen',
  'subscription.changePlan': 'Plan ändern',
  'subscription.current': 'Aktueller Plan',
  'subscription.switchToMonthly': 'Zu monatlicher Zahlung wechseln',
  'subscription.switchToYearly': 'Zu jährlicher Zahlung wechseln',
  'subscription.reactivate': 'Abonnement reaktivieren',
  'subscription.restore': 'Käufe wiederherstellen',
  'subscription.subscriptionEnding': 'Ihr Abonnement endet am',
  'subscription.limitReached': 'Dokumentlimit erreicht',
  'subscription.free': 'Kostenlos',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Testphase',
  'subscription.monthly': 'Monatlich',
  'subscription.yearly': 'Jährlich',
  'subscription.documentsRemaining': 'verbleibend',
  'subscription.trialDescription': 'Testen Sie alle Premium-Funktionen 7 Tage lang kostenlos',
  'subscription.monthlyDescription': 'Monatlich mit Flexibilität bezahlen',
  'subscription.yearlyDescription': 'Sparen Sie Geld mit unserem Jahresplan',
  'subscription.freeDescription': 'Begrenzte Funktionen ohne Kosten',
  'subscription.feature.documents': '50 Dokumente pro Monat',
  'subscription.feature.documentsWeekly': '5 Dokumente pro Woche',
  'subscription.feature.priority': 'Prioritäts-OCR-Verarbeitung',
  'subscription.feature.standard': 'Standard-OCR-Verarbeitung',
  'subscription.feature.cancel': 'Jederzeit kündbar',
  'subscription.feature.savings': 'Sparen Sie bei jährlicher Zahlung',
  'subscription.feature.premium': 'Zusätzliche Premium-Funktionen',
  'subscription.chooseYourPlan': 'Wählen Sie den für Sie passenden Plan',
  'subscription.recommended': 'Empfohlen',
  'subscription.managePlan': 'Ihr Plan verwalten',
  'subscription.accessUntil': 'Zugang bis',
  'subscription.days7': '7 Tage',
  'subscription.continueFree': 'Mit kostenlosem Plan fortfahren',
  'common.annually': 'jährlich',
};

// Russian translations
const ru: TranslationDictionary = {
  // Common
  'common.ok': 'ОК',
  'common.cancel': 'Отмена',
  'common.save': 'Сохранить',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.loading': 'Загрузка...',
  'common.retry': 'Повторить',
  'common.error': 'Ошибка',
  'common.success': 'Успех',
  'common.version': 'Версия',
  'common.logout': 'Выйти',
  'common.and': 'и',
  
  // Dashboard
  'dashboard.title': 'Панель управления',
  'dashboard.welcome': 'Добро пожаловать',
  'dashboard.upload': 'Загрузить',
  'dashboard.history': 'История',
  'dashboard.profile': 'Профиль',
  'dashboard.recentDocuments': 'Недавние документы',
  'dashboard.viewAll': 'Просмотреть все документы',
  'dashboard.noDocuments': 'Пока нет документов',
  'dashboard.uploadFirst': 'Загрузите свой первый документ, чтобы начать',
  'dashboard.documentsRemaining': 'осталось документов',
  'dashboard.upgrade': 'Обновить',
  'dashboard.reactivate': 'Реактивировать',
  
  // Upload
  'upload.title': 'Загрузить документ',
  'upload.selectImage': 'Выбрать изображение',
  'upload.takePhoto': 'Сделать фото',
  'upload.processing': 'Обработка...',
  'upload.success': 'Документ успешно загружен',
  'upload.error': 'Ошибка при загрузке документа',
  'upload.permissionRequired': 'Требуется разрешение',
  'upload.cameraPermission': 'Для съемки фотографий требуется разрешение камеры',
  'upload.successMessage': 'Ваш документ загружен и обрабатывается',
  'upload.errorMessage': 'При загрузке документа произошла ошибка. Пожалуйста, попробуйте еще раз.',
  'upload.confirm': 'Подтвердить',
  'upload.selectImageDescription': 'Выберите изображение из галереи',
  'upload.takePhotoDescription': 'Сделайте новое фото с помощью камеры',
  
  // History
  'history.title': 'История документов',
  'history.noDocuments': 'Пока нет документов',
  'history.uploadFirst': 'Загрузите свой первый документ, чтобы начать',
  'history.loadingDocuments': 'Загрузка документов...',
  'history.errorLoading': 'Ошибка при загрузке документов',
  'history.status.completed': 'Завершено',
  'history.status.processing': 'Обработка',
  'history.status.failed': 'Ошибка',
  
  // Document View
  'docView.title': 'Просмотр документа',
  'docView.loading': 'Загрузка документа...',
  'docView.error': 'Ошибка при загрузке документа',
  'docView.noPdf': 'Недоступен PDF-документ',
  'docView.invalidDocument': 'Неверный ID документа',
  'docView.failedToLoad': 'Не удалось загрузить документ',
  'docView.pdfRenderError': 'Ошибка рендеринга PDF-документа',
  'docView.sharingFailed': 'Не удалось поделиться',
  
  // Profile
  'profile.title': 'Профиль',
  'profile.editProfile': 'Редактировать профиль',
  'profile.notifications': 'Уведомления',
  'profile.security': 'Безопасность',
  'profile.helpSupport': 'Помощь и поддержка',
  'profile.appearance': 'Внешний вид',
  'profile.language': 'Язык',
  'profile.logout': 'Выйти',
  'profile.account': 'Аккаунт',
  'profile.preferences': 'Настройки',
  'profile.loadingProfile': 'Загрузка профиля...',
  'profile.errorProfile': 'Ошибка при загрузке профиля',
  'profile.settings': 'Настройки',
  'profile.darkMode': 'Темный режим',
  'profile.changePassword': 'Изменить пароль',
  'profile.privacyPolicy': 'Политика конфиденциальности',
  'profile.termsOfService': 'Условия использования',
  'profile.logoutTitle': 'Выход',
  'profile.logoutConfirm': 'Вы уверены, что хотите выйти?',
  'profile.selectTheme': 'Выберите тему',
  'profile.systemDefault': 'Системная',
  'profile.lightMode': 'Светлая',
  'profile.themeChangeNote': 'Изменения будут применены сразу на интерфейсе приложения.',
  'profile.firstName': 'Имя',
  'profile.lastName': 'Фамилия',
  'profile.email': 'Эл. почта',
  'profile.allFieldsRequired': 'Пожалуйста, заполните все поля',
  'profile.profileUpdated': 'Профиль успешно обновлен',
  'profile.updateFailed': 'Ошибка при обновлении профиля',
  'profile.currentPassword': 'Текущий пароль',
  'profile.newPassword': 'Новый пароль',
  'profile.confirmPassword': 'Подтвердите пароль',
  'profile.passwordsDoNotMatch': 'Пароли не совпадают',
  'profile.passwordTooShort': 'Пароль должен содержать не менее 6 символов',
  'profile.passwordChanged': 'Пароль успешно изменен',
  'profile.passwordChangeFailed': 'Ошибка при изменении пароля',
  'profile.passwordRequirements': 'Пароль не соответствует требованиям',
  'profile.minLength': 'Не менее 6 символов',
  'profile.hasLetter': 'Содержит хотя бы одну букву',
  'profile.hasNumber': 'Содержит хотя бы одну цифру',
  'profile.passwordsMatch': 'Пароли совпадают',
  
  // Language
  'language.title': 'Язык',
  'language.description': 'Выберите предпочтительный язык для интерфейса приложения. Приложение перезапустится для применения изменений.',
  'language.info': 'Некоторый контент может по-прежнему отображаться на английском языке независимо от выбранного вами языка.'
};

// Turkish translations
const tr: TranslationDictionary = {
  // Common
  'common.ok': 'Tamam',
  'common.cancel': 'İptal',
  'common.save': 'Kaydet',
  'common.delete': 'Sil',
  'common.edit': 'Düzenle',
  'common.loading': 'Yükleniyor...',
  'common.retry': 'Tekrar Dene',
  'common.error': 'Hata',
  'common.success': 'Başarılı',
  'common.version': 'Sürüm',
  'common.logout': 'Çıkış Yap',
  'common.and': 've',
  
  // Dashboard
  'dashboard.title': 'Gösterge Paneli',
  'dashboard.welcome': 'Hoş Geldiniz',
  'dashboard.upload': 'Yükle',
  'dashboard.history': 'Geçmiş',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Son Belgeler',
  'dashboard.viewAll': 'Tüm Belgeleri Görüntüle',
  'dashboard.noDocuments': 'Henüz belge yok',
  'dashboard.uploadFirst': 'Başlamak için ilk belgenizi yükleyin',
  'dashboard.documentsRemaining': 'belge kaldı',
  'dashboard.upgrade': 'Yükselt',
  'dashboard.reactivate': 'Reaktivasyon',
  
  // Upload
  'upload.title': 'Belge Yükle',
  'upload.selectImage': 'Resim Seç',
  'upload.takePhoto': 'Fotoğraf Çek',
  'upload.processing': 'İşleniyor...',
  'upload.success': 'Belge başarıyla yüklendi',
  'upload.error': 'Belge yüklenirken hata oluştu',
  'upload.permissionRequired': 'İzin Gerekli',
  'upload.cameraPermission': 'Fotoğraf çekmek için kamera izni gerekli',
  'upload.successMessage': 'Belgeniz yüklendi ve işleniyor',
  'upload.errorMessage': 'Belge yüklenirken hata oluştu. Lütfen tekrar deneyin.',
  'upload.confirm': 'Onayla',
  'upload.selectImageDescription': 'Galeriden bir resim seçin',
  'upload.takePhotoDescription': 'Kameranızla yeni bir fotoğraf çekin',
  
  // History
  'history.title': 'Belge Geçmişi',
  'history.noDocuments': 'Henüz belge yok',
  'history.uploadFirst': 'Başlamak için ilk belgenizi yükleyin',
  'history.loadingDocuments': 'Belgeler yükleniyor...',
  'history.errorLoading': 'Belgeler yüklenirken hata oluştu',
  'history.status.completed': 'Tamamlandı',
  'history.status.processing': 'İşleniyor',
  'history.status.failed': 'Başarısız',
  
  // Document View
  'docView.title': 'Belge Görüntüleyici',
  'docView.loading': 'Belge yükleniyor...',
  'docView.error': 'Belge yüklenirken hata oluştu',
  'docView.noPdf': 'PDF belgesi mevcut değil',
  'docView.invalidDocument': 'Geçersiz belge ID',
  'docView.failedToLoad': 'Belge yüklenirken hata oluştu',
  'docView.pdfRenderError': 'PDF belgesi işlenirken hata oluştu',
  'docView.sharingFailed': 'Paylaşım başarısız',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Profili Düzenle',
  'profile.notifications': 'Bildirimler',
  'profile.security': 'Güvenlik',
  'profile.helpSupport': 'Yardım ve Destek',
  'profile.appearance': 'Görünüm',
  'profile.language': 'Dil',
  'profile.logout': 'Çıkış Yap',
  'profile.account': 'Hesap',
  'profile.preferences': 'Tercihler',
  'profile.loadingProfile': 'Profil yükleniyor...',
  'profile.errorProfile': 'Profil yüklenirken hata oluştu',
  'profile.settings': 'Ayarlar',
  'profile.darkMode': 'Karanlık Mod',
  'profile.changePassword': 'Şifre Değiştir',
  'profile.privacyPolicy': 'Gizlilik Politikası',
  'profile.termsOfService': 'Kullanım Şartları',
  'profile.logoutTitle': 'Çıkış Yap',
  'profile.logoutConfirm': 'Çıkış yapmak istediğinizden emin misiniz?',
  'profile.selectTheme': 'Tema Seç',
  'profile.systemDefault': 'Sistem Varsayılanı',
  'profile.lightMode': 'Açık Mod',
  'profile.themeChangeNote': 'Değişiklikler uygulamak için uygulama yeniden başlatılacaktır.',
  'profile.firstName': 'Ad',
  'profile.lastName': 'Soyad',
  'profile.email': 'E-posta',
  'profile.allFieldsRequired': 'Lütfen tüm alanları doldurun',
  'profile.profileUpdated': 'Profil başarıyla güncellendi',
  'profile.updateFailed': 'Profil güncellenirken hata oluştu',
  'profile.currentPassword': 'Mevcut Şifre',
  'profile.newPassword': 'Yeni Şifre',
  'profile.confirmPassword': 'Şifreyi Onayla',
  'profile.passwordsDoNotMatch': 'Şifreler eşleşmiyor',
  'profile.passwordTooShort': 'Şifre en az 6 karakter olmalıdır',
  'profile.passwordChanged': 'Şifre başarıyla değiştirildi',
  'profile.passwordChangeFailed': 'Şifre değiştirilirken hata oluştu',
  'profile.passwordRequirements': 'Şifre gereksinimleri karşılamıyor',
  'profile.minLength': 'En az 6 karakter',
  'profile.hasLetter': 'En az bir harf içeriyor',
  'profile.hasNumber': 'En az bir sayı içeriyor',
  'profile.passwordsMatch': 'Şifreler eşleşiyor',
  
  // Language
  'language.title': 'Dil',
  'language.description': 'Uygulama arayüzü için tercih ettiğiniz dili seçin. Değişiklikleri uygulamak için uygulama yeniden başlatılacaktır.',
  'language.info': 'Dil seçiminizden bağımsız olarak bazı içerikler İngilizce olarak görünmeye devam edebilir.'
};

// Japanese translations
const ja: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'キャンセル',
  'common.save': '保存',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.loading': '読み込み中...',
  'common.retry': '再試行',
  'common.error': 'エラー',
  'common.success': '成功',
  'common.version': 'バージョン',
  'common.logout': 'ログアウト',
  'common.and': 'と',
  
  // Dashboard
  'dashboard.title': 'ダッシュボード',
  'dashboard.welcome': 'ようこそ',
  'dashboard.upload': 'アップロード',
  'dashboard.history': '履歴',
  'dashboard.profile': 'プロフィール',
  'dashboard.recentDocuments': '最近のドキュメント',
  'dashboard.viewAll': 'すべてのドキュメントを表示',
  'dashboard.noDocuments': 'ドキュメントがまだありません',
  'dashboard.uploadFirst': '最初のドキュメントをアップロードして始めましょう',
  'dashboard.documentsRemaining': '残りのドキュメント',
  'dashboard.upgrade': 'アップグレード',
  'dashboard.reactivate': '再活性化',
  
  // Upload
  'upload.title': 'ドキュメントをアップロード',
  'upload.selectImage': '画像を選択',
  'upload.takePhoto': '写真を撮る',
  'upload.processing': '処理中...',
  'upload.success': 'ドキュメントが正常にアップロードされました',
  'upload.error': 'ドキュメントのアップロード中にエラーが発生しました',
  'upload.permissionRequired': '権限が必要',
  'upload.cameraPermission': '写真を撮るにはカメラの権限が必要',
  'upload.successMessage': 'ドキュメントがアップロードされて処理中です',
  'upload.errorMessage': 'ドキュメントのアップロード中にエラーが発生しました。もう一度お試しください。',
  'upload.confirm': '確認',
  'upload.selectImageDescription': 'ギャラリーから画像を選択',
  'upload.takePhotoDescription': 'カメラで新しい写真を撮る',
  
  // History
  'history.title': 'ドキュメント履歴',
  'history.noDocuments': 'ドキュメントがまだありません',
  'history.uploadFirst': '最初のドキュメントをアップロードして始めましょう',
  'history.loadingDocuments': 'ドキュメントを読み込み中...',
  'history.errorLoading': 'ドキュメントの読み込み中にエラーが発生しました',
  'history.status.completed': '完了',
  'history.status.processing': '処理中',
  'history.status.failed': '失敗',
  
  // Document View
  'docView.title': 'ドキュメントビューア',
  'docView.loading': 'ドキュメントを読み込み中...',
  'docView.error': 'ドキュメントの読み込み中にエラーが発生しました',
  'docView.noPdf': 'PDFドキュメントが利用できません',
  'docView.invalidDocument': '無効なドキュメントID',
  'docView.failedToLoad': 'ドキュメントの読み込みに失敗しました',
  'docView.pdfRenderError': 'PDFドキュメントのレンダリングに失敗しました',
  'docView.sharingFailed': '共有に失敗',
  
  // Profile
  'profile.title': 'プロフィール',
  'profile.editProfile': 'プロフィールを編集',
  'profile.notifications': '通知',
  'profile.security': 'セキュリティ',
  'profile.helpSupport': 'ヘルプとサポート',
  'profile.appearance': '外観',
  'profile.language': '言語',
  'profile.logout': 'ログアウト',
  'profile.account': 'アカウント',
  'profile.preferences': '設定',
  'profile.loadingProfile': 'プロフィールを読み込み中...',
  'profile.errorProfile': 'プロフィールの読み込みエラー',
  'profile.settings': '設定',
  'profile.darkMode': 'ダークモード',
  'profile.changePassword': 'パスワード変更',
  'profile.privacyPolicy': 'プライバシーポリシー',
  'profile.termsOfService': '利用規約',
  'profile.logoutTitle': 'ログアウト',
  'profile.logoutConfirm': 'ログアウトしてもよろしいですか？',
  'profile.selectTheme': 'テーマを選択',
  'profile.systemDefault': 'システムのデフォルト',
  'profile.lightMode': 'ライトモード',
  'profile.themeChangeNote': '変更はアプリを再起動することで適用されます。',
  'profile.firstName': '名',
  'profile.lastName': '姓',
  'profile.email': 'メールアドレス',
  'profile.allFieldsRequired': 'すべての項目を入力してください',
  'profile.profileUpdated': 'プロフィールが正常に更新されました',
  'profile.updateFailed': 'プロフィールの更新に失敗しました',
  'profile.currentPassword': '現在のパスワード',
  'profile.newPassword': '新しいパスワード',
  'profile.confirmPassword': 'パスワードの確認',
  'profile.passwordsDoNotMatch': 'パスワードが一致しません',
  'profile.passwordTooShort': 'パスワードは6文字以上である必要があります',
  'profile.passwordChanged': 'パスワードが正常に変更されました',
  'profile.passwordChangeFailed': 'パスワードの変更に失敗しました',
  'profile.passwordRequirements': 'パスワードが要件を満たしていません',
  'profile.minLength': '少なくとも6文字',
  'profile.hasLetter': '少なくとも1つの文字を含む',
  'profile.hasNumber': '少なくとも1つの数字を含む',
  'profile.passwordsMatch': 'パスワードが一致します',
  
  // Language
  'language.title': '言語',
  'language.description': 'アプリのインターフェース用に希望の言語を選択してください。変更を適用するためにアプリが再起動します。',
  'language.info': '言語選択に関係なく、一部のコンテンツは英語で表示される場合があります。'
};

// French translations
const fr: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.loading': 'Chargement...',
  'common.retry': 'Réessayer',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.version': 'Version',
  'common.logout': 'Déconnexion',
  'common.and': 'et',
  
  // Dashboard
  'dashboard.title': 'Tableau de bord',
  'dashboard.welcome': 'Bienvenue',
  'dashboard.upload': 'Télécharger',
  'dashboard.history': 'Historique',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Documents récents',
  'dashboard.viewAll': 'Voir tous les documents',
  'dashboard.noDocuments': 'Pas encore de documents',
  'dashboard.uploadFirst': 'Téléchargez votre premier document pour commencer',
  'dashboard.documentsRemaining': 'documents restants',
  'dashboard.upgrade': 'Mettre à niveau',
  'dashboard.reactivate': 'Réactiver',
  
  // Upload
  'upload.title': 'Télécharger un document',
  'upload.selectImage': 'Sélectionner une image',
  'upload.takePhoto': 'Prendre une photo',
  'upload.processing': 'Traitement en cours...',
  'upload.success': 'Document téléchargé avec succès',
  'upload.error': 'Erreur lors du téléchargement du document',
  'upload.permissionRequired': 'Permission requise',
  'upload.cameraPermission': 'L\'autorisation de la caméra est nécessaire pour prendre des photos',
  'upload.successMessage': 'Votre document a été téléchargé et est en cours de traitement',
  'upload.errorMessage': 'Une erreur s\'est produite lors du téléchargement de votre document. Veuillez réessayer.',
  'upload.confirm': 'Confirmer',
  'upload.selectImageDescription': 'Choisissez une image de votre galerie',
  'upload.takePhotoDescription': 'Prenez une nouvelle photo avec votre caméra',
  
  // History
  'history.title': 'Historique des documents',
  'history.noDocuments': 'Pas encore de documents',
  'history.uploadFirst': 'Téléchargez votre premier document pour commencer',
  'history.loadingDocuments': 'Chargement des documents...',
  'history.errorLoading': 'Erreur lors du chargement des documents',
  'history.status.completed': 'Terminé',
  'history.status.processing': 'En cours',
  'history.status.failed': 'Échoué',
  
  // Document View
  'docView.title': 'Visionneur de document',
  'docView.loading': 'Chargement du document...',
  'docView.error': 'Erreur lors du chargement du document',
  'docView.noPdf': 'Pas de document PDF disponible',
  'docView.invalidDocument': 'ID de document invalide',
  'docView.failedToLoad': 'Échec du chargement du document',
  'docView.pdfRenderError': 'Erreur de rendu du document PDF',
  'docView.sharingFailed': 'Échec de la partage',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Modifier le profil',
  'profile.notifications': 'Notifications',
  'profile.security': 'Sécurité',
  'profile.helpSupport': 'Aide et support',
  'profile.appearance': 'Apparence',
  'profile.language': 'Langue',
  'profile.logout': 'Déconnexion',
  'profile.account': 'Compte',
  'profile.preferences': 'Préférences',
  'profile.loadingProfile': 'Chargement du profil...',
  'profile.errorProfile': 'Erreur lors du chargement du profil',
  'profile.settings': 'Paramètres',
  'profile.darkMode': 'Mode sombre',
  'profile.changePassword': 'Changer le mot de passe',
  'profile.privacyPolicy': 'Politique de confidentialité',
  'profile.termsOfService': 'Conditions d\'utilisation',
  'profile.logoutTitle': 'Déconnexion',
  'profile.logoutConfirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
  'profile.selectTheme': 'Sélectionner un thème',
  'profile.systemDefault': 'Défaut du système',
  'profile.lightMode': 'Mode clair',
  'profile.themeChangeNote': 'Les changements seront appliqués immédiatement à l\'interface de l\'application.',
  'profile.firstName': 'Prénom',
  'profile.lastName': 'Nom',
  'profile.email': 'E-mail',
  'profile.allFieldsRequired': 'Veuillez remplir tous les champs',
  'profile.profileUpdated': 'Profil mis à jour avec succès',
  'profile.updateFailed': 'Échec de la mise à jour du profil',
  'profile.currentPassword': 'Mot de passe actuel',
  'profile.newPassword': 'Nouveau mot de passe',
  'profile.confirmPassword': 'Confirmer le mot de passe',
  'profile.passwordsDoNotMatch': 'Les mots de passe ne correspondent pas',
  'profile.passwordTooShort': 'Le mot de passe doit comporter au moins 6 caractères',
  'profile.passwordChanged': 'Mot de passe changé avec succès',
  'profile.passwordChangeFailed': 'Échec du changement de mot de passe',
  'profile.passwordRequirements': 'Mot de passe ne répond pas aux exigences',
  'profile.minLength': 'Au moins 6 caractères',
  'profile.hasLetter': 'Contient au moins une lettre',
  'profile.hasNumber': 'Contient au moins un chiffre',
  'profile.passwordsMatch': 'Les mots de passe correspondent',
  
  // Language
  'language.title': 'Langue',
  'language.description': 'Sélectionnez votre langue préférée pour l\'interface de l\'application. L\'application redémarrera pour appliquer les changements.',
  'language.info': 'Certains contenus peuvent toujours apparaître en anglais quelle que soit votre sélection de langue.',
  'language.selectLanguage': 'Sélectionnez votre langue préférée',
  'language.changeNote': 'Les changements seront appliqués immédiatement à l\'interface de l\'application.'
};

// Combine all translations
const translations: Record<Language, TranslationDictionary> = {
  en,
  de,
  es,
  ru,
  tr,
  ja,
  fr
};

// Function to get a translation
export const translate = (key: TranslationKey, language: Language = 'en'): string => {
  // Get the translation dictionary for the specified language
  const dictionary = translations[language] || translations.en;
  
  // Return the translation or fall back to English if not found
  return dictionary[key] || translations.en[key] || key;
};

// React hook for translations
export const useTranslation = () => {
  const { language } = useLanguage();
  
  // Memoize the translate function to avoid unnecessary re-renders
  const t = useMemo(() => 
    (key: TranslationKey) => translate(key, language),
    [language]
  );
  
  // Format function for interpolating values into translations
  const format = (text: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, String(value)),
      text
    );
  };
  
  return { t, format, language };
};

// Hook for getting translations in a specific language
export const useTranslate = (language: Language = 'en') => {
  // Memoize the translate function to avoid unnecessary re-renders
  const t = useMemo(() => 
    (key: TranslationKey) => translate(key, language),
    [language]
  );
  
  return t;
};

// Create a default export object
const i18n = {
  translate,
  useTranslation,
  useTranslate,
  translations
};

export default i18n; 