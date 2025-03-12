import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';

// Define the type for history items
interface HistoryItem {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'failed';
}

// Mock data for the history list
const mockHistory: HistoryItem[] = [
  { id: '1', title: 'Invoice_2023.pdf', date: '2023-12-15', status: 'completed' },
  { id: '2', title: 'Contract_Agreement.pdf', date: '2023-12-10', status: 'completed' },
  { id: '3', title: 'Receipt_Amazon.pdf', date: '2023-12-05', status: 'completed' },
  { id: '4', title: 'Tax_Document.pdf', date: '2023-11-28', status: 'failed' },
  { id: '5', title: 'Medical_Report.pdf', date: '2023-11-20', status: 'completed' },
];

export default function History() {
  const router = useRouter();

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyItem}>
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name="description" 
          size={24} 
          color={colors.primary} 
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.status === 'completed' ? colors.success : colors.error }
        ]} />
        <Text style={styles.statusText}>
          {item.status === 'completed' ? 'Completed' : 'Failed'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document History</Text>
      </View>
      
      <FlatList
        data={mockHistory}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
}); 