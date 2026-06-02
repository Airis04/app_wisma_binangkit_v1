import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
import '../../reservasi/data/reservation_repository.dart';

class RiwayatPage extends ConsumerWidget {
  const RiwayatPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final reservation = data[index];
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
              itemCount: data.length,
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

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({required this.reservation, required this.onOpen});

  final ReservationMobile reservation;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(14),
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
                Text(
                  reservation.kategoriUnit!,
                  style: const TextStyle(color: AppColors.grayMuted),
                ),
              ],
              const SizedBox(height: 12),
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
              const SizedBox(height: 10),
              const Text(
                'Ketuk untuk melihat detail',
                style: TextStyle(color: AppColors.grayMuted, fontSize: 12),
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
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Text(
          'Belum ada riwayat pesanan.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.grayMuted),
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
            const Text(
              'Gagal memuat riwayat. Pastikan Anda sudah masuk.',
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
