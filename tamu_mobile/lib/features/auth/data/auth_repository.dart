import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/env.dart';
import '../../../shared/api/api_exception.dart';
import '../../../shared/api/dio_client.dart';
import '../../../shared/auth/token_storage.dart';

class MobileUser {
  const MobileUser({
    required this.idUser,
    required this.namaLengkap,
    required this.email,
    required this.noTelepon,
    required this.role,
    this.fotoProfil,
  });

  final String idUser;
  final String namaLengkap;
  final String email;
  final String noTelepon;
  final String role;
  final String? fotoProfil;

  factory MobileUser.fromJson(Map<String, dynamic> json) {
    return MobileUser(
      idUser: json['id_user'] as String,
      namaLengkap: json['nama_lengkap'] as String,
      email: json['email'] as String,
      noTelepon: json['no_telepon'] as String,
      role: json['role'] as String,
      fotoProfil: json['foto_profil'] as String?,
    );
  }

  String? get fotoProfilUrl {
    final path = fotoProfil;
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    final origin = AppEnv.apiBaseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    if (path.startsWith('/')) return '$origin$path';
    return '$origin/$path';
  }
}

class AuthResult {
  const AuthResult({required this.token, required this.user});

  final String token;
  final MobileUser user;
}

class AuthRepository {
  AuthRepository({required Dio dio, required TokenStorage tokenStorage})
    : _dio = dio,
      _tokenStorage = tokenStorage;

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/auth/login',
      data: {'email': email, 'password': password},
    );

    return _handleAuthResponse(response.data);
  }

  Future<AuthResult> register({
    required String namaLengkap,
    required String email,
    required String password,
    required String noTelepon,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/auth/register',
      data: {
        'nama_lengkap': namaLengkap,
        'email': email,
        'password': password,
        'no_telepon': noTelepon,
      },
    );

    return _handleAuthResponse(response.data);
  }

  Future<String> resetPassword({
    required String email,
    required String noTelepon,
    required String passwordBaru,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/auth/forgot-password',
      data: {
        'email': email,
        'no_telepon': noTelepon,
        'password_baru': passwordBaru,
      },
    );

    final data = _readData(response.data);
    final message = data['message'];
    return message is String
        ? message
        : 'Kata sandi berhasil diperbarui. Silakan masuk kembali.';
  }

  Future<MobileUser> me() async {
    final response = await _dio.get<Map<String, dynamic>>('/mobile/auth/me');
    final data = _readData(response.data);
    return MobileUser.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<MobileUser> updateAccount({
    required String namaLengkap,
    required String noTelepon,
    String? passwordLama,
    String? passwordBaru,
  }) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '/mobile/auth/me',
      data: {
        'nama_lengkap': namaLengkap,
        'no_telepon': noTelepon,
        if (passwordLama != null && passwordLama.isNotEmpty)
          'password_lama': passwordLama,
        if (passwordBaru != null && passwordBaru.isNotEmpty)
          'password_baru': passwordBaru,
      },
    );

    final data = _readData(response.data);
    return MobileUser.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<MobileUser> updateProfilePhoto({required String filePath}) async {
    final formData = FormData.fromMap({
      'foto_profil': await MultipartFile.fromFile(filePath),
    });

    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/auth/me/foto',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );

    final data = _readData(response.data);
    return MobileUser.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<void> saveSession(AuthResult result) {
    return _tokenStorage.save(token: result.token, idUser: result.user.idUser);
  }

  Future<bool> hasStoredToken() async {
    final token = await _tokenStorage.readToken();
    return token != null && token.isNotEmpty;
  }

  Future<bool> hasSeenOnboarding() {
    return _tokenStorage.hasSeenOnboarding();
  }

  Future<void> markOnboardingSeen() {
    return _tokenStorage.markOnboardingSeen();
  }

  Future<void> logout() => _tokenStorage.clear();

  AuthResult _handleAuthResponse(Map<String, dynamic>? body) {
    final data = _readData(body);
    final token = data['token'];
    final userJson = data['user'];

    if (token is! String || userJson is! Map<String, dynamic>) {
      throw ApiException(message: 'Respons auth tidak valid.');
    }

    return AuthResult(token: token, user: MobileUser.fromJson(userJson));
  }

  Map<String, dynamic> _readData(Map<String, dynamic>? body) {
    if (body == null) {
      throw ApiException(message: 'Respons server kosong.');
    }

    if (body['ok'] != true) {
      final message = body['message'];
      throw ApiException(
        message: message is String ? message : 'Permintaan gagal diproses.',
      );
    }

    final data = body['data'];
    if (data is! Map<String, dynamic>) {
      throw ApiException(message: 'Format data server tidak valid.');
    }

    return data;
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    dio: ref.watch(dioClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});
