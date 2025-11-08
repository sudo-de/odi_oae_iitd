# Flutter Integration Guide

This guide shows how to integrate Flutter mobile apps with your existing NestJS + MongoDB API.

## ✅ Yes, It's Possible!

Your NestJS REST API can be consumed by Flutter apps. The API is already configured to work with mobile clients.

## Flutter Setup

### 1. Required Packages

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  dio: ^5.4.0  # Better HTTP client with interceptors
  shared_preferences: ^2.2.2  # For storing JWT tokens
  image_picker: ^1.0.5  # For file uploads
  qr_flutter: ^4.1.0  # For displaying QR codes
```

### 2. API Service Example

Create `lib/services/api_service.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000'; // Change to your server IP for mobile
  late Dio _dio;
  
  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));
    
    // Add interceptor for JWT token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Handle unauthorized - redirect to login
        }
        return handler.next(error);
      },
    ));
  }
  
  // Auth endpoints
  Future<Response> login(String email, String password) async {
    return await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
  }
  
  Future<Response> getProfile() async {
    return await _dio.get('/auth/profile');
  }
  
  // User endpoints
  Future<Response> getUsers() async {
    return await _dio.get('/users');
  }
  
  Future<Response> getUser(String id) async {
    return await _dio.get('/users/$id');
  }
  
  Future<Response> createUser(Map<String, dynamic> userData, List<String>? filePaths) async {
    final formData = FormData();
    
    // Add user data fields
    userData.forEach((key, value) {
      if (key == 'phone' || key == 'hostel' || key == 'emergencyDetails') {
        formData.fields.add(MapEntry(key, jsonEncode(value)));
      } else {
        formData.fields.add(MapEntry(key, value.toString()));
      }
    });
    
    // Add files if provided
    if (filePaths != null && filePaths.isNotEmpty) {
      for (var filePath in filePaths) {
        formData.files.add(MapEntry(
          'files',
          await MultipartFile.fromFile(filePath),
        ));
      }
    }
    
    return await _dio.post('/users', data: formData);
  }
  
  Future<Response> updateUser(String id, Map<String, dynamic> userData) async {
    return await _dio.patch('/users/$id', data: userData);
  }
  
  Future<Response> deleteUser(String id) async {
    return await _dio.delete('/users/$id');
  }
  
  Future<Response> toggleUserStatus(String id, bool isActive) async {
    return await _dio.patch('/users/$id/status', data: {'isActive': isActive});
  }
  
  // QR Code endpoints
  Future<Response> generateQRCode(String driverId) async {
    return await _dio.post('/users/$driverId/generate-qr');
  }
  
  Future<Response> generateQRCodesForAllDrivers() async {
    return await _dio.post('/users/drivers/generate-qr-codes');
  }
  
  // Stats endpoint
  Future<Response> getUserStats() async {
    return await _dio.get('/users/stats/overview');
  }
}
```

### 3. Models

Create `lib/models/user.dart`:

```dart
class User {
  final String id;
  final String name;
  final String email;
  final String? password;
  final int? age;
  final bool isActive;
  final String role;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Common fields
  final Phone? phone;
  final ProfilePhoto? profilePhoto;
  
  // Student fields
  final String? entryNumber;
  final String? programme;
  final String? department;
  final Hostel? hostel;
  final EmergencyDetails? emergencyDetails;
  final String? disabilityType;
  final String? udidNumber;
  final int? disabilityPercentage;
  final DisabilityDocument? disabilityDocument;
  final DateTime? expiryDate;
  final bool? isExpired;
  
  // Driver fields
  final String? qrCode;
  
  User({
    required this.id,
    required this.name,
    required this.email,
    this.password,
    this.age,
    required this.isActive,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
    this.phone,
    this.profilePhoto,
    this.entryNumber,
    this.programme,
    this.department,
    this.hostel,
    this.emergencyDetails,
    this.disabilityType,
    this.udidNumber,
    this.disabilityPercentage,
    this.disabilityDocument,
    this.expiryDate,
    this.isExpired,
    this.qrCode,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'],
      name: json['name'],
      email: json['email'],
      password: json['password'],
      age: json['age'],
      isActive: json['isActive'] ?? true,
      role: json['role'] ?? 'user',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      phone: json['phone'] != null ? Phone.fromJson(json['phone']) : null,
      profilePhoto: json['profilePhoto'] != null 
          ? ProfilePhoto.fromJson(json['profilePhoto']) 
          : null,
      entryNumber: json['entryNumber'],
      programme: json['programme'],
      department: json['department'],
      hostel: json['hostel'] != null ? Hostel.fromJson(json['hostel']) : null,
      emergencyDetails: json['emergencyDetails'] != null 
          ? EmergencyDetails.fromJson(json['emergencyDetails']) 
          : null,
      disabilityType: json['disabilityType'],
      udidNumber: json['udidNumber'],
      disabilityPercentage: json['disabilityPercentage'],
      disabilityDocument: json['disabilityDocument'] != null
          ? DisabilityDocument.fromJson(json['disabilityDocument'])
          : null,
      expiryDate: json['expiryDate'] != null 
          ? DateTime.parse(json['expiryDate']) 
          : null,
      isExpired: json['isExpired'] ?? false,
      qrCode: json['qrCode'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'age': age,
      'isActive': isActive,
      'role': role,
      'phone': phone?.toJson(),
      'entryNumber': entryNumber,
      'programme': programme,
      'department': department,
      'hostel': hostel?.toJson(),
      'emergencyDetails': emergencyDetails?.toJson(),
      'disabilityType': disabilityType,
      'udidNumber': udidNumber,
      'disabilityPercentage': disabilityPercentage,
      'expiryDate': expiryDate?.toIso8601String(),
      'qrCode': qrCode,
    };
  }
}

class Phone {
  final String countryCode;
  final String number;
  
