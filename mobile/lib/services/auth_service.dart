import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

/// Active Authenticated Staff Session
class UserSession {
  final String id;
  final String name;
  final String email;
  final String role; // 'PHARMACIST' | 'STORE_OWNER' | 'SUPER_ADMIN'
  final String phone;
  final String employeeId;
  final String department;
  final String pharmacyName;
  final bool mustChangePassword;
  final String token;
  final Map<String, dynamic> rawJson;

  UserSession({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone = '',
    this.employeeId = '',
    this.department = '',
    this.pharmacyName = 'Kaziniya Drug Store',
    this.mustChangePassword = false,
    required this.token,
    required this.rawJson,
  });

  bool get isPharmacist => role == 'PHARMACIST';
  bool get isOwner => role == 'STORE_OWNER';
  bool get isSuperAdmin => role == 'SUPER_ADMIN';

  String get roleDisplayTitle {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrator';
      case 'STORE_OWNER':
        return 'Drug Store Owner';
      case 'PHARMACIST':
      default:
        return 'Licensed Pharmacist';
    }
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Pharmacy Staff',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'PHARMACIST',
      phone: json['phone']?.toString() ?? '',
      employeeId: json['employeeId']?.toString() ?? '',
      department: json['department']?.toString() ?? '',
      pharmacyName: json['pharmacyName']?.toString() ?? 'Kaziniya Drug Store',
      mustChangePassword: json['mustChangePassword'] == true,
      token: json['token']?.toString() ?? json['id']?.toString() ?? '',
      rawJson: json,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'phone': phone,
        'employeeId': employeeId,
        'department': department,
        'pharmacyName': pharmacyName,
        'mustChangePassword': mustChangePassword,
        'token': token,
        'rawJson': rawJson,
      };
}

/// Authentication and Session Manager for Kaziniya Mobile POS
class AuthService extends ChangeNotifier {
  static const String _sessionKey = 'kzn_mobile_auth_session';
  final ApiService _apiService;
  UserSession? _currentUser;
  bool _isInitialized = false;

  AuthService({required ApiService apiService}) : _apiService = apiService;

  UserSession? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isInitialized => _isInitialized;

  /// Restore persisted staff session on app startup
  Future<UserSession?> restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionJson = prefs.getString(_sessionKey);

      if (sessionJson != null && sessionJson.isNotEmpty) {
        final data = jsonDecode(sessionJson) as Map<String, dynamic>;
        final session = UserSession.fromJson(data);
        _currentUser = session;

        // Configure ApiService client with authenticated headers
        _apiService.setAuthHeaders(session.id, token: session.token);

        notifyListeners();
        return session;
      }
    } catch (e) {
      debugPrint('Error restoring auth session: $e');
    } finally {
      _isInitialized = true;
      notifyListeners();
    }
    return null;
  }

  /// Sign in with email or Employee ID + password or PIN
  Future<UserSession> login({
    required String identifier,
    String? password,
    String? pin,
  }) async {
    try {
      final responseData = await _apiService.login(
        identifier: identifier,
        password: password,
        pin: pin,
      );

      final userData = responseData['data'] as Map<String, dynamic>;
      final session = UserSession.fromJson(userData);

      _currentUser = session;
      _apiService.setAuthHeaders(session.id, token: session.token);

      // Persist session to local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_sessionKey, jsonEncode(session.toJson()));

      notifyListeners();
      return session;
    } catch (e) {
      debugPrint('Login failed: $e');
      rethrow;
    }
  }

  /// Change staff password (used for first-time login or security resets)
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    String? newPin,
  }) async {
    if (_currentUser == null) {
      throw Exception('No active staff session.');
    }

    await _apiService.changePassword(
      userId: _currentUser!.id,
      currentPassword: currentPassword,
      newPassword: newPassword,
      newPin: newPin,
    );

    // Update session state
    final updatedJson = Map<String, dynamic>.from(_currentUser!.rawJson);
    updatedJson['mustChangePassword'] = false;
    _currentUser = UserSession.fromJson(updatedJson);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, jsonEncode(_currentUser!.toJson()));

    notifyListeners();
  }

  /// End terminal session and return to login screen
  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_sessionKey);
    } catch (e) {
      debugPrint('Error clearing session: $e');
    } finally {
      _currentUser = null;
      _apiService.clearAuthHeaders();
      notifyListeners();
    }
  }
}
