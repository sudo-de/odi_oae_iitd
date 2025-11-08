import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  AuthService._internal();

  static final AuthService _instance = AuthService._internal();

  factory AuthService() => _instance;

  final ApiService _apiService = ApiService();

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'auth_user';
  static const Set<String> _mobileSupportedRoles = {'student', 'driver'};

  Future<LoginResult> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/login',
        data: <String, dynamic>{
          'email': identifier,
          'password': password,
        },
      );

      final data = response.data;

      if (data == null || data['access_token'] == null || data['user'] == null) {
        throw const AuthException('Unexpected response from the server.');
      }

      final accessToken = data['access_token'] as String;
      final user = User.fromJson(Map<String, dynamic>.from(data['user'] as Map));

      final normalizedRole = user.role?.toLowerCase();
      if (normalizedRole == null || !_mobileSupportedRoles.contains(normalizedRole)) {
        throw const AuthException(
          'Only student and driver accounts can sign in on the mobile app. Please use the web portal for other roles.',
        );
      }

      final preferences = await SharedPreferences.getInstance();
      await preferences.setString(_tokenKey, accessToken);
      await preferences.setString(_userKey, jsonEncode(user.toJson()));

      _apiService.setAuthToken(accessToken);

      return LoginResult(user: user, accessToken: accessToken);
    } on DioException catch (error) {
      throw AuthException(_extractMessage(error));
    } catch (error) {
      throw AuthException(error.toString());
    }
  }

  Future<void> logout() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_tokenKey);
    await preferences.remove(_userKey);
    _apiService.setAuthToken(null);
  }

  Future<void> updateCachedUser(User user) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<User?> tryRestoreSession() async {
    final preferences = await SharedPreferences.getInstance();
    final storedToken = preferences.getString(_tokenKey);
    final storedUser = preferences.getString(_userKey);

    if (storedToken == null || storedUser == null) {
      return null;
    }

    _apiService.setAuthToken(storedToken);

    try {
      final userJson = jsonDecode(storedUser) as Map<String, dynamic>;
      return User.fromJson(userJson);
    } catch (_) {
      await logout();
      return null;
    }
  }

  Future<bool> isLoggedIn() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.containsKey(_tokenKey);
  }

  Future<String?> getToken() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(_tokenKey);
  }

  String _extractMessage(DioException error) {
    final response = error.response;

    if (response == null) {
      return 'Unable to reach the server. Please try again later.';
    }

    final data = response.data;

    if (data is Map<String, dynamic>) {
      final message = data['message'];
      if (message is String) {
        return message;
      }
      if (message is List && message.isNotEmpty) {
        return message.first.toString();
      }
    }

    if (data is String && data.isNotEmpty) {
      return data;
    }

    switch (response.statusCode) {
      case 401:
        return 'Invalid credentials. Please check your email and password.';
      default:
        return 'Login failed with status code ${response.statusCode ?? 'unknown'}.';
    }
  }
}

class LoginResult {
  const LoginResult({required this.user, required this.accessToken});

  final User user;
  final String accessToken;
}

class AuthException implements Exception {
  const AuthException(this.message);

  final String message;

  @override
  String toString() => 'AuthException: $message';
}

