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
            child: Container(
              padding: const EdgeInsets.all(12),
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
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Mulai dari',
                          style: TextStyle(
                            color: AppColors.grayMuted,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          '${formatRupiah(data.hargaPerMalam)} / malam',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.navy,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: data.bisaDipesan
                        ? () => context.push('/unit/${data.idUnit}/pesan')
                        : null,
                    child: Text(data.bisaDipesan ? 'Pesan' : 'Tidak Bisa'),
                  ),
                ],
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
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: AspectRatio(
              aspectRatio: 16 / 10,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  photos.isEmpty
                      ? const ColoredBox(
                          color: AppColors.card,
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
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(),
                              ),
                              errorWidget: (context, url, error) => const Icon(
                                Icons.broken_image_outlined,
                                color: AppColors.grayMuted,
                              ),
                            );
                          },
                        ),
                  Positioned(
                    left: 12,
                    bottom: 12,
                    child: _StatusBadge(status: unit.statusUnit),
                  ),
                  if (photos.length > 1)
                    Positioned(
                      right: 12,
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.52),
                          borderRadius: BorderRadius.circular(AppRadius.sm),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.photo_library_outlined,
                              color: AppColors.card,
                              size: 15,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              '${photos.length} foto',
                              style: const TextStyle(
                                color: AppColors.card,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
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
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _FactPill(
                    icon: Icons.home_work_outlined,
                    label: unit.kategori,
                  ),
                  _FactPill(
                    icon: Icons.people_outline,
                    label: 'Kapasitas ${unit.kapasitas} orang',
                  ),
                ],
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
              const SizedBox(height: 16),
              _BookingHintCard(status: unit.statusUnit),
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
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Fasilitas',
                      style: TextStyle(
                        color: AppColors.grayText,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Text(
                    '${unit.fasilitas.length} fasilitas',
                    style: const TextStyle(
                      color: AppColors.grayMuted,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
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
                          avatar: const Icon(
                            Icons.check_circle_outline,
                            size: 18,
                            color: AppColors.hijau,
                          ),
                          side: BorderSide(
                            color: AppColors.hijau.withValues(alpha: 0.25),
                          ),
                          backgroundColor: AppColors.hijau.withValues(
                            alpha: 0.08,
                          ),
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

class _FactPill extends StatelessWidget {
  const _FactPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        border: Border.all(color: AppColors.grayBorder),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.navy, size: 16),
          const SizedBox(width: 7),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingHintCard extends StatelessWidget {
  const _BookingHintCard({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final isMaintenance = status == 'Perawatan';
    final isOccupied = status == 'Terisi';

    final icon = isMaintenance
        ? Icons.build_circle_outlined
        : isOccupied
        ? Icons.event_available_outlined
        : Icons.calendar_month_outlined;
    final title = isMaintenance
        ? 'Tidak tersedia untuk dipesan'
        : isOccupied
        ? 'Pilih tanggal lain yang tersedia'
        : 'Cek tanggal sebelum membayar';
    final message = isMaintenance
        ? 'Admin menandai unit ini sedang perawatan.'
        : isOccupied
        ? 'Unit sedang terisi hari ini, tetapi tanggal lain masih bisa dicek.'
        : 'Tanggal akan dicek dulu agar tidak terjadi double booking.';
    final color = isMaintenance ? AppColors.merah : AppColors.navy;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.22)),
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
                  style: TextStyle(color: color, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: const TextStyle(
                    color: AppColors.grayMuted,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.35)),
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
      'Perawatan' => AppColors.merah,
      _ => AppColors.grayMuted,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
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

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.onRetry});

  final VoidCallback onRetry;

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppColors.merah, size: 38),
              const SizedBox(height: 12),
              const Text(
                'Gagal memuat detail unit.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.grayText,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Periksa koneksi lalu coba muat ulang.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.grayMuted),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: onRetry,
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
