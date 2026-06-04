import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/widgets/wisma_brand_mark.dart';
import '../application/auth_controller.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});

  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  final _pageController = PageController();
  int _index = 0;

  static const _items = [
    _OnboardingItem(
      icon: Icons.home_work_outlined,
      title: 'Temukan Unit yang Nyaman',
      description:
          'Lihat pilihan unit Wisma Binangkit lengkap dengan foto, kapasitas, fasilitas, dan harga per malam.',
    ),
    _OnboardingItem(
      icon: Icons.calendar_month_outlined,
      title: 'Pilih Tanggal Menginap',
      description:
          'Cek ketersediaan tanggal terlebih dahulu agar pesanan tidak bentrok dengan tamu lain.',
    ),
    _OnboardingItem(
      icon: Icons.payments_outlined,
      title: 'Bayar Manual, Diproses Admin',
      description:
          'Ikuti instruksi pembayaran, unggah bukti transfer, lalu pantau status pesanan dari Riwayat.',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await ref.read(authControllerProvider.notifier).completeOnboarding();
    if (mounted) context.go('/login');
  }

  void _next() {
    if (_index == _items.length - 1) {
      _finish();
      return;
    }

    _pageController.nextPage(
      duration: const Duration(milliseconds: 260),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _index == _items.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
          child: Column(
            children: [
              Row(
                children: [
                  const WismaBrandMark(compact: true),
                  const Spacer(),
                  TextButton(onPressed: _finish, child: const Text('Lewati')),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  itemCount: _items.length,
                  onPageChanged: (value) {
                    setState(() {
                      _index = value;
                    });
                  },
                  itemBuilder: (context, index) {
                    return _OnboardingSlide(item: _items[index]);
                  },
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _items.length,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    width: _index == index ? 26 : 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: _index == index
                          ? AppColors.navy
                          : AppColors.grayBorder,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                onPressed: _next,
                child: Text(isLast ? 'Mulai Sekarang' : 'Lanjut'),
              ),
              const SizedBox(height: 10),
              Text(
                isLast
                    ? 'Setelah ini, silakan masuk atau daftar akun tamu.'
                    : 'Hanya beberapa langkah untuk mulai memesan.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppColors.grayMuted,
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OnboardingSlide extends StatelessWidget {
  const _OnboardingSlide({required this.item});

  final _OnboardingItem item;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 220,
          height: 220,
          decoration: BoxDecoration(
            color: AppColors.card,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.grayBorder),
            boxShadow: [
              BoxShadow(
                color: AppColors.navy.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Positioned(
                bottom: 56,
                child: Container(
                  width: 138,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.navy.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(99),
                  ),
                ),
              ),
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: AppColors.navy.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Icon(item.icon, color: AppColors.navy, size: 46),
              ),
            ],
          ),
        ),
        const SizedBox(height: 34),
        Text(
          item.title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.grayText,
            fontSize: 26,
            fontWeight: FontWeight.w900,
            height: 1.18,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          item.description,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.grayMuted,
            fontSize: 15,
            height: 1.55,
          ),
        ),
      ],
    );
  }
}

class _OnboardingItem {
  const _OnboardingItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;
}
