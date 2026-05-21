/// Konfigurasi environment untuk aplikasi tamu mobile.
///
/// Untuk emulator Android: gunakan 10.0.2.2 (alias localhost host PC).
/// Untuk iOS Simulator atau Linux/macOS desktop: localhost.
/// Untuk perangkat fisik di jaringan WiFi yang sama: ganti dengan IP lokal
/// laptop pengembang (mis. 192.168.x.x).
class AppEnv {
  AppEnv._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );

  static const Duration apiTimeout = Duration(seconds: 30);
}
