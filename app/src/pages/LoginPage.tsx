import { useState, useCallback } from '@lynx-js/react';
import { useAuth } from '../context/AuthContext.tsx';
import '../styles/AuthPages.css';

interface LoginPageProps {
  navigateTo: (page: string) => void;
}

export function LoginPage({ navigateTo }: LoginPageProps) {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailChange = useCallback((e: any) => {
    setEmail(e.target.value);
    clearError();
    setLocalError(null);
  }, [clearError]);

  const handlePasswordChange = useCallback((e: any) => {
    setPassword(e.target.value);
    clearError();
    setLocalError(null);
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    // Einfache Validierung
    if (!email.trim() || !password) {
      setLocalError('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigateTo('dashboard');
    } catch (err) {
      console.error('Anmeldefehler:', err);
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigateTo]);

  const handleSignupClick = useCallback(() => {
    navigateTo('signup');
  }, [navigateTo]);

  const handleBackClick = useCallback(() => {
    navigateTo('welcome');
  }, [navigateTo]);

  return (
    <view className="AuthPage">
      <view className="AuthPage-content">
        <view className="AuthPage-header">
          <text className="AuthPage-title">Anmelden</text>
          <text className="AuthPage-subtitle">Melden Sie sich bei Ihrem Konto an</text>
        </view>

        <view className="AuthPage-form">
          <view className="AuthPage-formGroup">
            <text className="AuthPage-label">E-Mail</text>
            <input
              type="email"
              className="AuthPage-input"
              placeholder="Ihre E-Mail-Adresse"
              value={email}
              onInput={handleEmailChange}
            />
          </view>

          <view className="AuthPage-formGroup">
            <text className="AuthPage-label">Passwort</text>
            <input
              type="password"
              className="AuthPage-input"
              placeholder="Ihr Passwort"
              value={password}
              onInput={handlePasswordChange}
            />
          </view>

          {(error || localError) && (
            <view className="AuthPage-error">
              <text className="AuthPage-errorText">{error || localError}</text>
            </view>
          )}

          <view className="AuthPage-button AuthPage-button--primary" bindtap={handleSubmit}>
            <text className="AuthPage-buttonText">
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </text>
          </view>
        </view>

        <view className="AuthPage-footer">
          <text className="AuthPage-footerText">
            Noch kein Konto?{' '}
            <text className="AuthPage-link" bindtap={handleSignupClick}>
              Registrieren
            </text>
          </text>
        </view>

        <view className="AuthPage-backButton" bindtap={handleBackClick}>
          <text className="AuthPage-backButtonText">Zurück</text>
        </view>
      </view>
    </view>
  );
} 