import '../models/user.dart';
import 'api_service.dart';

class UserService {
  UserService();

  final ApiService _apiService = ApiService();

  Future<User> fetchProfile() async {
    final response = await _apiService.get<Map<String, dynamic>>('/users/me');
    final payload = response.data;

    if (payload == null) {
      throw const UserServiceException('Empty response from server');
    }

    final userData = payload['user'];
    if (userData is Map<String, dynamic>) {
      return User.fromJson(userData);
    }

    return User.fromJson(payload);
  }

  Future<String> generateDriverQr({required String userId}) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      '/users/$userId/generate-qr',
    );
    final data = response.data;

    if (data == null || data['qrCode'] == null) {
      throw const UserServiceException('QR code not returned by server');
    }

    return data['qrCode'] as String;
  }
}

class UserServiceException implements Exception {
  const UserServiceException(this.message);

  final String message;

  @override
  String toString() => 'UserServiceException: $message';
}

