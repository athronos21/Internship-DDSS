import 'dart:convert';
import 'package:dio/dio.dart';

/// Kaziniya Drug Store API Client
/// Connects mobile Flutter application to backend Node/Express server.
class ApiService {
  static const String defaultBaseUrl =
      'https://ais-pre-leozf7qd26ta7bgww7m4mw-648174942624.europe-west2.run.app/api';
  final Dio _dio;

  ApiService({String? baseUrl})
      : _dio = Dio(
          BaseOptions(
            baseUrl: (baseUrl ?? defaultBaseUrl).startsWith('http://')
                ? (baseUrl ?? defaultBaseUrl).replaceFirst('http://', 'https://')
                : (baseUrl ?? defaultBaseUrl),
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': 'u-2', // Default Pharmacist fallback
            },
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 20),
          ),
        );

  /// Dynamically update authenticated user session headers
  void setAuthHeaders(String userId, {String? token}) {
    _dio.options.headers['x-user-id'] = userId;
    if (token != null && token.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio.options.headers['Authorization'] = 'Bearer $userId';
    }
  }

  /// Reset headers upon logout
  void clearAuthHeaders() {
    _dio.options.headers.remove('Authorization');
    _dio.options.headers['x-user-id'] = 'u-2';
  }

  /// Staff Login Verification (Email/Employee ID + Password or PIN)
  Future<Map<String, dynamic>> login({
    required String identifier,
    String? password,
    String? pin,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'identifier': identifier.trim(),
          if (password != null && password.isNotEmpty) 'password': password,
          if (pin != null && pin.isNotEmpty) 'pin': pin,
        },
      );

      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception(response.data['message'] ?? 'Authentication failed');
    } on DioException catch (dioErr) {
      final msg = dioErr.response?.data?['message'] ?? dioErr.message;
      throw Exception(msg ?? 'Connection to pharmacy server failed');
    } catch (e) {
      throw Exception('Login error: $e');
    }
  }

  /// First-time or Self-Service Change Password
  Future<Map<String, dynamic>> changePassword({
    required String userId,
    required String currentPassword,
    required String newPassword,
    String? newPin,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/change-password',
        data: {
          'userId': userId,
          'currentPassword': currentPassword,
          'newPassword': newPassword,
          if (newPin != null && newPin.isNotEmpty) 'newPin': newPin,
        },
      );

      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception(response.data['message'] ?? 'Password update failed');
    } on DioException catch (dioErr) {
      final msg = dioErr.response?.data?['message'] ?? dioErr.message;
      throw Exception(msg ?? 'Password update failed');
    } catch (e) {
      throw Exception('Change password error: $e');
    }
  }

  /// Get active staff session and role configuration
  Future<Map<String, dynamic>> getMe() async {
    try {
      final response = await _dio.get('/auth/me');
      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data);
      }
      throw Exception(response.data['message'] ?? 'Failed to retrieve profile');
    } catch (e) {
      throw Exception('Failed to get current profile: $e');
    }
  }

  /// Fetch medicine categories
  Future<List<Map<String, dynamic>>> getCategories() async {
    try {
      final response = await _dio.get('/categories');
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data']);
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Fetch all active inventory medicines with FEFO calculations
  Future<List<Map<String, dynamic>>> getMedicines() async {
    try {
      final response = await _dio.get('/medicines');
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data']);
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch medicines: $e');
    }
  }

  /// AI Visual Medicine Scanner (No barcode or QR code required)
  /// Scans the whole or essential visible part of the medicine packaging
  /// (blister foil, box, bottle, vial, ampoule) using Gemini Vision AI.
  Future<Map<String, dynamic>> scanMedicineVisualPackaging({
    required String base64Image,
    String? hint,
  }) async {
    try {
      final response = await _dio.post(
        '/gemini/scan-medicine',
        data: {
          'image': base64Image,
          'medicineHint': hint,
        },
      );
      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Failed to scan medicine');
    } catch (e) {
      throw Exception('AI visual medicine scan failed: $e');
    }
  }

  /// Register / Add new medicine (either manually or after visual scan approval)
  Future<Map<String, dynamic>> registerMedicine({
    required String name,
    required String genericName,
    required String brandName,
    required String categoryId,
    required String dosageForm,
    required String strength,
    required String unit,
    required String manufacturer,
    required String batchNumber,
    required String mfgDate,
    required String expDate,
    required double purchasePrice,
    required double sellingPrice,
    required int quantity,
    required int reorderLevel,
    String? barcode,
    String? shelfLocation,
    bool prescriptionRequired = false,
  }) async {
    try {
      final response = await _dio.post(
        '/medicines',
        data: {
          'barcode': barcode,
          'name': name,
          'genericName': genericName,
          'brandName': brandName,
          'categoryId': categoryId,
          'dosageForm': dosageForm,
          'strength': strength,
          'unit': unit,
          'manufacturer': manufacturer,
          'shelfLocation': shelfLocation ?? 'Shelf A-01',
          'prescriptionRequired': prescriptionRequired,
          'reorderLevel': reorderLevel,
          'initialBatch': {
            'batchNumber': batchNumber,
            'mfgDate': mfgDate,
            'expDate': expDate,
            'purchasePrice': purchasePrice,
            'sellingPrice': sellingPrice,
            'quantity': quantity,
          },
        },
      );
      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Failed to register medicine');
    } catch (e) {
      throw Exception('Registration error: $e');
    }
  }

  /// Process atomic POS sale transaction with FEFO batch deduction
  Future<Map<String, dynamic>> processSaleTransaction({
    required List<Map<String, dynamic>> items,
    required String paymentMethod,
    String customerName = 'Walk-in Counter Patient',
    double discount = 0,
  }) async {
    try {
      final response = await _dio.post(
        '/sales',
        data: {
          'items': items,
          'paymentMethod': paymentMethod,
          'customerName': customerName,
          'discount': discount,
        },
      );
      if (response.data['success'] == true) {
        return Map<String, dynamic>.from(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Failed to process sale');
    } catch (e) {
      throw Exception('POS Sale error: $e');
    }
  }

  /// Fetch counter sales history
  Future<List<Map<String, dynamic>>> getSalesHistory() async {
    try {
      final response = await _dio.get('/sales');
      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data']);
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