  Phone({required this.countryCode, required this.number});
  
  factory Phone.fromJson(Map<String, dynamic> json) {
    return Phone(
      countryCode: json['countryCode'],
      number: json['number'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'countryCode': countryCode,
      'number': number,
    };
  }
}

class Hostel {
  final String name;
  final String roomNo;
  
  Hostel({required this.name, required this.roomNo});
  
  factory Hostel.fromJson(Map<String, dynamic> json) {
    return Hostel(
      name: json['name'],
      roomNo: json['roomNo'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'roomNo': roomNo,
    };
  }
}

class EmergencyDetails {
  final String name;
  final String address;
  final String phone;
  final String? additionalPhone;
  
  EmergencyDetails({
    required this.name,
    required this.address,
    required this.phone,
    this.additionalPhone,
  });
  
  factory EmergencyDetails.fromJson(Map<String, dynamic> json) {
    return EmergencyDetails(
      name: json['name'],
      address: json['address'],
      phone: json['phone'],
      additionalPhone: json['additionalPhone'],
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'address': address,
      'phone': phone,
      'additionalPhone': additionalPhone,
    };
  }
}

class ProfilePhoto {
  final String filename;
  final String mimetype;
  final int size;
  final String data; // Base64 string
  
  ProfilePhoto({
    required this.filename,
    required this.mimetype,
    required this.size,
    required this.data,
  });
  
  factory ProfilePhoto.fromJson(Map<String, dynamic> json) {
    return ProfilePhoto(
      filename: json['filename'],
      mimetype: json['mimetype'],
      size: json['size'],
      data: json['data'],
    );
  }
}

class DisabilityDocument {
  final String filename;
  final String mimetype;
  final int size;
  final String data; // Base64 string
  
  DisabilityDocument({
    required this.filename,
    required this.mimetype,
    required this.size,
    required this.data,
  });
  
  factory DisabilityDocument.fromJson(Map<String, dynamic> json) {
    return DisabilityDocument(
      filename: json['filename'],
      mimetype: json['mimetype'],
      size: json['size'],
      data: json['data'],
    );
  }
}
```

### 4. Login Example

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'services/api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  
  Future<bool> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      
      if (response.statusCode == 200) {
        final token = response.data['access_token'];
        final user = response.data['user'];
        
        // Store token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('user', jsonEncode(user));
        
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }
  
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }
  
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey('token');
  }
}
```

### 5. User List Example

```dart
import 'services/api_service.dart';
import 'models/user.dart';
import 'dart:convert';

class UserService {
  final ApiService _apiService = ApiService();
  
  Future<List<User>> getUsers() async {
    try {
      final response = await _apiService.getUsers();
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => User.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching users: $e');
      return [];
    }
  }
  
  Future<User?> getUserById(String id) async {
    try {
      final response = await _apiService.getUser(id);
      
      if (response.statusCode == 200) {
        return User.fromJson(response.data);
      }
      return null;
    } catch (e) {
      print('Error fetching user: $e');
      return null;
    }
  }
}
```

## Important Notes

### 1. Network Configuration

For mobile devices, replace `localhost` with your computer's IP address:

```dart
// Development
static const String baseUrl = 'http://192.168.1.100:3000'; // Your local IP

// Production
static const String baseUrl = 'https://your-api-domain.com';
```

### 2. Android Network Security

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### 3. iOS Network Security

Add to `ios/Runner/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 4. File Upload Example

```dart
import 'package:image_picker/image_picker.dart';
import 'dart:io';

Future<void> createUserWithFiles() async {
  final picker = ImagePicker();
  final profilePhoto = await picker.pickImage(source: ImageSource.gallery);
  final document = await picker.pickImage(source: ImageSource.gallery);
  
  final userData = {
    'name': 'John Doe',
    'email': 'john@example.com',
    'role': 'student',
    // ... other fields
  };
  
  final filePaths = [
    if (profilePhoto != null) profilePhoto.path,
    if (document != null) document.path,
  ].whereType<String>().toList();
  
  final response = await _apiService.createUser(userData, filePaths);
  // Handle response
}
```

### 5. QR Code Display

```dart
import 'package:qr_flutter/qr_flutter.dart';

Widget buildQRCode(String qrCodeDataUrl) {
  // Extract base64 data from data URL
  final base64Data = qrCodeDataUrl.split(',')[1];
  
  return QrImageView(
    data: base64Data,
    version: QrVersions.auto,
    size: 200.0,
  );
}
```

## API Endpoints Summary

Your Flutter app can use all these endpoints:

### Authentication
- `POST /auth/login` - Login
- `POST /auth/forgot-password` - Forgot password
- `POST /auth/reset-password` - Reset password
- `GET /auth/profile` - Get current user (requires JWT)

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (with file upload)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/status` - Toggle user status
- `PATCH /users/:id/role` - Update user role
- `POST /users/bulk-update` - Bulk update users
- `GET /users/stats/overview` - Get user statistics

### QR Codes
- `POST /users/:id/generate-qr` - Generate QR code for driver
- `POST /users/drivers/generate-qr-codes` - Generate QR codes for all drivers

## Testing

1. Start your NestJS server: `cd server && npm run dev`
2. Update the base URL in Flutter to your server's IP
3. Test login and API calls from your Flutter app

## Production Considerations

1. **CORS**: Update CORS in `server/src/main.ts` to allow your production domain
2. **HTTPS**: Use HTTPS in production
3. **Token Storage**: Consider using secure storage (flutter_secure_storage) for tokens
4. **Error Handling**: Implement proper error handling and retry logic
5. **Offline Support**: Consider adding local caching with Hive or SQLite

