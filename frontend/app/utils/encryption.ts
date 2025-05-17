import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Base64 from '../utils/base64';

const ENCRYPTION_KEY_STORAGE_KEY = 'user_encryption_key';

/**
 * Extrem einfache Verschlüsselung - nur für Demo-Zwecke
 * Diese Implementierung bietet nur minimalen Schutz und sollte in Produktion durch eine echte Kryptobibliothek ersetzt werden.
 */

// Einfache XOR-Verschlüsselung für Demonstration
function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    // XOR jedes Zeichen mit einem Zeichen aus dem Schlüssel
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

// Einfache XOR-Entschlüsselung (identisch zur Verschlüsselung bei XOR)
function simpleDecrypt(encrypted: string, key: string): string {
  return simpleEncrypt(encrypted, key); // Bei XOR ist Verschlüsselung = Entschlüsselung
}

// Generiere einen einfachen Schlüssel
const generateSimpleKey = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }
  return key;
};

/**
 * Generiert oder holt den nutzerspezifischen Verschlüsselungsschlüssel
 */
export const getUserEncryptionKey = async (): Promise<string> => {
  try {
    // Versuche den vorhandenen Schlüssel zu holen
    let key: string | null;
    
    if (Platform.OS === 'web') {
      key = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    } else {
      // Nutze AsyncStorage für mobile Geräte
      key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    }
    
    // Wenn kein Schlüssel gefunden, generiere einen neuen
    if (!key) {
      key = generateSimpleKey(64);
      
      // Speichere den neuen Schlüssel
      if (Platform.OS === 'web') {
        localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, key);
      } else {
        await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, key);
      }
    }
    
    return key;
  } catch (error) {
    console.error('Error getting encryption key:', error);
    throw new Error('Failed to get encryption key');
  }
};

/**
 * Einfache Version eines Fingerabdrucks für einen Schlüssel
 */
function simpleFingerprint(key: string): string {
  // Einfacher "Hash": Nehme die ersten 5 und letzten 5 Zeichen
  return key.substring(0, 5) + key.substring(key.length - 5);
}

/**
 * Verschlüsselt eine Datei mit einfacher XOR-Verschlüsselung
 * @param fileUri - Der URI der zu verschlüsselnden Datei
 * @returns Das verschlüsselte Ergebnis mit dem temporären Pfad
 */
