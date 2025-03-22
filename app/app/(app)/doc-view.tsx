import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Alert, Dimensions, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import * as documentService from '../services/documentService';

export default function DocView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewPdf, loading, error, fetchDocumentById } = useDocuments();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [sharing, setSharing] = useState(false);
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  useEffect(() => {
    if (!id) {
      Alert.alert(t('common.error'), t('docView.invalidDocument'));
      router.back();
      return;
    }

    const loadDocument = async () => {
      try {
        // Get document details to display name
        const document = await fetchDocumentById(id);
        setDocumentName(document.originalFileName);
        
        // Get PDF file path
        const path = await viewPdf(id);
        console.log("PDF URL:", path);
        setPdfUrl(path);
      } catch (error) {
        console.error('Error loading PDF:', error);
        Alert.alert(
          t('common.error'),
          t('docView.failedToLoad'),
          [{ text: t('common.ok'), onPress: () => router.back() }]
        );
      }
    };

    loadDocument();
  }, [id]);

  // Function to generate HTML content for PDF viewing
  const generateHtml = (pdfUrl: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              background-color: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            a {
              display: block;
              width: 100%;
              height: 100%;
              text-align: center;
              padding: 20px;
              box-sizing: border-box;
              color: #0066cc;
              text-decoration: none;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 16px;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <a href="${pdfUrl}" target="_blank">Zum PDF-Dokument</a>
        </body>
      </html>
    `;
  };

  // Function to share the PDF document
  const handleSharePdf = async () => {
    if (!id) {
      Alert.alert(t('common.error'), t('docView.invalidDocument'));
      return;
    }

    try {
      setSharing(true);
      await documentService.sharePdf(id);
      setSharing(false);
      
      // Show a success message
      if (Platform.OS === 'android') {
        ToastAndroid.show("Dokument erfolgreich geteilt", ToastAndroid.SHORT);
      }
    } catch (error: any) {
      setSharing(false);
      console.error('Error sharing PDF:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('docView.sharingFailed')
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: documentName || t('docView.title'),
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTitleStyle: {
            color: themeColors.text,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            pdfUrl ? (
              <TouchableOpacity 
                onPress={handleSharePdf}
                style={[styles.headerButton, { backgroundColor: themeColors.primary + '20' }]}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color={themeColors.primary} />
                ) : (
                  <MaterialIcons name="share" size={22} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            {t('docView.loading')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={themeColors.error} />
          <Text style={[styles.errorText, { color: themeColors.error }]}>
            {t('docView.error')}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => viewPdf(id)}
          >
            <Text style={[styles.retryText, { color: themeColors.white }]}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : pdfUrl ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert(t('common.error'), t('docView.pdfRenderError'));
            }}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            {t('docView.noPdf')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  }
}); 