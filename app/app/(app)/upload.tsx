import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/common/Button';

export default function Upload() {
  const router = useRouter();

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Upload Document</Text>
        <Text style={styles.subtitle}>Select a document to upload</Text>
        <View style={styles.buttonContainer}>
          <Button onPress={() => console.log('Upload document')}>
            Select Document
          </Button>
          <View style={styles.buttonSpacer} />
          <Button onPress={() => router.back()}>
            Back to Dashboard
          </Button>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonSpacer: {
    height: 16,
  },
}); 