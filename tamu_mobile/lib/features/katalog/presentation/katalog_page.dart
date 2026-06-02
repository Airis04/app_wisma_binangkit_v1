import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog Unit'),
        actions: [
          IconButton(
            tooltip: 'Pengaturan Akun',
            onPressed: () => context.push('/pengaturan'),
            icon: const Icon(Icons.account_circle_outlined),
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
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final unit = data[index];
                return _UnitCard(
                  unit: unit,
                  onOpen: () {
                    ref.invalidate(unitDetailProvider(unit.idUnit));
                    context.push('/unit/${unit.idUnit}');
                  },
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemCount: data.length,
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

class _UnitCard extends StatelessWidget {
  const _UnitCard({required this.unit, required this.onOpen});

  final UnitHomestay unit;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final coverUrl = unit.coverUrl;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
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
              child: coverUrl == null
                  ? const ColoredBox(
                      color: AppColors.background,
                      child: Icon(
                        Icons.home_work_outlined,
                        color: AppColors.grayMuted,
                        size: 44,
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
            ),
            Padding(
              padding: const EdgeInsets.all(14),
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
                      _StatusBadge(status: unit.statusUnit),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${unit.kategori} • Kapasitas ${unit.kapasitas} orang',
                    style: const TextStyle(color: AppColors.grayMuted),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '${formatRupiah(unit.hargaPerMalam)} / malam',
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
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
      _ => AppColors.grayMuted,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
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
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text(
          'Belum ada unit yang tersedia di katalog.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.grayMuted),
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
              style: const TextStyle(color: AppColors.grayMuted),
            ),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }
}
