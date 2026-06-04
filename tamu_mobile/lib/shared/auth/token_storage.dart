import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _tokenKey = 'wb_jwt_token';
const _userIdKey = 'wb_id_user';
const _onboardingSeenKey = 'wb_onboarding_seen';

const _secureOptions = AndroidOptions(encryptedSharedPreferences: true);

class TokenStorage {
  TokenStorage(this._storage);

  final FlutterSecureStorage _storage;

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<String?> readIdUser() => _storage.read(key: _userIdKey);

  Future<bool> hasSeenOnboarding() async {
    final value = await _storage.read(key: _onboardingSeenKey);
    return value == 'true';
  }

  Future<void> markOnboardingSeen() {
    return _storage.write(key: _onboardingSeenKey, value: 'true');
  }

  Future<void> save({required String token, required String idUser}) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userIdKey, value: idUser);
  }

  Future<void> clear() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userIdKey);
  }
}

final tokenStorageProvider = Provider<TokenStorage>((ref) {
  return TokenStorage(const FlutterSecureStorage(aOptions: _secureOptions));
});
