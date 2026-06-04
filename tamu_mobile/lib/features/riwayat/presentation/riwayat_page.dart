import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
import '../../reservasi/data/reservation_repository.dart';

class RiwayatPage extends ConsumerStatefulWidget {
  const RiwayatPage({super.key});

  @override
  ConsumerState<RiwayatPage> createState() => _RiwayatPageState();
}

class _RiwayatPageState extends ConsumerState<RiwayatPage> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      ref.invalidate(myReservationsProvider);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reservations = ref.watch(myReservationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Pesanan'),
        actions: [
          IconButton(
            tooltip: 'Muat ulang',
            onPressed: () => ref.invalidate(myReservationsProvider),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: reservations.when(
        data: (data) {
          if (data.isEmpty) {
            return const _EmptyState();
          }

          return RefreshIndicator(
            onRefresh: () => ref.refresh(myReservationsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 104),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _HistoryHeader(reservations: data);
                }

                final reservation = data[index - 1];
                return _ReservationCard(
                  reservation: reservation,
                  onOpen: () {
                    ref.invalidate(
                      reservationDetailProvider(reservation.idReservasi),
                    );
                    context.push('/riwayat/${reservation.idReservasi}');
                  },
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemCount: data.length + 1,
            ),
          );
        },
        error: (error, _) => _ErrorState(
          onLogin: () => context.push('/login'),
          onRetry: () => ref.invalidate(myReservationsProvider),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _HistoryHeader extends StatelessWidget {
  const _HistoryHeader({required this.reservations});

  final List<ReservationMobile> reservations;

  @override
  Widget build(BuildContext context) {
    final menunggu = reservations
        .where(
          (item) =>
              item.statusPesanan == 'Menunggu Pembayaran' ||
              item.statusPesanan == 'Menunggu Konfirmasi',
        )
        .length;
    final selesai = reservations
        .where((item) => item.statusPesanan == 'Selesai')
        .length;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: [
          BoxShadow(
            color: AppColors.navy.withValues(alpha: 0.16),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Pantau Pesanan Anda',
            style: TextStyle(
              color: AppColors.card,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Status pesanan diperbarui otomatis setelah admin melakukan verifikasi.',
            style: TextStyle(
              color: AppColors.card.withValues(alpha: 0.84),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _HeaderPill(
                icon: Icons.receipt_long_outlined,
                label: '${reservations.length} pesanan',
              ),
              _HeaderPill(
                icon: Icons.hourglass_top_outlined,
                label: '$menunggu menunggu',
              ),
              _HeaderPill(
                icon: Icons.check_circle_outline,
                label: '$selesai selesai',
              ),
            ],
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

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({required this.reservation, required this.onOpen});

  final ReservationMobile reservation;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      reservation.namaUnit ?? reservation.idUnit,
                      style: const TextStyle(
                        color: AppColors.grayText,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  _StatusBadge(status: reservation.statusPesanan),
                ],
              ),
              if (reservation.kategoriUnit != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.home_work_outlined,
                      color: AppColors.grayMuted,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      reservation.kategoriUnit!,
                      style: const TextStyle(color: AppColors.grayMuted),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Column(
                  children: [
                    _InfoRow(
                      icon: Icons.confirmation_number_outlined,
                      text: reservation.idReservasi,
                    ),
                    const SizedBox(height: 8),
                    _InfoRow(
                      icon: Icons.calendar_today_outlined,
                      text:
                          '${formatTanggalPendek(reservation.tglCheckin)} - ${formatTanggalPendek(reservation.tglCheckout)}',
                    ),
                    const SizedBox(height: 8),
                    _InfoRow(
                      icon: Icons.payments_outlined,
                      text: formatRupiah(reservation.totalTagihan),
                      strong: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _statusHint(reservation.statusPesanan),
                      style: const TextStyle(
                        color: AppColors.grayMuted,
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(
                    Icons.arrow_forward_ios,
                    color: AppColors.grayMuted,
                    size: 14,
                  ),
                ],
              ),
            ],
          ),
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
      'Selesai' => AppColors.hijau,
      'Batal' => AppColors.merah,
      'Menunggu Konfirmasi' => AppColors.biruTerang,
      _ => AppColors.navy,
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

String _statusHint(String status) {
  return switch (status) {
    'Menunggu Pembayaran' => 'Menunggu bukti pembayaran dikirim.',
    'Menunggu Konfirmasi' => 'Sedang menunggu verifikasi admin.',
    'Selesai' => 'Pesanan sudah disetujui.',
    'Batal' => 'Pesanan dibatalkan atau ditolak.',
    _ => 'Ketuk untuk melihat detail.',
  };
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.text, this.strong = false});

  final IconData icon;
  final String text;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.grayMuted),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: strong ? AppColors.navy : AppColors.grayText,
              fontWeight: strong ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
        ),
      ],
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
                Icons.receipt_long_outlined,
                color: AppColors.grayMuted,
                size: 42,
              ),
              SizedBox(height: 12),
              Text(
                'Belum ada riwayat pesanan.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.grayText,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 6),
              Text(
                'Pesanan yang Anda buat akan tampil di halaman ini.',
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
  const _ErrorState({required this.onLogin, required this.onRetry});

  final VoidCallback onLogin;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: AppColors.merah, size: 38),
            const SizedBox(height: 12),
            const Text(
              'Gagal memuat riwayat.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Pastikan Anda sudah masuk dan koneksi tersedia.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.grayMuted),
            ),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: onLogin, child: const Text('Masuk')),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      ),
    );
  }
}
