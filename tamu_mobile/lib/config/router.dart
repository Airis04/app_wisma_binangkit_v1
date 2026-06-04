import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/application/auth_controller.dart';
import '../features/auth/presentation/forgot_password_page.dart';
import '../features/auth/presentation/login_page.dart';
import '../features/auth/presentation/onboarding_page.dart';
import '../features/auth/presentation/splash_page.dart';
import '../features/katalog/presentation/detail_unit_page.dart';
import '../features/katalog/presentation/katalog_page.dart';
import '../features/pengaturan/presentation/pengaturan_page.dart';
import '../features/reservasi/presentation/reservasi_page.dart';
import '../features/riwayat/presentation/detail_riwayat_page.dart';
import '../features/riwayat/presentation/riwayat_page.dart';
import 'theme.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthRefreshListenable(ref),
    redirect: (context, state) {
      final isSplashRoute = state.uri.path == '/splash';
      final isOnboardingRoute = state.uri.path == '/onboarding';
      final isLoginRoute = state.uri.path == '/login';
      final isForgotPasswordRoute = state.uri.path == '/lupa-password';
      final isPublicAuthRoute =
          isSplashRoute ||
          isOnboardingRoute ||
          isLoginRoute ||
          isForgotPasswordRoute;

      if (authState.isChecking) {
        return isSplashRoute ? null : '/splash';
      }

      if (!authState.isLoggedIn) {
        if (!authState.hasSeenOnboarding) {
          return isOnboardingRoute ? null : '/onboarding';
        }
        return isLoginRoute || isForgotPasswordRoute ? null : '/login';
      }

      if (isPublicAuthRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashPage()),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
        path: '/lupa-password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => _MainShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (context, state) => const KatalogPage()),
          GoRoute(
            path: '/riwayat',
            builder: (context, state) => const RiwayatPage(),
          ),
          GoRoute(
            path: '/riwayat/:idReservasi',
            builder: (context, state) => DetailRiwayatPage(
              idReservasi: state.pathParameters['idReservasi'] ?? '',
            ),
          ),
          GoRoute(
            path: '/pengaturan',
            builder: (context, state) => const PengaturanPage(),
          ),
        ],
      ),
      GoRoute(
        path: '/unit/:idUnit',
        builder: (context, state) =>
            DetailUnitPage(idUnit: state.pathParameters['idUnit'] ?? ''),
      ),
      GoRoute(
        path: '/unit/:idUnit/pesan',
        builder: (context, state) =>
            ReservasiPage(idUnit: state.pathParameters['idUnit'] ?? ''),
      ),
    ],
  );
});

class _AuthRefreshListenable extends ChangeNotifier {
  _AuthRefreshListenable(Ref ref) {
    _removeListener = ref
        .listen<AuthState>(authControllerProvider, (_, __) => notifyListeners())
        .close;
  }

  late final void Function() _removeListener;

  @override
  void dispose() {
    _removeListener();
    super.dispose();
  }
}

class _MainShell extends StatelessWidget {
  const _MainShell({required this.child});

  final Widget child;

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/riwayat')) return 1;
    if (location.startsWith('/pengaturan')) return 2;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/riwayat');
        break;
      case 2:
        context.go('/pengaturan');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final index = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.grayBorder),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: NavigationBar(
            selectedIndex: index,
            onDestinationSelected: (i) => _onTap(context, i),
            backgroundColor: AppColors.card,
            elevation: 0,
            height: 68,
            indicatorColor: AppColors.navy.withValues(alpha: 0.12),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home, color: AppColors.navy),
                label: 'Katalog',
              ),
              NavigationDestination(
                icon: Icon(Icons.receipt_long_outlined),
                selectedIcon: Icon(Icons.receipt_long, color: AppColors.navy),
                label: 'Riwayat',
              ),
              NavigationDestination(
                icon: Icon(Icons.settings_outlined),
                selectedIcon: Icon(Icons.settings, color: AppColors.navy),
                label: 'Pengaturan',
              ),
            ],
          ),
        ),
      ),
    );
  }
}
