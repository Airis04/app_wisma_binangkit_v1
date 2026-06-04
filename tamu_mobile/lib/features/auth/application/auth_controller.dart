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
    this.hasSeenOnboarding = true,
  });

  final AuthStatus status;
  final MobileUser? user;
  final bool isLoading;
  final String? errorMessage;
  final bool hasSeenOnboarding;

  bool get isLoggedIn => status == AuthStatus.authenticated && user != null;
  bool get isChecking => status == AuthStatus.checking;

  AuthState copyWith({
    AuthStatus? status,
    MobileUser? user,
    bool? isLoading,
    String? errorMessage,
    bool? hasSeenOnboarding,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      hasSeenOnboarding: hasSeenOnboarding ?? this.hasSeenOnboarding,
    );
  }

  AuthState withoutUser() {
    return AuthState(
      status: AuthStatus.unauthenticated,
      hasSeenOnboarding: hasSeenOnboarding,
    );
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
      final hasSeenOnboarding = await _repository.hasSeenOnboarding();
      final hasToken = await _repository.hasStoredToken();
      if (!hasToken) {
        state = AuthState(
          status: AuthStatus.unauthenticated,
          hasSeenOnboarding: hasSeenOnboarding,
        );
        return;
      }

      final user = await _repository.me();
      state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
        hasSeenOnboarding: true,
      );
    } catch (err) {
      await _repository.logout();
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: _messageFromError(err),
        hasSeenOnboarding: true,
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
      state = AuthState(
        status: AuthStatus.authenticated,
        user: result.user,
        hasSeenOnboarding: true,
      );
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
      await _repository.register(
        namaLengkap: namaLengkap.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        noTelepon: noTelepon.trim(),
      );
      state = AuthState(
        status: AuthStatus.unauthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      );
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
      state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
        hasSeenOnboarding: state.hasSeenOnboarding,
      );
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
      state = AuthState(
        status: AuthStatus.authenticated,
        user: user,
        hasSeenOnboarding: state.hasSeenOnboarding,
      );
      return true;
    } catch (err) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _messageFromError(err),
      );
      return false;
    }
  }

  Future<void> completeOnboarding() async {
    await _repository.markOnboardingSeen();
    state = state.copyWith(
      status: AuthStatus.unauthenticated,
      hasSeenOnboarding: true,
      clearError: true,
    );
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
