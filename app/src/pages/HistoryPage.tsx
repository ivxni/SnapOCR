import { useState, useCallback, useEffect } from '@lynx-js/react';
import { useAuth } from '../context/AuthContext.tsx';
import { getUserDocuments, archiveDocument } from '../services/documentService.tsx';
import '../styles/HistoryPage.css';

interface HistoryPageProps {
  navigateTo: (page: string) => void;
}

interface Document {
  id: string;
  originalFileName: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  fileSize: number;
  storageUrl: string | null;
}

export function HistoryPage({ navigateTo }: HistoryPageProps) {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dokumente laden
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserDocuments();
      
      if (response.success) {
        setDocuments(response.data);
      } else {
        throw new Error('Fehler beim Laden der Dokumente');
      }
    } catch (err) {
      console.error('Fehler beim Laden der Dokumente:', err);
      setError('Dokumente konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Beim Laden der Komponente Dokumente abrufen
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Dokument archivieren
  const handleArchiveDocument = useCallback(async (documentId: string) => {
    try {
      const response = await archiveDocument(documentId);
      
      if (response.success) {
        // Dokument aus der Liste entfernen
        setDocuments(prevDocuments => 
          prevDocuments.filter(doc => doc.id !== documentId)
        );
      } else {
        throw new Error('Fehler beim Archivieren des Dokuments');
      }
    } catch (err) {
      console.error('Fehler beim Archivieren:', err);
      setError('Dokument konnte nicht archiviert werden. Bitte versuchen Sie es später erneut.');
    }
  }, []);

  // Dokument herunterladen
  const handleDownloadDocument = useCallback((documentId: string) => {
    window.open(`http://localhost:5000/api/documents/${documentId}/download`, '_blank');
  }, []);

  // Zum Dashboard navigieren
  const handleDashboardClick = useCallback(() => {
    navigateTo('dashboard');
  }, [navigateTo]);

  // Abmelden
  const handleLogout = useCallback(async () => {
    await logout();
    navigateTo('welcome');
  }, [logout, navigateTo]);

  // Datum formatieren
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dateigröße formatieren
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <view className="HistoryPage">
      <view className="HistoryPage-header">
        <view className="HistoryPage-headerContent">
          <text className="HistoryPage-title">Mistral OCR</text>
          <view className="HistoryPage-userInfo">
            <text className="HistoryPage-userName">
              {user ? `${user.firstName} ${user.lastName}` : 'Benutzer'}
            </text>
            <view className="HistoryPage-menu">
              <view className="HistoryPage-menuItem" bindtap={handleDashboardClick}>
                <text className="HistoryPage-menuItemText">Dashboard</text>
              </view>
              <view className="HistoryPage-menuItem" bindtap={handleLogout}>
                <text className="HistoryPage-menuItemText">Abmelden</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view className="HistoryPage-content">
        <view className="HistoryPage-sectionHeader">
          <text className="HistoryPage-sectionTitle">Dokumentenverlauf</text>
          <text className="HistoryPage-sectionDescription">
            Hier finden Sie alle Ihre konvertierten Dokumente
          </text>
        </view>

        {loading ? (
          <view className="HistoryPage-loading">
            <text className="HistoryPage-loadingText">Dokumente werden geladen...</text>
          </view>
        ) : error ? (
          <view className="HistoryPage-error">
            <text className="HistoryPage-errorText">{error}</text>
            <view className="HistoryPage-button" bindtap={loadDocuments}>
              <text className="HistoryPage-buttonText">Erneut versuchen</text>
            </view>
          </view>
        ) : documents.length === 0 ? (
          <view className="HistoryPage-empty">
            <text className="HistoryPage-emptyText">
              Sie haben noch keine Dokumente konvertiert.
            </text>
            <view className="HistoryPage-button" bindtap={handleDashboardClick}>
              <text className="HistoryPage-buttonText">Zum Dashboard</text>
            </view>
          </view>
        ) : (
          <view className="HistoryPage-documentsList">
            {documents.map(doc => (
              <view key={doc.id} className="HistoryPage-documentItem">
                <view className="HistoryPage-documentInfo">
                  <text className="HistoryPage-documentName">{doc.originalFileName}</text>
                  <text className="HistoryPage-documentDate">
                    Erstellt am: {formatDate(doc.createdAt)}
                  </text>
                  <text className="HistoryPage-documentSize">
                    Größe: {formatFileSize(doc.fileSize)}
                  </text>
                  <text className="HistoryPage-documentStatus">
                    Status: {
                      doc.status === 'completed' ? 'Abgeschlossen' :
                      doc.status === 'processing' ? 'In Bearbeitung' :
                      doc.status === 'failed' ? 'Fehlgeschlagen' : 'Unbekannt'
                    }
                  </text>
                </view>
                <view className="HistoryPage-documentActions">
                  {doc.status === 'completed' && (
                    <view
                      className="HistoryPage-documentButton HistoryPage-documentButton--primary"
                      bindtap={() => handleDownloadDocument(doc.id)}
                    >
                      <text className="HistoryPage-documentButtonText">Herunterladen</text>
                    </view>
                  )}
                  <view
                    className="HistoryPage-documentButton HistoryPage-documentButton--secondary"
                    bindtap={() => handleArchiveDocument(doc.id)}
                  >
                    <text className="HistoryPage-documentButtonText">Archivieren</text>
                  </view>
                </view>
              </view>
            ))}
          </view>
        )}
      </view>
    </view>
  );
} 