export const encryptFile = async (fileUri: string): Promise<{encryptedUri: string, keyFingerprint: string}> => {
  try {
    // Hole den Nutzerschlüssel
    const key = await getUserEncryptionKey();
    
    // Erzeuge einen Fingerabdruck des Schlüssels
    const keyFingerprint = simpleFingerprint(key);
    
    // Lese die Datei als Base64
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    // Verschlüssele den Inhalt mit unserer einfachen Funktion
    const encrypted = simpleEncrypt(fileContent, key);
    
    // Erstelle ein JSON mit den Metadaten
    const encryptedData = JSON.stringify({
      content: Base64.encode(encrypted), // Base64-Kodierung des verschlüsselten Inhalts
      version: '1.0'
    });
    
    // Speichere die verschlüsselte Datei temporär
    const tempDir = `${FileSystem.cacheDirectory || ''}encrypted_files/`;
    const fileName = `encrypted_${Date.now()}.enc`;
    const encryptedUri = tempDir + fileName;
    
    // Stelle sicher, dass das Verzeichnis existiert
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
    
    // Schreibe die verschlüsselte Datei
    await FileSystem.writeAsStringAsync(encryptedUri, encryptedData);
    
    return { encryptedUri, keyFingerprint };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Bereitet eine Datei für sicheren Upload vor
 * @param fileUri - Original Datei URI
 * @returns Objekt mit verschlüsselter Datei URI und Metadaten
 */
export const prepareSecureUpload = async (fileUri: string) => {
  try {
    // Verschlüssele die Datei
    const { encryptedUri, keyFingerprint } = await encryptFile(fileUri);
    
    // Hole Dateiinformationen
    const fileInfo = await FileSystem.getInfoAsync(encryptedUri);
    
    // Typensicherer Zugriff auf size
    let fileSize = 0;
    if (fileInfo.exists) {
      // In TypeScript kann man mit Type Assertion arbeiten
      const fileInfoWithSize = fileInfo as FileSystem.FileInfo & { size: number };
      fileSize = fileInfoWithSize.size || 0;
    }
    
    return {
      uri: encryptedUri,
      fileSize,
      keyFingerprint,
      encryptionVersion: '1.0'
    };
  } catch (error) {
    console.error('Error preparing secure upload:', error);
    throw new Error('Failed to prepare file for secure upload');
  }
};

/**
 * Entschlüsselt eine verschlüsselte Datei
 * @param encryptedFileUri - URI der verschlüsselten Datei
 * @param keyFingerprint - Fingerprint des verwendeten Schlüssels
 * @returns URI der entschlüsselten temporären Datei
 */
export const decryptFile = async (encryptedFileUri: string, keyFingerprint?: string): Promise<string> => {
  try {
    console.log('Starting file decryption for:', encryptedFileUri);
    
    // Hole den Nutzerschlüssel
    const key = await getUserEncryptionKey();
    
    // Überprüfe Schlüssel-Fingerprint, wenn angegeben
    if (keyFingerprint) {
      const currentKeyFingerprint = simpleFingerprint(key);
      if (currentKeyFingerprint !== keyFingerprint) {
        console.warn(`Key fingerprint mismatch: expected ${keyFingerprint}, got ${currentKeyFingerprint}`);
        // Trotzdem fortfahren, könnte funktionieren wenn der Schlüssel irgendwie wiederhergestellt wurde
      }
    }
    
    // Lese die verschlüsselte Datei
    const encryptedDataString = await FileSystem.readAsStringAsync(encryptedFileUri);
    let encryptedData;
    let encryptedContent;
    
    try {
      // Versuche zuerst als JSON zu parsen (Standard-Format)
      encryptedData = JSON.parse(encryptedDataString);
      
      // Überprüfe die Struktur der verschlüsselten Daten
      if (!encryptedData.content) {
        throw new Error('Ungültiges Verschlüsselungsformat: Inhalt fehlt');
      }
      
      // Dekodiere den Inhalt von Base64
      encryptedContent = Base64.decode(encryptedData.content);
    } catch (parseError) {
      console.log('File is not in JSON format, trying direct decryption of raw data');
      
      // Falls die Datei nicht im JSON-Format ist, versuche direkt zu entschlüsseln
      // Dies kann der Fall sein, wenn die Datei direkt vom Server kam
      try {
        // Versuche den Inhalt direkt als Base64 zu interpretieren
        encryptedContent = Base64.decode(encryptedDataString);
      } catch (base64Error) {
        // Wenn Base64-Dekodierung fehlschlägt, versuche die Datei direkt zu verwenden
        console.log('Direct Base64 decoding failed, using raw content');
        encryptedContent = encryptedDataString;
      }
    }
    
    // Versuche nun, den Inhalt zu entschlüsseln
    let decryptedContent;
    try {
      // Entschlüssele den Inhalt
      decryptedContent = simpleDecrypt(encryptedContent, key);
    } catch (decryptError) {
      console.error('First decryption attempt failed:', decryptError);
      
      // Fallback: Versuche, den Inhalt als Base64 zu interpretieren und dann zu entschlüsseln
      try {
        const rawContent = Base64.decode(encryptedDataString);
        decryptedContent = simpleDecrypt(rawContent, key);
      } catch (fallbackError) {
        console.error('Fallback decryption also failed:', fallbackError);
        throw new Error('Entschlüsselung fehlgeschlagen: Dateiformat nicht erkannt');
      }
    }
    
    // Prüfe, ob das Ergebnis gültiges Base64 ist (wahrscheinlich ein Bild)
    let isValidBase64 = false;
    try {
      // Einfacher Test: Base64 sollte nur bestimmte Zeichen enthalten
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      isValidBase64 = base64Regex.test(decryptedContent.replace(/\s/g, ''));
      
      // Zusätzlicher Test: Versuche, ein paar Zeichen zu dekodieren
      if (isValidBase64) {
        const sample = decryptedContent.substring(0, 100);
        Base64.decode(sample);
      }
    } catch (base64ValidationError) {
      isValidBase64 = false;
    }
    
    // Speichere die entschlüsselte Datei temporär
    const tempDir = `${FileSystem.cacheDirectory || ''}decrypted_files/`;
    const fileName = `decrypted_${Date.now()}.jpg`; // Vermutlich ein Bild, könnte später erweitert werden
    const decryptedUri = tempDir + fileName;
    
    // Stelle sicher, dass das Verzeichnis existiert
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
    
    if (isValidBase64) {
      // Wenn es gültiges Base64 ist, schreibe es direkt
      console.log('Writing decrypted content as Base64');
      await FileSystem.writeAsStringAsync(
        decryptedUri,
        decryptedContent,
        { encoding: FileSystem.EncodingType.Base64 }
      );
    } else {
      // Sonst versuche, es als UTF-8 Text zu schreiben
      console.log('Writing decrypted content as text');
      await FileSystem.writeAsStringAsync(decryptedUri, decryptedContent);
      
      // Alternativ: Versuche trotzdem als Base64 zu schreiben, falls der Test falsch war
      const fallbackUri = tempDir + `fallback_${Date.now()}.jpg`;
      try {
        await FileSystem.writeAsStringAsync(
          fallbackUri,
          decryptedContent,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        // Prüfe, ob die Fallback-Datei existiert und eine sinnvolle Größe hat
        const fallbackInfo = await FileSystem.getInfoAsync(fallbackUri);
        if (fallbackInfo.exists && (fallbackInfo as any).size > 100) {
          // Wenn ja, verwende sie stattdessen
          console.log('Using fallback decrypted file');
          return fallbackUri;
        }
      } catch (fallbackWriteError) {
        console.log('Fallback file write failed:', fallbackWriteError);
        // Ignoriere den Fehler und verwende die ursprüngliche Datei
      }
    }
    
    console.log('Decryption successful, file saved to:', decryptedUri);
    return decryptedUri;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export default {
  getUserEncryptionKey,
  encryptFile,
  prepareSecureUpload,
  decryptFile
}; 