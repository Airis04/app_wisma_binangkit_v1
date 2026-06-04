import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
import '../../auth/application/auth_controller.dart';
import '../data/unit_repository.dart';

class KatalogPage extends ConsumerStatefulWidget {
  const KatalogPage({super.key});

  @override
  ConsumerState<KatalogPage> createState() => _KatalogPageState();
}

class _KatalogPageState extends ConsumerState<KatalogPage> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      ref.invalidate(unitListProvider);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final units = ref.watch(unitListProvider);
    final user = ref.watch(authControllerProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog'),
        actions: [
          IconButton(
            tooltip: 'Pengaturan Akun',
            onPressed: () => context.push('/pengaturan'),
            icon: _ProfileIcon(photoUrl: user?.fotoProfilUrl),
          ),
        ],
      ),
      body: units.when(
        data: (data) {
          if (data.isEmpty) {
            return const _EmptyState();
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(unitListProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 104),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _KatalogHeader(
                    nama: user?.namaLengkap ?? 'Tamu',
                    units: data,
                  );
                }

                final unit = data[index - 1];
                return _UnitCard(
                  unit: unit,
                  onOpen: () {
                    ref.invalidate(unitDetailProvider(unit.idUnit));
                    context.push('/unit/${unit.idUnit}');
                  },
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemCount: data.length + 1,
            ),
          );
        },
        error: (error, _) => _ErrorState(
          message: 'Gagal memuat katalog unit.',
          onRetry: () => ref.invalidate(unitListProvider),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _KatalogHeader extends StatelessWidget {
  const _KatalogHeader({required this.nama, required this.units});

  final String nama;
  final List<UnitHomestay> units;

  @override
  Widget build(BuildContext context) {
    final tersedia = units
        .where((unit) => unit.statusUnit == 'Tersedia')
        .length;
    final perawatan = units
        .where((unit) => unit.statusUnit == 'Perawatan')
        .length;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: 0.18),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Halo, $nama',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.card,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Pilih unit yang nyaman untuk menginap di Pangandaran.',
                  style: TextStyle(
                    color: AppColors.card.withValues(alpha: 0.86),
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _HeaderPill(
                      icon: Icons.home_work_outlined,
                      label: '${units.length} unit',
                    ),
                    _HeaderPill(
                      icon: Icons.check_circle_outline,
                      label: '$tersedia tersedia',
                    ),
                    if (perawatan > 0)
                      _HeaderPill(
                        icon: Icons.build_circle_outlined,
                        label: '$perawatan perawatan',
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.card.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: const Icon(Icons.home_work_outlined, color: AppColors.card),
          ),
        ],
      ),
    );
  }
}

class _HeaderPill extends StatelessWidget {
  const _HeaderPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.card.withValues(alpha: 0.13),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.card.withValues(alpha: 0.16)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: AppColors.card),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.card,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileIcon extends StatelessWidget {
  const _ProfileIcon({required this.photoUrl});

  final String? photoUrl;

  @override
  Widget build(BuildContext context) {
    if (photoUrl == null) {
      return const Icon(Icons.account_circle_outlined);
    }

    return SizedBox(
      width: 28,
      height: 28,
      child: ClipOval(
        child: CachedNetworkImage(
          imageUrl: photoUrl!,
          fit: BoxFit.cover,
          errorWidget: (context, url, error) =>
              const Icon(Icons.account_circle_outlined),
        ),
      ),
    );
  }
}

class _UnitCard extends StatelessWidget {
  const _UnitCard({required this.unit, required this.onOpen});

  final UnitHomestay unit;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final coverUrl = unit.coverUrl;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpen,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  coverUrl == null
                      ? const ColoredBox(
                          color: AppColors.background,
                          child: Icon(
                            Icons.home_work_outlined,
                            color: AppColors.grayMuted,
                            size: 48,
                          ),
                        )
                      : CachedNetworkImage(
                          imageUrl: coverUrl,
                          fit: BoxFit.cover,
                          placeholder: (context, url) =>
                              const Center(child: CircularProgressIndicator()),
                          errorWidget: (context, url, error) => const Icon(
                            Icons.broken_image_outlined,
                            color: AppColors.grayMuted,
                          ),
                        ),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.04),
                            Colors.black.withValues(alpha: 0.28),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 12,
                    bottom: 12,
                    child: _StatusBadge(status: unit.statusUnit),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          unit.namaUnit,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.grayText,
                          ),
                        ),
                      ),
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: const Icon(
                          Icons.arrow_forward_ios,
                          size: 15,
                          color: AppColors.navy,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(
                        Icons.king_bed_outlined,
                        size: 18,
                        color: AppColors.grayMuted,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '${unit.kategori} • Kapasitas ${unit.kapasitas} orang',
                          style: const TextStyle(color: AppColors.grayMuted),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${formatRupiah(unit.hargaPerMalam)} / malam',
                          style: const TextStyle(
                            color: AppColors.navy,
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const Text(
                        'Lihat detail',
                        style: TextStyle(
                          color: AppColors.grayMuted,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'Tersedia' => AppColors.hijau,
      'Terisi' => AppColors.merah,
      'Perawatan' => AppColors.merah,
      _ => AppColors.grayMuted,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.card.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.grayBorder),
          ),
          child: const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.home_work_outlined,
                color: AppColors.grayMuted,
                size: 42,
              ),
              SizedBox(height: 12),
              Text(
                'Belum ada unit di katalog.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.grayText,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 6),
              Text(
                'Unit yang ditambahkan admin akan tampil di sini.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.grayMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tarik layar ke bawah atau coba muat ulang.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.grayMuted),
            ),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }
}
