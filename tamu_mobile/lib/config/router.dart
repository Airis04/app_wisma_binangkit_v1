import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/login_page.dart';
import '../features/katalog/presentation/detail_unit_page.dart';
import '../features/katalog/presentation/katalog_page.dart';
import '../features/reservasi/presentation/reservasi_page.dart';
import '../features/riwayat/presentation/riwayat_page.dart';
import 'theme.dart';

/// Routing utama aplikasi tamu mobile.
///
/// MVP awal: belum ada auth guard otomatis (redirect login berdasarkan
/// status JWT) supaya bisa navigasi sambil bangun fitur-fitur per
/// branch berikutnya. Auth guard ditambahkan di branch
/// feature/mobile-auth bersama implementasi login asli.
final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    ShellRoute(
      builder: (context, state, child) => _MainShell(child: child),
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const KatalogPage(),
        ),
        GoRoute(
          path: '/riwayat',
          builder: (context, state) => const RiwayatPage(),
        ),
      ],
    ),
    GoRoute(
      path: '/unit/:idUnit',
      builder: (context, state) => DetailUnitPage(
        idUnit: state.pathParameters['idUnit'] ?? '',
      ),
    ),
    GoRoute(
      path: '/unit/:idUnit/pesan',
      builder: (context, state) => ReservasiPage(
        idUnit: state.pathParameters['idUnit'] ?? '',
      ),
    ),
  ],
);

class _MainShell extends StatelessWidget {
  const _MainShell({required this.child});

  final Widget child;

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/riwayat')) return 1;
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
        ],
      ),
    );
  }
}
