import { useState, useCallback, useEffect } from '@lynx-js/react';
import { useAuth } from '../context/AuthContext.tsx';
import { uploadDocument, getDocumentStatus } from '../services/documentService.tsx';
import '../styles/DashboardPage.css';

interface DashboardPageProps {
  navigateTo: (page: string) => void;
}

export function DashboardPage({ navigateTo }: DashboardPageProps) {
  const { user, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Datei auswählen
  const handleFileSelect = useCallback((e: any) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  // Datei hochladen
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Bitte wählen Sie eine Datei aus');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setProcessingStatus('uploading');

      // Simuliere Fortschritt (in einer echten App würde dies durch tatsächlichen Upload-Fortschritt ersetzt)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Datei hochladen
      const response = await uploadDocument(selectedFile);
      clearInterval(progressInterval);
      
      if (response.success) {
        setDocumentId(response.documentId);
        setProcessingStatus('processing');
        setUploadProgress(100);
        
        // Status-Polling starten
        pollDocumentStatus(response.documentId);
      } else {
        throw new Error('Fehler beim Hochladen');
      }
    } catch (err) {
      console.error('Upload-Fehler:', err);
      setError('Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.');
      setProcessingStatus(null);
      setUploading(false);
    }
  }, [selectedFile]);

  // Dokument-Status abfragen
  const pollDocumentStatus = useCallback(async (id: string) => {
    try {
      const checkStatus = async () => {
        const statusResponse = await getDocumentStatus(id);
        
        if (statusResponse.success) {
          if (statusResponse.data.status === 'completed') {
            setProcessingStatus('completed');
            setUploading(false);
          } else if (statusResponse.data.status === 'failed') {
            setProcessingStatus('failed');
            setError('Verarbeitung fehlgeschlagen. Bitte versuchen Sie es erneut.');
            setUploading(false);
          } else {
            // Weiter abfragen, wenn noch in Bearbeitung
            setTimeout(checkStatus, 2000);
          }
        } else {
          throw new Error('Fehler beim Abrufen des Status');
        }
      };
      
      checkStatus();
    } catch (err) {
      console.error('Status-Abfrage-Fehler:', err);
      setError('Fehler beim Abrufen des Dokumentstatus');
      setProcessingStatus('failed');
      setUploading(false);
    }
  }, []);

  // Zurücksetzen
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setProcessingStatus(null);
    setDocumentId(null);
    setError(null);
  }, []);

  // Zur Verlaufsseite navigieren
  const handleHistoryClick = useCallback(() => {
    navigateTo('history');
  }, [navigateTo]);

  // Abmelden
  const handleLogout = useCallback(async () => {
    await logout();
    navigateTo('welcome');
  }, [logout, navigateTo]);

  // Dokument herunterladen
  const handleDownload = useCallback(() => {
    if (documentId) {
      window.open(`http://localhost:5000/api/documents/${documentId}/download`, '_blank');
    }
  }, [documentId]);

  return (
    <view className="DashboardPage">
      <view className="DashboardPage-header">
        <view className="DashboardPage-headerContent">
          <text className="DashboardPage-title">Mistral OCR</text>
          <view className="DashboardPage-userInfo">
            <text className="DashboardPage-userName">
              {user ? `${user.firstName} ${user.lastName}` : 'Benutzer'}
            </text>
            <view className="DashboardPage-menu">
              <view className="DashboardPage-menuItem" bindtap={handleHistoryClick}>
                <text className="DashboardPage-menuItemText">Verlauf</text>
              </view>
              <view className="DashboardPage-menuItem" bindtap={handleLogout}>
                <text className="DashboardPage-menuItemText">Abmelden</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view className="DashboardPage-content">
        <view className="DashboardPage-uploadSection">
          <text className="DashboardPage-sectionTitle">Dokument hochladen</text>
          <text className="DashboardPage-sectionDescription">
            Laden Sie ein Bild hoch, um es in ein durchsuchbares PDF zu konvertieren
          </text>

          {!uploading && !processingStatus && (
            <view className="DashboardPage-uploadControls">
              <view className="DashboardPage-fileInput">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/tiff,application/pdf"
                  onChange={handleFileSelect}
                />
                <view className="DashboardPage-fileInputButton">
                  <text className="DashboardPage-fileInputButtonText">Datei auswählen</text>
                </view>
                {selectedFile && (
                  <text className="DashboardPage-fileName">{selectedFile.name}</text>
                )}
              </view>

              <view
                className="DashboardPage-button DashboardPage-button--primary"
                bindtap={handleUpload}
              >
                <text className="DashboardPage-buttonText">Hochladen & Konvertieren</text>
              </view>
            </view>
          )}

          {(uploading || processingStatus) && (
            <view className="DashboardPage-processingSection">
              <view className="DashboardPage-progressBar">
                <view
                  className="DashboardPage-progressBarFill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </view>

              <text className="DashboardPage-processingStatus">
                {processingStatus === 'uploading' && 'Datei wird hochgeladen...'}
                {processingStatus === 'processing' && 'Dokument wird verarbeitet...'}
                {processingStatus === 'completed' && 'Verarbeitung abgeschlossen!'}
                {processingStatus === 'failed' && 'Verarbeitung fehlgeschlagen'}
              </text>

              {processingStatus === 'completed' && (
                <view className="DashboardPage-resultActions">
                  <view
                    className="DashboardPage-button DashboardPage-button--primary"
                    bindtap={handleDownload}
                  >
                    <text className="DashboardPage-buttonText">PDF herunterladen</text>
                  </view>
                  <view
                    className="DashboardPage-button DashboardPage-button--secondary"
                    bindtap={handleReset}
                  >
                    <text className="DashboardPage-buttonText">Neues Dokument</text>
                  </view>
                </view>
              )}

              {processingStatus === 'failed' && (
                <view
                  className="DashboardPage-button DashboardPage-button--secondary"
                  bindtap={handleReset}
                >
                  <text className="DashboardPage-buttonText">Erneut versuchen</text>
                </view>
              )}
            </view>
          )}

          {error && (
            <view className="DashboardPage-error">
              <text className="DashboardPage-errorText">{error}</text>
            </view>
          )}
        </view>
      </view>
    </view>
  );
} 