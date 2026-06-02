import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
import '../data/unit_repository.dart';

class DetailUnitPage extends ConsumerStatefulWidget {
  const DetailUnitPage({required this.idUnit, super.key});

  final String idUnit;

  @override
  ConsumerState<DetailUnitPage> createState() => _DetailUnitPageState();
}

class _DetailUnitPageState extends ConsumerState<DetailUnitPage> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      ref.invalidate(unitDetailProvider(widget.idUnit));
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final unit = ref.watch(unitDetailProvider(widget.idUnit));

    return Scaffold(
      appBar: AppBar(title: const Text('Detail Unit')),
      body: unit.when(
        data: (data) => RefreshIndicator(
          onRefresh: () =>
              ref.refresh(unitDetailProvider(widget.idUnit).future),
          child: _DetailContent(unit: data),
        ),
        error: (error, _) => _ErrorState(
          onRetry: () => ref.invalidate(unitDetailProvider(widget.idUnit)),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
      bottomNavigationBar: unit.maybeWhen(
        data: (data) => SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: data.bisaDipesan
                  ? () => context.push('/unit/${data.idUnit}/pesan')
                  : null,
              child: Text(
                data.bisaDipesan ? 'Pesan Unit Ini' : 'Unit Tidak Bisa Dipesan',
              ),
            ),
          ),
        ),
        orElse: () => null,
      ),
    );
  }
}

class _DetailContent extends StatelessWidget {
  const _DetailContent({required this.unit});

  final UnitHomestay unit;

  @override
  Widget build(BuildContext context) {
    final photos = unit.fotos.isNotEmpty
        ? unit.fotos.map((foto) => foto.imageUrl).toList()
        : [if (unit.coverUrl != null) unit.coverUrl!];

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        AspectRatio(
          aspectRatio: 16 / 10,
          child: photos.isEmpty
              ? const ColoredBox(
                  color: AppColors.background,
                  child: Icon(
                    Icons.home_work_outlined,
                    color: AppColors.grayMuted,
                    size: 54,
                  ),
                )
              : PageView.builder(
                  itemCount: photos.length,
                  itemBuilder: (context, index) {
                    return CachedNetworkImage(
                      imageUrl: photos[index],
                      fit: BoxFit.cover,
                      placeholder: (context, url) =>
                          const Center(child: CircularProgressIndicator()),
                      errorWidget: (context, url, error) => const Icon(
                        Icons.broken_image_outlined,
                        color: AppColors.grayMuted,
                      ),
                    );
                  },
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
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: AppColors.grayText,
                      ),
                    ),
                  ),
                  _StatusBadge(status: unit.statusUnit),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${unit.kategori} • Kapasitas ${unit.kapasitas} orang',
                style: const TextStyle(color: AppColors.grayMuted),
              ),
              const SizedBox(height: 14),
              Text(
                '${formatRupiah(unit.hargaPerMalam)} / malam',
                style: const TextStyle(
                  color: AppColors.navy,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (unit.statusUnit == 'Perawatan') ...[
                const SizedBox(height: 16),
                const _StatusInfoCard(
                  icon: Icons.build_circle_outlined,
                  title: 'Unit sedang perawatan',
                  message:
                      'Unit ini sementara tidak bisa dipesan karena sedang ada perawatan. Silakan pilih unit lain yang tersedia.',
                  isError: true,
                ),
              ] else if (unit.statusUnit == 'Terisi') ...[
                const SizedBox(height: 16),
                const _StatusInfoCard(
                  icon: Icons.event_busy_outlined,
                  title: 'Unit terisi hari ini',
                  message:
                      'Unit ini sedang terisi untuk tanggal hari ini. Kamu tetap bisa menekan Pesan Unit Ini untuk memilih tanggal lain.',
                  isError: false,
                ),
              ],
              const SizedBox(height: 24),
              const Text(
                'Fasilitas',
                style: TextStyle(
                  color: AppColors.grayText,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              if (unit.fasilitas.isEmpty)
                const Text(
                  'Fasilitas belum dicatat.',
                  style: TextStyle(color: AppColors.grayMuted),
                )
              else
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: unit.fasilitas
                      .map(
                        (item) => Chip(
                          label: Text(item),
                          side: const BorderSide(color: AppColors.grayBorder),
                          backgroundColor: AppColors.card,
                        ),
                      )
                      .toList(),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatusInfoCard extends StatelessWidget {
  const _StatusInfoCard({
    required this.icon,
    required this.title,
    required this.message,
    required this.isError,
  });

  final IconData icon;
  final String title;
  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final color = isError ? AppColors.merah : AppColors.navy;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: color, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: const TextStyle(color: AppColors.grayMuted),
                ),
              ],
            ),
          ),
        ],
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

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Gagal memuat detail unit.',
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
