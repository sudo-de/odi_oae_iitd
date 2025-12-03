# React Native Integration Guide

This guide shows how to integrate React Native mobile apps with your existing NestJS + MongoDB API.

## ✅ Yes, It's Possible!

Your NestJS REST API can be consumed by React Native apps. The API is already configured to work with mobile clients.

## React Native Setup

### 1. Required Packages

The following packages are already included in `mobile/package.json`:

- **axios**: HTTP client for API calls
- **@react-native-async-storage/async-storage**: Local storage for tokens
- **react-native-image-picker**: File/image picker for uploads
- **react-native-qrcode-svg**: QR code generation and display
- **@react-navigation/native**: Navigation library
- **react-native-gesture-handler**: Gesture handling
- **react-native-reanimated**: Animations

### 2. API Service Example

Create `src/services/apiService.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new ApiService();
```

### 3. Authentication Service

Create `src/services/authService.ts`:

```typescript
import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    
    // Store token
    if (response.access_token) {
      await AsyncStorage.setItem('authToken', response.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async getStoredUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password });
  }

  async getProfile(): Promise<any> {
    return await apiService.get('/auth/profile');
  }
}

export default new AuthService();
```

### 4. User Service

Create `src/services/userService.ts`:

```typescript
import apiService from './apiService';
import { Platform } from 'react-native';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  hostel?: string;
  // ... other fields
}

interface CreateUserData extends User {
  profilePhoto?: string;
  disabilityDocument?: string;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    return await apiService.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return await apiService.get<User>(`/users/${id}`);
  }

  async createUser(userData: CreateUserData, files?: string[]): Promise<User> {
    const formData = new FormData();
    
    // Add user data
    Object.keys(userData).forEach((key) => {
      if (key !== 'profilePhoto' && key !== 'disabilityDocument') {
        formData.append(key, userData[key as keyof CreateUserData] as string);
      }
    });

    // Add files
    if (files && files.length > 0) {
      files.forEach((fileUri, index) => {
        const file = {
          uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
          type: 'image/jpeg', // or detect from file
          name: `file_${index}.jpg`,
        };
        formData.append('files', file as any);
      });
    }

    return await apiService.upload<User>('/users', formData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return await apiService.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    await apiService.delete(`/users/${id}`);
  }

  async getDriverQRCode(driverId: string): Promise<string> {
    const response = await apiService.get<{ qrCode: string }>(`/users/${driverId}/qr-code`);
    return response.qrCode;
  }
}

export default new UserService();
```

### 5. User Model

Create `src/models/user.ts`:

```typescript
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'driver' | 'student';
  phone?: string;
  hostel?: string;
  emergencyDetails?: {
    name: string;
    phone: string;
    relation: string;
  };
  profilePhoto?: string;
  disabilityDocument?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'admin' | 'driver' | 'student';
  phone?: string;
  hostel?: string;
  emergencyDetails?: {
    name: string;
    phone: string;
    relation: string;
  };
}
```

### 6. Login Screen Example

Create `src/screens/Login/LoginScreen.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import authService from '../../services/authService';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      // Navigate to dashboard
      navigation.navigate('Dashboard' as never);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
```

### 7. File Upload Example

```typescript
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import userService from '../services/userService';

const handleFileUpload = async () => {
  const options = {
    mediaType: 'photo' as const,
    quality: 0.8,
  };

  launchImageLibrary(options, async (response: ImagePickerResponse) => {
    if (response.assets && response.assets[0]) {
      const fileUri = response.assets[0].uri;
      if (fileUri) {
        try {
          const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
          };
          
          const user = await userService.createUser(userData, [fileUri]);
          console.log('User created:', user);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
    }
  });
};
```

### 8. QR Code Display Example

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import userService from '../services/userService';

const QRCodeViewer: React.FC<{ driverId: string }> = ({ driverId }) => {
  const [qrCodeData, setQrCodeData] = React.useState<string>('');

  React.useEffect(() => {
    const loadQRCode = async () => {
      try {
        const qrCode = await userService.getDriverQRCode(driverId);
        setQrCodeData(qrCode);
      } catch (error) {
        console.error('Failed to load QR code:', error);
      }
    };
    loadQRCode();
  }, [driverId]);

  return (
    <View style={styles.container}>
      {qrCodeData && (
        <QRCode
          value={qrCodeData}
          size={200}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

export default QRCodeViewer;
```

## Important Notes

### 1. Network Configuration

For physical devices, replace `localhost` with your computer's IP address:

```typescript
// Development
const API_BASE_URL = 'http://192.168.1.100:3000'; // Your local IP

// Production
const API_BASE_URL = 'https://your-api-domain.com';
```

### 2. Android Network Security

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### 3. iOS Network Security

Add to `ios/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 4. Environment Variables

Use `react-native-config` or `react-native-dotenv` for environment variables:

```bash
npm install react-native-config
```

Create `.env`:
```env
API_BASE_URL=http://192.168.1.100:3000
```

## API Endpoints Summary

Your React Native app can use all these endpoints:

### Authentication
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get current user (requires JWT)

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (with file upload)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/qr-code` - Get driver QR code

## Next Steps

1. Set up navigation using React Navigation
2. Create screens for user management
3. Implement file upload functionality
4. Add QR code scanning/generation
5. Test on both iOS and Android devices
6. Configure push notifications (optional)
7. Set up error handling and loading states
8. Add offline support (optional)

## Troubleshooting

### Network Errors
- Ensure your device and computer are on the same network
- Check firewall settings
- Verify API base URL is correct

### File Upload Issues
- Ensure file permissions are granted
- Check file size limits
- Verify FormData format

### Authentication Issues
- Verify token is stored correctly
- Check token expiration
- Ensure Authorization header is included

