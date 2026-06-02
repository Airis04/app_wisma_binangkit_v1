import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_exception.dart';
import '../data/auth_repository.dart';

class AuthState {
  const AuthState({this.user, this.isLoading = false, this.errorMessage});

  final MobileUser? user;
  final bool isLoading;
  final String? errorMessage;

  bool get isLoggedIn => user != null;

  AuthState copyWith({
    MobileUser? user,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }

  AuthState withoutUser() {
    return const AuthState();
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(const AuthState());

  final AuthRepository _repository;

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _repository.login(
        email: email.trim().toLowerCase(),
        password: password,
      );
      await _repository.saveSession(result);
      state = AuthState(user: result.user);
      return true;
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _messageFromError(err),
      );
      return false;
    }
  }

  Future<bool> register({
    required String namaLengkap,
    required String email,
    required String password,
    required String noTelepon,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _repository.register(
        namaLengkap: namaLengkap.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        noTelepon: noTelepon.trim(),
      );
      await _repository.saveSession(result);
      state = AuthState(user: result.user);
      return true;
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _messageFromError(err),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = state.withoutUser();
  }

  String _messageFromError(Object err) {
    if (err is ApiException) {
      return err.message;
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>(
  (ref) {
    return AuthController(ref.watch(authRepositoryProvider));
  },
);
