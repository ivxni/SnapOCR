import { useCallback } from '@lynx-js/react';
import '../styles/WelcomePage.css';

interface WelcomePageProps {
  navigateTo: (page: string) => void;
}

export function WelcomePage({ navigateTo }: WelcomePageProps) {
  const handleLoginClick = useCallback(() => {
    navigateTo('login');
  }, [navigateTo]);

  const handleSignupClick = useCallback(() => {
    navigateTo('signup');
  }, [navigateTo]);

  return (
    <view className="WelcomePage">
      <view className="WelcomePage-content">
        <view className="WelcomePage-header">
          <text className="WelcomePage-title">Mistral OCR</text>
          <text className="WelcomePage-subtitle">Konvertieren Sie Bilder in durchsuchbare PDFs</text>
        </view>
        
        <view className="WelcomePage-description">
          <text className="WelcomePage-text">
            Willkommen bei Mistral OCR, der einfachsten Möglichkeit, Ihre Dokumente zu digitalisieren.
            Laden Sie ein Bild hoch und erhalten Sie sofort ein durchsuchbares PDF-Dokument.
          </text>
        </view>
        
        <view className="WelcomePage-buttons">
          <view className="WelcomePage-button WelcomePage-button--primary" bindtap={handleSignupClick}>
            <text className="WelcomePage-buttonText">Registrieren</text>
          </view>
          
          <view className="WelcomePage-button WelcomePage-button--secondary" bindtap={handleLoginClick}>
            <text className="WelcomePage-buttonText">Anmelden</text>
          </view>
        </view>
      </view>
    </view>
  );
} 