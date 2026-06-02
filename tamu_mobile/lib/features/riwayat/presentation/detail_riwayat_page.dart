import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/theme.dart';
import '../../../shared/utils/format.dart';
import '../../reservasi/data/reservation_repository.dart';

class DetailRiwayatPage extends ConsumerStatefulWidget {
  const DetailRiwayatPage({required this.idReservasi, super.key});

  final String idReservasi;

  @override
  ConsumerState<DetailRiwayatPage> createState() => _DetailRiwayatPageState();
}

class _DetailRiwayatPageState extends ConsumerState<DetailRiwayatPage> {
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      ref.invalidate(reservationDetailProvider(widget.idReservasi));
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
    final reservation = ref.watch(
      reservationDetailProvider(widget.idReservasi),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Pesanan'),
        actions: [
          IconButton(
            tooltip: 'Muat ulang',
            onPressed: () =>
                ref.invalidate(reservationDetailProvider(widget.idReservasi)),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: reservation.when(
        data: (data) => RefreshIndicator(
          onRefresh: () =>
              ref.refresh(reservationDetailProvider(widget.idReservasi).future),
          child: _DetailContent(reservation: data),
        ),
        error: (error, _) => _ErrorState(
          onRetry: () =>
              ref.invalidate(reservationDetailProvider(widget.idReservasi)),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _DetailContent extends StatelessWidget {
  const _DetailContent({required this.reservation});

  final ReservationMobile reservation;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _StatusCard(reservation: reservation),
        const SizedBox(height: 14),
        _UnitCard(reservation: reservation),
        const SizedBox(height: 14),
        _PaymentCard(reservation: reservation),
        const SizedBox(height: 14),
        _ProofCard(reservation: reservation),
      ],
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.reservation});

  final ReservationMobile reservation;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
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
                    reservation.idReservasi,
                    style: const TextStyle(
                      color: AppColors.grayText,
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                _StatusBadge(status: reservation.statusPesanan),
              ],
            ),
            const SizedBox(height: 12),
            _InfoRow(
              label: 'Status',
              value: reservation.statusPesanan,
              icon: Icons.info_outline,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'Dibuat',
              value: formatTanggalPendek(reservation.createdAt),
              icon: Icons.schedule_outlined,
            ),
            const SizedBox(height: 12),
            _StatusMessage(status: reservation.statusPesanan),
          ],
        ),
      ),
    );
  }
}

class _UnitCard extends StatelessWidget {
  const _UnitCard({required this.reservation});

  final ReservationMobile reservation;

  @override
  Widget build(BuildContext context) {
    final hargaPerMalam = reservation.hargaPerMalam;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Informasi Unit',
              style: TextStyle(
                color: AppColors.grayText,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            _InfoRow(
              label: 'Unit',
              value: reservation.namaUnit ?? reservation.idUnit,
              icon: Icons.home_work_outlined,
            ),
            if (reservation.kategoriUnit != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                label: 'Kategori',
                value: reservation.kategoriUnit!,
                icon: Icons.category_outlined,
              ),
            ],
            if (reservation.kapasitasUnit != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                label: 'Kapasitas',
                value: '${reservation.kapasitasUnit} orang',
                icon: Icons.groups_outlined,
              ),
            ],
            if (hargaPerMalam != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                label: 'Harga',
                value: '${formatRupiah(hargaPerMalam)} / malam',
                icon: Icons.sell_outlined,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  const _PaymentCard({required this.reservation});

  final ReservationMobile reservation;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Detail Menginap',
              style: TextStyle(
                color: AppColors.grayText,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            _InfoRow(
              label: 'Check-in',
              value: formatTanggal(reservation.tglCheckin),
              icon: Icons.login_outlined,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'Check-out',
              value: formatTanggal(reservation.tglCheckout),
              icon: Icons.logout_outlined,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'Durasi',
              value: '${reservation.jumlahMalam} malam',
              icon: Icons.nights_stay_outlined,
            ),
            const SizedBox(height: 8),
            _InfoRow(
              label: 'Tagihan',
              value: formatRupiah(reservation.totalTagihan),
              icon: Icons.payments_outlined,
              strong: true,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProofCard extends StatelessWidget {
  const _ProofCard({required this.reservation});

  final ReservationMobile reservation;

  @override
  Widget build(BuildContext context) {
    final proofUrl = reservation.buktiBayarUrl;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Bukti Pembayaran',
              style: TextStyle(
                color: AppColors.grayText,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            if (proofUrl == null)
              const Text(
                'Bukti pembayaran belum diunggah.',
                style: TextStyle(color: AppColors.grayMuted),
              )
            else
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CachedNetworkImage(
                  imageUrl: proofUrl,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  errorWidget: (context, url, error) => const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(
                      child: Text(
                        'Gagal memuat bukti pembayaran.',
                        style: TextStyle(color: AppColors.grayMuted),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatusMessage extends StatelessWidget {
  const _StatusMessage({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final message = switch (status) {
      'Menunggu Pembayaran' =>
        'Pesanan dibuat, tetapi bukti pembayaran belum dikirim.',
      'Menunggu Konfirmasi' =>
        'Bukti pembayaran sudah dikirim dan sedang menunggu verifikasi pemilik.',
      'Selesai' => 'Pesanan sudah disetujui oleh pemilik.',
      'Batal' => 'Pesanan dibatalkan atau pembayaran ditolak.',
      _ => 'Status pesanan sedang diproses.',
    };

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _statusColor(status).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _statusColor(status)),
      ),
      child: Text(message, style: TextStyle(color: _statusColor(status))),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(status);

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
  const _InfoRow({
    required this.label,
    required this.value,
    required this.icon,
    this.strong = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.grayMuted),
        const SizedBox(width: 8),
        SizedBox(
          width: 88,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.grayMuted),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: strong ? AppColors.navy : AppColors.grayText,
              fontWeight: strong ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ),
      ],
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
              'Gagal memuat detail pesanan.',
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

Color _statusColor(String status) {
  return switch (status) {
    'Selesai' => AppColors.hijau,
    'Batal' => AppColors.merah,
    'Menunggu Konfirmasi' => AppColors.biruTerang,
    _ => AppColors.navy,
  };
}
