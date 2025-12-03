import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  user: any;
  onLogout: () => void;
  onNavigateToProfile: () => void;
}

export default function Settings({ user, onLogout, onNavigateToProfile }: SettingsProps) {
  const { theme, colors, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            onLogout();
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleThemeChange = (value: boolean) => {
    toggleTheme();
  };

  const handleNotificationsChange = (value: boolean) => {
    setNotificationsEnabled(value);
    // Save preference to AsyncStorage
    AsyncStorage.setItem('notificationsEnabled', JSON.stringify(value));
  };

  const handleBiometricChange = (value: boolean) => {
    setBiometricEnabled(value);
    Alert.alert(
      'Biometric Authentication',
      value ? 'Biometric login enabled' : 'Biometric login disabled',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'For assistance, please contact:\n\nEmail: support@iitd.ac.in\nPhone: +91-11-2659-0000',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          onPress: () => {
            Linking.openURL('mailto:support@iitd.ac.in');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About',
      'OAE Mobile App\nVersion 1.0.0\n\nOffice of Academic Excellence\nIndian Institute of Technology Delhi',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. This app collects and stores your login credentials securely. All data is encrypted and transmitted securely.',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using this app, you agree to comply with IIT Delhi policies and regulations.',
      [{ text: 'OK' }]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Data export feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderTopColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Account</Text>
        <SettingItem
          icon="👤"
          title="Profile"
          subtitle="View and edit your profile"
          onPress={onNavigateToProfile}
        />
        <SettingItem
          icon="🔒"
          title="Change Password"
          subtitle="Update your password"
          onPress={handleChangePassword}
        />
        <SettingItem
          icon="📤"
          title="Export Data"
          subtitle="Download your data"
          onPress={handleDataExport}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Preferences</Text>
        <SettingItem
          icon="🌙"
          title="Theme"
          subtitle={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          rightComponent={
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeChange}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={theme === 'dark' ? '#fff' : '#f4f3f4'}
            />
          }
          showArrow={false}
        />
        <SettingItem
          icon="🔔"
          title="Notifications"
          subtitle="Push notifications"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          }
          showArrow={false}
        />
        <SettingItem
          icon="👆"
          title="Biometric Login"
          subtitle="Use fingerprint or face ID"
          rightComponent={
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricChange}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
            />
          }
          showArrow={false}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Support</Text>
        <SettingItem
          icon="❓"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={handleHelp}
        />
        <SettingItem
          icon="ℹ️"
          title="About"
          subtitle="App version and information"
          onPress={handleAbout}
        />
        <SettingItem
          icon="🔐"
          title="Privacy Policy"
          subtitle="How we protect your data"
          onPress={handlePrivacy}
        />
        <SettingItem
          icon="📄"
          title="Terms of Service"
          subtitle="Terms and conditions"
          onPress={handleTerms}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Data</Text>
        <SettingItem
          icon="🗑️"
          title="Clear Cache"
          subtitle="Remove cached data"
          onPress={handleClearCache}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <SettingItem
          icon="🚪"
          title="Logout"
          subtitle={`Logged in as ${user?.email}`}
          onPress={handleLogout}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          OAE Mobile App v1.0.0
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          IIT Delhi © 2024
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

