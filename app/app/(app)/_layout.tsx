import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="upload" 
        options={{ 
          title: 'Upload Document',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'Document History',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerShown: false
        }} 
      />
    </Stack>
  );
} 