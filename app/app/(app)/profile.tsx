import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../hooks/useAuth';

// Mock user data
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  profilePicture: null,
};

// Define valid icon names to avoid TypeScript errors
type IconName = 'notifications' | 'security' | 'help' | 'color-lens' | 'language' | 'logout' | 'chevron-right';

interface MenuItemProps {
  icon: IconName;
  title: string;
  onPress: () => void;
  showBadge?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, showBadge = false }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <MaterialIcons name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.menuTitle}>{title}</Text>
    <View style={styles.menuRight}>
      {showBadge && <View style={styles.badge} />}
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {mockUser.profilePicture ? (
              <Image source={{ uri: mockUser.profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {mockUser.firstName.charAt(0)}{mockUser.lastName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{`${mockUser.firstName} ${mockUser.lastName}`}</Text>
          <Text style={styles.userEmail}>{mockUser.email}</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem 
          icon="notifications" 
          title="Notifications" 
          onPress={() => console.log('Notifications pressed')}
          showBadge={true}
        />
        <MenuItem 
          icon="security" 
          title="Security" 
          onPress={() => console.log('Security pressed')}
        />
        <MenuItem 
          icon="help" 
          title="Help & Support" 
          onPress={() => console.log('Help pressed')}
        />
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <MenuItem 
          icon="color-lens" 
          title="Appearance" 
          onPress={() => console.log('Appearance pressed')}
        />
        <MenuItem 
          icon="language" 
          title="Language" 
          onPress={() => console.log('Language pressed')}
        />
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  menuSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 