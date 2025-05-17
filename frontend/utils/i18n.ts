// Translation key constants
export const COMMON_KEYS = {
  ERROR: 'common.error',
  OK: 'common.ok',
  RETRY: 'common.retry',
  SUCCESS: 'common.success',
};

export const DOC_VIEW_KEYS = {
  TITLE: 'docView.title',
  LOADING: 'docView.loading',
  ERROR: 'docView.error',
  FAILED_TO_LOAD: 'docView.failedToLoad',
  INVALID_DOCUMENT: 'docView.invalidDocument',
  PDF_RENDER_ERROR: 'docView.pdfRenderError',
  SHARING_FAILED: 'docView.sharingFailed',
  IMAGE_PICK_ERROR: 'docView.imagePickError',
  NO_IMAGE_SELECTED: 'docView.noImageSelected',
  UPLOAD_SUCCESS: 'docView.uploadSuccess',
  UPLOAD_ERROR: 'docView.uploadError',
  SELECT_IMAGE: 'docView.selectImage',
  UPLOAD: 'docView.upload',
};

export const TRANSLATION_KEYS = {
  COMMON: COMMON_KEYS,
  DOC_VIEW: DOC_VIEW_KEYS,
};

export type TranslationKey = 
  | typeof COMMON_KEYS[keyof typeof COMMON_KEYS]
  | typeof DOC_VIEW_KEYS[keyof typeof DOC_VIEW_KEYS];

const translations = {
  de: {
    [COMMON_KEYS.ERROR]: 'Fehler',
    [COMMON_KEYS.OK]: 'OK',
    [COMMON_KEYS.RETRY]: 'Erneut versuchen',
    [COMMON_KEYS.SUCCESS]: 'Erfolg',
    [DOC_VIEW_KEYS.TITLE]: 'Dokument',
    [DOC_VIEW_KEYS.LOADING]: 'Laden...',
    [DOC_VIEW_KEYS.ERROR]: 'Fehler beim Laden des Dokuments',
    [DOC_VIEW_KEYS.FAILED_TO_LOAD]: 'Dokument konnte nicht geladen werden',
    [DOC_VIEW_KEYS.INVALID_DOCUMENT]: 'Ungültiges Dokument',
    [DOC_VIEW_KEYS.PDF_RENDER_ERROR]: 'PDF konnte nicht angezeigt werden',
    [DOC_VIEW_KEYS.SHARING_FAILED]: 'Dokument konnte nicht geteilt werden',
    [DOC_VIEW_KEYS.IMAGE_PICK_ERROR]: 'Fehler beim Laden des Bildes',
    [DOC_VIEW_KEYS.NO_IMAGE_SELECTED]: 'Bitte wählen Sie zuerst ein Bild aus',
    [DOC_VIEW_KEYS.UPLOAD_SUCCESS]: 'Bild erfolgreich hochgeladen',
    [DOC_VIEW_KEYS.UPLOAD_ERROR]: 'Fehler beim Hochladen des Bildes',
    [DOC_VIEW_KEYS.SELECT_IMAGE]: 'Bild auswählen',
    [DOC_VIEW_KEYS.UPLOAD]: 'Hochladen',
  },
  en: {
    [COMMON_KEYS.ERROR]: 'Error',
    [COMMON_KEYS.OK]: 'OK',
    [COMMON_KEYS.RETRY]: 'Retry',
    [COMMON_KEYS.SUCCESS]: 'Success',
    [DOC_VIEW_KEYS.TITLE]: 'Document',
    [DOC_VIEW_KEYS.LOADING]: 'Loading...',
    [DOC_VIEW_KEYS.ERROR]: 'Error loading document',
    [DOC_VIEW_KEYS.FAILED_TO_LOAD]: 'Failed to load document',
    [DOC_VIEW_KEYS.INVALID_DOCUMENT]: 'Invalid document',
    [DOC_VIEW_KEYS.PDF_RENDER_ERROR]: 'Failed to render PDF',
    [DOC_VIEW_KEYS.SHARING_FAILED]: 'Failed to share document',
    [DOC_VIEW_KEYS.IMAGE_PICK_ERROR]: 'Error loading image',
    [DOC_VIEW_KEYS.NO_IMAGE_SELECTED]: 'Please select an image first',
    [DOC_VIEW_KEYS.UPLOAD_SUCCESS]: 'Image uploaded successfully',
    [DOC_VIEW_KEYS.UPLOAD_ERROR]: 'Error uploading image',
    [DOC_VIEW_KEYS.SELECT_IMAGE]: 'Select Image',
    [DOC_VIEW_KEYS.UPLOAD]: 'Upload',
  },
};

export function useTranslation() {
  // For now, we'll just use German translations
  const currentLanguage = 'de';
  
  return {
    t: (key: TranslationKey): string => {
      return translations[currentLanguage][key] || key;
    }
  };
} 