/// Exception terstandar untuk error API. Repository melempar ini supaya
/// presentation layer cukup catch satu tipe dan tampilkan `message` ke user.
class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
  });

  final String message;
  final int? statusCode;

  bool get isUnauthorized => statusCode == 401;
  bool get isServerError =>
      statusCode != null && statusCode! >= 500 && statusCode! < 600;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
