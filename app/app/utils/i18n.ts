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
  
  // Auth
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.email'
  | 'auth.password'
  | 'auth.forgotPassword'
  | 'auth.resetPassword'
  
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
  
  // Language
  | 'language.title'
  | 'language.description'
  | 'language.info';

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
  
  // Auth
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.resetPassword': 'Reset Password',
  
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
  
  // Language
  'language.title': 'Language',
  'language.description': 'Select your preferred language for the app interface. The app will restart to apply changes.',
  'language.info': 'Some content may still appear in English regardless of your language selection.'
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
  
  // Auth
  'auth.signIn': 'Iniciar Sesión',
  'auth.signUp': 'Registrarse',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.forgotPassword': '¿Olvidó su contraseña?',
  'auth.resetPassword': 'Restablecer Contraseña',
  
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
  
  // Language
  'language.title': 'Idioma',
  'language.description': 'Selecciona tu idioma preferido para la interfaz de la aplicación. La aplicación se reiniciará para aplicar los cambios.',
  'language.info': 'Algunos contenidos pueden seguir apareciendo en inglés independientemente de tu selección de idioma.'
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
  
  // Auth
  'auth.signIn': 'Anmelden',
  'auth.signUp': 'Registrieren',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.forgotPassword': 'Passwort vergessen?',
  'auth.resetPassword': 'Passwort zurücksetzen',
  
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
  
  // Language
  'language.title': 'Sprache',
  'language.description': 'Wählen Sie Ihre bevorzugte Sprache für die App-Oberfläche. Die App wird neu gestartet, um Änderungen zu übernehmen.',
  'language.info': 'Einige Inhalte können unabhängig von Ihrer Sprachauswahl weiterhin auf Englisch angezeigt werden.'
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
  
  // Auth
  'auth.signIn': 'Войти',
  'auth.signUp': 'Зарегистрироваться',
  'auth.email': 'Эл. почта',
  'auth.password': 'Пароль',
  'auth.forgotPassword': 'Забыли пароль?',
  'auth.resetPassword': 'Сбросить пароль',
  
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
  
  // Auth
  'auth.signIn': 'Giriş Yap',
  'auth.signUp': 'Kaydol',
  'auth.email': 'E-posta',
  'auth.password': 'Şifre',
  'auth.forgotPassword': 'Şifremi Unuttum?',
  'auth.resetPassword': 'Şifreyi Sıfırla',
  
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
  
  // Auth
  'auth.signIn': 'サインイン',
  'auth.signUp': '登録',
  'auth.email': 'メール',
  'auth.password': 'パスワード',
  'auth.forgotPassword': 'パスワードをお忘れですか？',
  'auth.resetPassword': 'パスワードをリセット',
  
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
  
  // Profile
  'profile.title': 'プロフィール',
  'profile.editProfile': 'プロフィール編集',
  'profile.notifications': '通知',
  'profile.security': 'セキュリティ',
  'profile.helpSupport': 'ヘルプとサポート',
  'profile.appearance': '外観',
  'profile.language': '言語',
  'profile.logout': 'ログアウト',
  'profile.account': 'アカウント',
  'profile.preferences': '設定',
  'profile.loadingProfile': 'プロフィールを読み込み中...',
  'profile.errorProfile': 'プロフィールの読み込み中にエラーが発生しました',
  'profile.settings': '設定',
  'profile.darkMode': 'ダークモード',
  'profile.changePassword': 'パスワード変更',
  'profile.privacyPolicy': 'プライバシーポリシー',
  'profile.termsOfService': '利用規約',
  'profile.logoutTitle': 'ログアウト',
  'profile.logoutConfirm': 'ログアウトしてもよろしいですか？',
  
  // Language
  'language.title': '言語',
  'language.description': 'アプリのインターフェース用に希望の言語を選択してください。変更を適用するためにアプリが再起動します。',
  'language.info': '言語選択に関係なく、一部のコンテンツは英語で表示される場合があります。'
};

// Combine all translations
const translations: Record<Language, TranslationDictionary> = {
  en,
  de,
  es,
  ru,
  tr,
  ja
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