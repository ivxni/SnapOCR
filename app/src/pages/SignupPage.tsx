import { useState, useCallback } from '@lynx-js/react';
import { useAuth } from '../context/AuthContext.tsx';
import '../styles/AuthPages.css';

interface SignupPageProps {
  navigateTo: (page: string) => void;
}

export function SignupPage({ navigateTo }: SignupPageProps) {
  const { register, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFirstNameChange = useCallback((e: any) => {
    setFirstName(e.target.value);
    clearError();
    setLocalError(null);
  }, [clearError]);

  const handleLastNameChange = useCallback((e: any) => {
    setLastName(e.target.value);
    clearError();
    setLocalError(null);
  }, [clearError]);

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

  const handleConfirmPasswordChange = useCallback((e: any) => {
    setConfirmPassword(e.target.value);
    clearError();
    setLocalError(null);
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    // Einfache Validierung
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Die Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      setLocalError('Das Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    try {
      setLoading(true);
      await register(firstName, lastName, email, password);
      navigateTo('dashboard');
    } catch (err) {
      console.error('Registrierungsfehler:', err);
    } finally {
      setLoading(false);
    }
  }, [firstName, lastName, email, password, confirmPassword, register, navigateTo]);

  const handleLoginClick = useCallback(() => {
    navigateTo('login');
  }, [navigateTo]);

  const handleBackClick = useCallback(() => {
    navigateTo('welcome');
  }, [navigateTo]);

  return (
    <view className="AuthPage">
      <view className="AuthPage-content">
        <view className="AuthPage-header">
          <text className="AuthPage-title">Registrieren</text>
          <text className="AuthPage-subtitle">Erstellen Sie ein neues Konto</text>
        </view>

        <view className="AuthPage-form">
          <view className="AuthPage-formRow">
            <view className="AuthPage-formGroup AuthPage-formGroup--half">
              <text className="AuthPage-label">Vorname</text>
              <input
                type="text"
                className="AuthPage-input"
                placeholder="Ihr Vorname"
                value={firstName}
                onInput={handleFirstNameChange}
              />
            </view>

            <view className="AuthPage-formGroup AuthPage-formGroup--half">
              <text className="AuthPage-label">Nachname</text>
              <input
                type="text"
                className="AuthPage-input"
                placeholder="Ihr Nachname"
                value={lastName}
                onInput={handleLastNameChange}
              />
            </view>
          </view>

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

          <view className="AuthPage-formGroup">
            <text className="AuthPage-label">Passwort bestätigen</text>
            <input
              type="password"
              className="AuthPage-input"
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onInput={handleConfirmPasswordChange}
            />
          </view>

          {(error || localError) && (
            <view className="AuthPage-error">
              <text className="AuthPage-errorText">{error || localError}</text>
            </view>
          )}

          <view className="AuthPage-button AuthPage-button--primary" bindtap={handleSubmit}>
            <text className="AuthPage-buttonText">
              {loading ? 'Wird registriert...' : 'Registrieren'}
            </text>
          </view>
        </view>

        <view className="AuthPage-footer">
          <text className="AuthPage-footerText">
            Bereits ein Konto?{' '}
            <text className="AuthPage-link" bindtap={handleLoginClick}>
              Anmelden
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