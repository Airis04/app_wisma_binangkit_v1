import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/api/api_exception.dart';
import '../data/auth_repository.dart';

enum AuthStatus { checking, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.checking,
    this.user,
    this.isLoading = false,
    this.errorMessage,
  });

  final AuthStatus status;
  final MobileUser? user;
  final bool isLoading;
  final String? errorMessage;

  bool get isLoggedIn => status == AuthStatus.authenticated && user != null;
  bool get isChecking => status == AuthStatus.checking;

  AuthState copyWith({
    AuthStatus? status,
    MobileUser? user,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }

  AuthState withoutUser() {
    return const AuthState(status: AuthStatus.unauthenticated);
  }
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository) : super(const AuthState()) {
    bootstrap();
  }

  final AuthRepository _repository;

  Future<void> bootstrap() async {
    state = state.copyWith(status: AuthStatus.checking, clearError: true);
    try {
      final hasToken = await _repository.hasStoredToken();
      if (!hasToken) {
        state = const AuthState(status: AuthStatus.unauthenticated);
        return;
      }

      final user = await _repository.me();
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } catch (err) {
      await _repository.logout();
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _messageFromError(err),
      );
    }
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _repository.login(
        email: email.trim().toLowerCase(),
        password: password,
      );
      await _repository.saveSession(result);
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
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
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
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

  Future<bool> updateAccount({
    required String namaLengkap,
    required String noTelepon,
    String? passwordLama,
    String? passwordBaru,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final user = await _repository.updateAccount(
        namaLengkap: namaLengkap.trim(),
        noTelepon: noTelepon.trim(),
        passwordLama: passwordLama,
        passwordBaru: passwordBaru,
      );
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _messageFromError(err),
      );
      return false;
    }
  }

  Future<bool> updateProfilePhoto({required String filePath}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final user = await _repository.updateProfilePhoto(filePath: filePath);
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _messageFromError(err),
      );
      return false;
    }
  }

  String _messageFromError(Object err) {
    if (err is ApiException) {
      return err.message;
    }
    if (err is DioException && err.error is ApiException) {
      return (err.error as ApiException).message;
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>(
  (ref) {
    return AuthController(ref.watch(authRepositoryProvider));
  },
);
