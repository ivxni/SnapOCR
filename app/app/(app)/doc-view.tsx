import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';

export default function DocView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewPdf, loading, error, fetchDocumentById } = useDocuments();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow: hidden;
              background-color: #f5f5f5;
            }
            #pdf-container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            object {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          <div id="pdf-container">
            <object data="${pdfUrl}" type="application/pdf" width="100%" height="100%">
              <p>It appears you don't have a PDF plugin for this browser. 
              You can <a href="${pdfUrl}">download the PDF file</a> instead.</p>
            </object>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: documentName || t('docView.title'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
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
        <WebView
          source={{ html: generateHtml(pdfUrl) }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
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
}); 