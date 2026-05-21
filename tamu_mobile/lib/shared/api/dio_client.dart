import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/env.dart';
import '../auth/token_storage.dart';
import 'api_exception.dart';

/// Membangun Dio instance dengan:
/// - Base URL dari AppEnv
/// - Timeout 30 detik
/// - Interceptor JWT (auto-attach `Authorization: Bearer <token>`)
/// - Interceptor error normalisasi -> [ApiException]
Dio buildDioClient(TokenStorage tokenStorage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppEnv.apiBaseUrl,
      connectTimeout: AppEnv.apiTimeout,
      receiveTimeout: AppEnv.apiTimeout,
      sendTimeout: AppEnv.apiTimeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStorage.readToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        handler.reject(_normalizeError(error));
      },
    ),
  );

  return dio;
}

DioException _normalizeError(DioException error) {
  final message = _extractMessage(error);
  final apiException = ApiException(
    message: message,
    statusCode: error.response?.statusCode,
  );
  return error.copyWith(error: apiException);
}

String _extractMessage(DioException error) {
  final data = error.response?.data;
  if (data is Map) {
    final dynamic msg = data['message'] ?? data['error'];
    if (msg is String && msg.isNotEmpty) return msg;
  }

  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.sendTimeout:
      return 'Koneksi ke server timeout. Coba lagi.';
    case DioExceptionType.connectionError:
      return 'Tidak bisa terhubung ke server. Periksa koneksi internet.';
    case DioExceptionType.badCertificate:
      return 'Sertifikat server tidak valid.';
    case DioExceptionType.cancel:
      return 'Permintaan dibatalkan.';
    case DioExceptionType.badResponse:
      final code = error.response?.statusCode;
      if (code == 401) return 'Sesi habis, silakan login ulang.';
      if (code == 404) return 'Data tidak ditemukan.';
      if (code != null && code >= 500) {
        return 'Terjadi kesalahan pada server. Coba lagi sebentar.';
      }
      return 'Terjadi kesalahan saat memproses permintaan.';
    case DioExceptionType.unknown:
      return error.message ?? 'Terjadi kesalahan tidak terduga.';
  }
}

final dioClientProvider = Provider<Dio>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return buildDioClient(tokenStorage);
});
