import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/application/auth_controller.dart';
import '../features/auth/presentation/forgot_password_page.dart';
import '../features/auth/presentation/login_page.dart';
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
      final isLoginRoute = state.uri.path == '/login';
      final isForgotPasswordRoute = state.uri.path == '/lupa-password';
      final isPublicAuthRoute = isLoginRoute || isForgotPasswordRoute;

      if (authState.isChecking) {
        return isPublicAuthRoute ? null : '/login';
      }

      if (!authState.isLoggedIn) {
        return isPublicAuthRoute ? null : '/login';
      }

      if (isPublicAuthRoute) return '/';
      return null;
    },
    routes: [
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
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (i) => _onTap(context, i),
        backgroundColor: AppColors.card,
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
    );
  }
}
