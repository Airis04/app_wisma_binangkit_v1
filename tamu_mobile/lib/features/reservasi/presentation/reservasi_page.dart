import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../config/theme.dart';
import '../../../shared/api/api_exception.dart';
import '../../../shared/utils/format.dart';
import '../../katalog/data/unit_repository.dart';
import '../data/reservation_repository.dart';

class ReservasiPage extends ConsumerStatefulWidget {
  const ReservasiPage({required this.idUnit, super.key});

  final String idUnit;

  @override
  ConsumerState<ReservasiPage> createState() => _ReservasiPageState();
}

class _ReservasiPageState extends ConsumerState<ReservasiPage> {
  Timer? _paymentRefreshTimer;
  DateTime? _checkin;
  DateTime? _checkout;
  AvailabilityResult? _availability;
  XFile? _buktiBayar;
  bool _isPaymentStep = false;
  bool _isCheckingAvailability = false;
  bool _isSubmitting = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _paymentRefreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      ref.invalidate(paymentSettingProvider);
    });
  }

  @override
  void dispose() {
    _paymentRefreshTimer?.cancel();
    super.dispose();
  }

  int _jumlahMalam() {
    final checkin = _checkin;
    final checkout = _checkout;
    if (checkin == null || checkout == null) return 0;
    return checkout.difference(checkin).inDays;
  }

  Future<void> _pickDate({required bool isCheckin}) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final initial = isCheckin
        ? _checkin ?? today
        : _checkout ?? _checkin?.add(const Duration(days: 1)) ?? today;

    final picked = await showDatePicker(
      context: context,
      locale: const Locale('id', 'ID'),
      initialDate: initial.isBefore(today) ? today : initial,
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
    );

    if (picked == null) return;

    setState(() {
      if (isCheckin) {
        _checkin = picked;
        if (_checkout == null || !_checkout!.isAfter(picked)) {
          _checkout = picked.add(const Duration(days: 1));
        }
      } else {
        _checkout = picked;
      }
      _errorMessage = null;
      _successMessage = null;
      _availability = null;
      _buktiBayar = null;
      _isPaymentStep = false;
    });
  }

  Future<void> _pickBuktiBayar() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (file == null) return;

    setState(() {
      _buktiBayar = file;
      _errorMessage = null;
      _successMessage = null;
    });
  }

  bool _validateTanggal() {
    final checkin = _checkin;
    final checkout = _checkout;

    if (checkin == null || checkout == null) {
      setState(() {
        _errorMessage = 'Pilih tanggal check-in dan check-out.';
      });
      return false;
    }

    if (!checkout.isAfter(checkin)) {
      setState(() {
        _errorMessage = 'Tanggal check-out harus setelah check-in.';
      });
      return false;
    }

    return true;
  }

  Future<void> _checkAvailability(UnitHomestay unit) async {
    if (!_validateTanggal()) return;

    setState(() {
      _isCheckingAvailability = true;
      _errorMessage = null;
      _successMessage = null;
      _availability = null;
      _buktiBayar = null;
      _isPaymentStep = false;
    });

    try {
      final result = await ref
          .read(reservationRepositoryProvider)
          .checkAvailability(
            idUnit: unit.idUnit,
            checkin: _checkin!,
            checkout: _checkout!,
          );

      if (!mounted) return;
      setState(() {
        _availability = result;
        if (!result.available) {
          _errorMessage = _availabilityMessage(result);
        } else {
          _successMessage =
              'Tanggal tersedia. Total tagihan ${formatRupiah(result.totalTagihan)}.';
        }
      });
    } catch (err) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _messageFromError(err);
      });
    } finally {
      if (mounted) {
        setState(() {
          _isCheckingAvailability = false;
        });
      }
    }
  }

  void _continueToPayment() {
    if (_availability?.available != true) {
      setState(() {
        _errorMessage = 'Cek ketersediaan tanggal terlebih dahulu.';
      });
      return;
    }

    ref.invalidate(paymentSettingProvider);

    setState(() {
      _isPaymentStep = true;
      _errorMessage = null;
      _successMessage = null;
    });
  }

  void _backToDateStep() {
    setState(() {
      _isPaymentStep = false;
      _errorMessage = null;
      _successMessage = null;
    });
  }

  Future<void> _submit(UnitHomestay unit) async {
    if (!_validateTanggal()) return;

    if (_availability?.available != true) {
      setState(() {
        _errorMessage = 'Cek ketersediaan tanggal terlebih dahulu.';
      });
      return;
    }

    final checkin = _checkin;
    final checkout = _checkout;
    final buktiBayar = _buktiBayar;

    if (checkin == null || checkout == null) return;

    if (buktiBayar == null) {
      setState(() {
        _errorMessage = 'Unggah bukti bayar terlebih dahulu.';
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final repository = ref.read(reservationRepositoryProvider);
      var reservasi = await repository.createReservation(
        idUnit: unit.idUnit,
        checkin: checkin,
        checkout: checkout,
      );

      reservasi = await repository.uploadBuktiBayar(
        idReservasi: reservasi.idReservasi,
        filePath: buktiBayar.path,
      );

      if (!mounted) return;
      ref.invalidate(myReservationsProvider);
      setState(() {
        _successMessage =
            'Reservasi ${reservasi.idReservasi} dikirim dan menunggu konfirmasi pemilik.';
      });
      await _showPaymentSuccessDialog(reservasi.idReservasi);
    } catch (err) {
      if (!mounted) return;
      setState(() {
        _errorMessage = _messageFromError(err);
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  String _messageFromError(Object err) {
    if (err is ApiException) return err.message;
    if (err is DioException && err.error is ApiException) {
      return (err.error as ApiException).message;
    }
    return 'Gagal membuat reservasi. Silakan coba lagi.';
  }

  String _availabilityMessage(AvailabilityResult result) {
    if (result.reason == 'UNIT_PERAWATAN') {
      return 'Unit ini sedang perawatan dan belum bisa dipesan. Silakan pilih unit lain.';
    }

    final overlap = result.overlap;
    if (result.reason == 'SLOT_TERISI' && overlap != null) {
      return 'Unit ini sudah terisi pada ${formatTanggalPendek(overlap.tglCheckin)} sampai ${formatTanggalPendek(overlap.tglCheckout)}. Pilih tanggal lain atau cari unit lain untuk tanggal tersebut.';
    }

    return result.message;
  }

  Future<void> _showPaymentSuccessDialog(String idReservasi) async {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.card,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          title: Column(
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.hijau.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: AppColors.hijau,
                  size: 34,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Bukti Pembayaran Terkirim',
                textAlign: TextAlign.center,
              ),
            ],
          ),
          content: Text(
            'Reservasi $idReservasi sudah masuk ke verifikasi pemilik. Status pesanan bisa dilihat di Riwayat.',
            textAlign: TextAlign.center,
          ),
          actions: [
            OutlinedButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Tutup'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
                context.go('/riwayat');
              },
              child: const Text('Lihat Pesanan'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final unit = ref.watch(unitDetailProvider(widget.idUnit));
    final paymentSetting = ref.watch(paymentSettingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pesan Unit')),
      body: unit.when(
        data: (data) => _ReservasiForm(
          unit: data,
          checkin: _checkin,
          checkout: _checkout,
          availability: _availability,
          paymentSetting: paymentSetting,
          buktiBayar: _buktiBayar,
          jumlahMalam: _jumlahMalam(),
          isPaymentStep: _isPaymentStep,
          isCheckingAvailability: _isCheckingAvailability,
          isSubmitting: _isSubmitting,
          errorMessage: _errorMessage,
          successMessage: _successMessage,
          onPickCheckin: () => _pickDate(isCheckin: true),
          onPickCheckout: () => _pickDate(isCheckin: false),
          onCheckAvailability: () => _checkAvailability(data),
          onContinueToPayment: _continueToPayment,
          onBackToDateStep: _backToDateStep,
          onPickBukti: _pickBuktiBayar,
          onSubmit: () => _submit(data),
        ),
        error: (error, _) => _ErrorState(
          onRetry: () => ref.invalidate(unitDetailProvider(widget.idUnit)),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _ReservasiForm extends StatelessWidget {
  const _ReservasiForm({
    required this.unit,
    required this.checkin,
    required this.checkout,
    required this.availability,
    required this.paymentSetting,
    required this.buktiBayar,
    required this.jumlahMalam,
    required this.isPaymentStep,
    required this.isCheckingAvailability,
    required this.isSubmitting,
    required this.onPickCheckin,
    required this.onPickCheckout,
    required this.onCheckAvailability,
    required this.onContinueToPayment,
    required this.onBackToDateStep,
    required this.onPickBukti,
    required this.onSubmit,
    this.errorMessage,
    this.successMessage,
  });

  final UnitHomestay unit;
  final DateTime? checkin;
  final DateTime? checkout;
  final AvailabilityResult? availability;
  final AsyncValue<PaymentSettingManual> paymentSetting;
  final XFile? buktiBayar;
  final int jumlahMalam;
  final bool isPaymentStep;
  final bool isCheckingAvailability;
  final bool isSubmitting;
  final String? errorMessage;
  final String? successMessage;
  final VoidCallback onPickCheckin;
  final VoidCallback onPickCheckout;
  final VoidCallback onCheckAvailability;
  final VoidCallback onContinueToPayment;
  final VoidCallback onBackToDateStep;
  final VoidCallback onPickBukti;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final isBusy = isCheckingAvailability || isSubmitting;
    final isAvailable = availability?.available == true;
    final totalTagihan =
        availability?.totalTagihan ?? unit.hargaPerMalam * jumlahMalam;
    final canContinue = !isPaymentStep && isAvailable;

    if (!unit.bisaDipesan) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _UnitSummaryCard(unit: unit),
          const SizedBox(height: 16),
          const _BlockedUnitCard(),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => context.go('/'),
            icon: const Icon(Icons.home_work_outlined),
            label: const Text('Pilih Unit Lain'),
          ),
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        _UnitSummaryCard(unit: unit),
        const SizedBox(height: 16),
        _StepHeader(isPaymentStep: isPaymentStep),
        const SizedBox(height: 16),
        if (!isPaymentStep) ...[
          _DateSelectionCard(
            checkin: checkin,
            checkout: checkout,
            onPickCheckin: isBusy ? null : onPickCheckin,
            onPickCheckout: isBusy ? null : onPickCheckout,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: isBusy ? null : onCheckAvailability,
            child: isCheckingAvailability
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.card,
                    ),
                  )
                : const Text('Cek Ketersediaan'),
          ),
        ],
        const SizedBox(height: 16),
        if (availability != null) ...[
          _AvailabilityStatusCard(
            result: availability!,
            message: availability!.available
                ? 'Unit bisa dipesan untuk tanggal yang dipilih.'
                : errorMessage ?? availability!.message,
          ),
          const SizedBox(height: 16),
        ],
        _SummaryCard(
          jumlahMalam: jumlahMalam,
          totalTagihan: totalTagihan,
          checkin: checkin,
          checkout: checkout,
        ),
        if (!isPaymentStep &&
            !isAvailable &&
            availability?.available == false) ...[
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: isBusy ? null : onPickCheckin,
            icon: const Icon(Icons.event_repeat_outlined),
            label: const Text('Pilih Tanggal Lain'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: isBusy ? null : () => context.go('/'),
            icon: const Icon(Icons.home_work_outlined),
            label: const Text('Pilih Unit Lain'),
          ),
        ],
        if (canContinue) ...[
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: isBusy ? null : onContinueToPayment,
            child: const Text('Lanjutkan'),
          ),
        ],
        if (isPaymentStep) ...[
          const SizedBox(height: 16),
          _PaymentInstructionCard(
            totalTagihan: totalTagihan,
            paymentSetting: paymentSetting,
          ),
          const SizedBox(height: 16),
          _UploadProofCard(
            onPressed: isBusy ? null : onPickBukti,
            fileName: buktiBayar?.name,
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: isBusy ? null : onBackToDateStep,
            icon: const Icon(Icons.arrow_back_outlined),
            label: const Text('Ubah Tanggal'),
          ),
        ],
        if (errorMessage != null &&
            !(availability != null && availability?.available == false)) ...[
          const SizedBox(height: 14),
          _MessageBox(message: errorMessage!, isError: true),
        ],
        if (successMessage != null && !canContinue) ...[
          const SizedBox(height: 14),
          _MessageBox(message: successMessage!, isError: false),
        ],
        const SizedBox(height: 18),
        if (isPaymentStep)
          ElevatedButton(
            onPressed: isBusy ? null : onSubmit,
            child: isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.card,
                    ),
                  )
                : const Text('Kirim Bukti Pembayaran'),
          ),
      ],
    );
  }
}

class _UnitSummaryCard extends StatelessWidget {
  const _UnitSummaryCard({required this.unit});

  final UnitHomestay unit;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              unit.namaUnit,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.grayText,
              ),
            ),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _TinyInfoPill(
                  icon: Icons.home_work_outlined,
                  label: unit.kategori,
                ),
                _TinyInfoPill(
                  icon: Icons.people_outline,
                  label: '${unit.kapasitas} orang',
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(
                  Icons.payments_outlined,
                  size: 18,
                  color: AppColors.navy,
                ),
                const SizedBox(width: 8),
                Text(
                  '${formatRupiah(unit.hargaPerMalam)} / malam',
                  style: const TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TinyInfoPill extends StatelessWidget {
  const _TinyInfoPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.grayMuted, size: 15),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.grayText,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _BlockedUnitCard extends StatelessWidget {
  const _BlockedUnitCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: BorderSide(color: AppColors.merah.withValues(alpha: 0.35)),
      ),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.build_circle_outlined, color: AppColors.merah),
            SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Unit sedang perawatan',
                    style: TextStyle(
                      color: AppColors.merah,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Unit ini sementara tidak bisa dipesan karena sedang ada perawatan. Silakan pilih unit lain yang tersedia.',
                    style: TextStyle(color: AppColors.grayMuted),
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

class _StepHeader extends StatelessWidget {
  const _StepHeader({required this.isPaymentStep});

  final bool isPaymentStep;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.grayBorder),
      ),
      child: Row(
        children: [
          _StepPill(label: 'Tanggal', number: '1', isActive: !isPaymentStep),
          const Expanded(
            child: Divider(color: AppColors.grayBorder, thickness: 1),
          ),
          _StepPill(label: 'Pembayaran', number: '2', isActive: isPaymentStep),
        ],
      ),
    );
  }
}

class _StepPill extends StatelessWidget {
  const _StepPill({
    required this.label,
    required this.number,
    required this.isActive,
  });

  final String label;
  final String number;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? AppColors.navy : AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(
          color: isActive ? AppColors.navy : AppColors.grayBorder,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: isActive ? AppColors.card : AppColors.background,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  color: isActive ? AppColors.navy : AppColors.grayMuted,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: isActive ? AppColors.card : AppColors.grayMuted,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _DateSelectionCard extends StatelessWidget {
  const _DateSelectionCard({
    required this.checkin,
    required this.checkout,
    required this.onPickCheckin,
    required this.onPickCheckout,
  });

  final DateTime? checkin;
  final DateTime? checkout;
  final VoidCallback? onPickCheckin;
  final VoidCallback? onPickCheckout;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Pilih Tanggal Menginap',
              style: TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Tanggal akan dicek terlebih dahulu sebelum masuk pembayaran.',
              style: TextStyle(color: AppColors.grayMuted, height: 1.35),
            ),
            const SizedBox(height: 14),
            _DateButton(
              label: 'Check-in',
              value: checkin == null
                  ? 'Pilih tanggal'
                  : formatTanggal(checkin!),
              onPressed: onPickCheckin,
            ),
            const SizedBox(height: 12),
            _DateButton(
              label: 'Check-out',
              value: checkout == null
                  ? 'Pilih tanggal'
                  : formatTanggal(checkout!),
              onPressed: onPickCheckout,
            ),
          ],
        ),
      ),
    );
  }
}

class _AvailabilityStatusCard extends StatelessWidget {
  const _AvailabilityStatusCard({required this.result, required this.message});

  final AvailabilityResult result;
  final String message;

  @override
  Widget build(BuildContext context) {
    final isAvailable = result.available;
    final color = isAvailable ? AppColors.hijau : AppColors.merah;
    final title = isAvailable ? 'Tanggal tersedia' : 'Tanggal belum tersedia';
    final icon = isAvailable
        ? Icons.check_circle_outline
        : Icons.event_busy_outlined;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: color.withValues(alpha: 0.28)),
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
                    color: AppColors.grayText,
                    height: 1.4,
                  ),
                ),
                if (isAvailable) ...[
                  const SizedBox(height: 10),
                  Text(
                    'Total ${formatRupiah(result.totalTagihan)} untuk ${result.jumlahMalam} malam.',
                    style: const TextStyle(
                      color: AppColors.navy,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({
    required this.jumlahMalam,
    required this.totalTagihan,
    required this.checkin,
    required this.checkout,
  });

  final int jumlahMalam;
  final int totalTagihan;
  final DateTime? checkin;
  final DateTime? checkout;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ringkasan Tagihan',
              style: TextStyle(
                color: AppColors.grayText,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Column(
                children: [
                  _SummaryRow(
                    label: 'Check-in',
                    value: checkin == null
                        ? '-'
                        : formatTanggalPendek(checkin!),
                  ),
                  const SizedBox(height: 6),
                  _SummaryRow(
                    label: 'Check-out',
                    value: checkout == null
                        ? '-'
                        : formatTanggalPendek(checkout!),
                  ),
                  const SizedBox(height: 6),
                  _SummaryRow(
                    label: 'Jumlah malam',
                    value: '$jumlahMalam malam',
                  ),
                  const SizedBox(height: 6),
                  _SummaryRow(
                    label: 'Total tagihan',
                    value: formatRupiah(totalTagihan),
                    isStrong: true,
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

class _PaymentInstructionCard extends StatelessWidget {
  const _PaymentInstructionCard({
    required this.totalTagihan,
    required this.paymentSetting,
  });

  final int totalTagihan;
  final AsyncValue<PaymentSettingManual> paymentSetting;

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: const BorderSide(color: AppColors.grayBorder),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Instruksi Pembayaran Manual',
              style: TextStyle(
                color: AppColors.grayText,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Transfer sesuai nominal lalu unggah bukti pembayaran agar admin bisa melakukan verifikasi.',
              style: TextStyle(color: AppColors.grayMuted, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.navy.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Row(
                children: [
                  const Icon(Icons.payments_outlined, color: AppColors.navy),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      formatRupiah(totalTagihan),
                      style: const TextStyle(
                        color: AppColors.navy,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            paymentSetting.when(
              data: (setting) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  const _PaymentInfoRow(
                    label: 'Metode',
                    value: 'Transfer Bank',
                  ),
                  const SizedBox(height: 8),
                  _PaymentInfoRow(label: 'Bank', value: setting.namaBank),
                  const SizedBox(height: 8),
                  _PaymentInfoRow(
                    label: 'No. Rekening',
                    value: setting.nomorRekening,
                  ),
                  const SizedBox(height: 8),
                  _PaymentInfoRow(
                    label: 'Atas Nama',
                    value: setting.namaPemilikRekening,
                  ),
                  const SizedBox(height: 8),
                  _PaymentInfoRow(
                    label: 'Nominal',
                    value: formatRupiah(totalTagihan),
                    isStrong: true,
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Text(
                      setting.instruksiPembayaran,
                      style: const TextStyle(
                        color: AppColors.grayText,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
              loading: () => const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              ),
              error: (_, __) => const Padding(
                padding: EdgeInsets.only(top: 12),
                child: Text(
                  'Gagal memuat rekening pembayaran. Coba buka halaman ini kembali.',
                  style: TextStyle(color: AppColors.merah),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UploadProofCard extends StatelessWidget {
  const _UploadProofCard({required this.onPressed, required this.fileName});

  final VoidCallback? onPressed;
  final String? fileName;

  @override
  Widget build(BuildContext context) {
    final hasFile = fileName != null && fileName!.isNotEmpty;

    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: hasFile ? AppColors.hijau : AppColors.grayBorder,
            width: hasFile ? 1.4 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: (hasFile ? AppColors.hijau : AppColors.navy).withValues(
                  alpha: 0.1,
                ),
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Icon(
                hasFile
                    ? Icons.check_circle_outline
                    : Icons.upload_file_outlined,
                color: hasFile ? AppColors.hijau : AppColors.navy,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hasFile ? 'Bukti bayar dipilih' : 'Pilih Bukti Bayar',
                    style: const TextStyle(
                      color: AppColors.grayText,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    hasFile
                        ? fileName!
                        : 'Format JPG, PNG, atau WEBP. Maksimal 5 MB.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.grayMuted,
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: AppColors.grayMuted),
          ],
        ),
      ),
    );
  }
}

class _PaymentInfoRow extends StatelessWidget {
  const _PaymentInfoRow({
    required this.label,
    required this.value,
    this.isStrong = false,
  });

  final String label;
  final String value;
  final bool isStrong;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 110,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.grayMuted),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              color: isStrong ? AppColors.navy : AppColors.grayText,
              fontWeight: isStrong ? FontWeight.w800 : FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _DateButton extends StatelessWidget {
  const _DateButton({
    required this.label,
    required this.value,
    required this.onPressed,
  });

  final String label;
  final String value;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      child: Row(
        children: [
          const Icon(Icons.calendar_today_outlined),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label),
                Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.grayText,
                    fontWeight: FontWeight.w700,
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

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.isStrong = false,
  });

  final String label;
  final String value;
  final bool isStrong;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(color: AppColors.grayMuted),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: isStrong ? AppColors.navy : AppColors.grayText,
            fontWeight: isStrong ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _MessageBox extends StatelessWidget {
  const _MessageBox({required this.message, required this.isError});

  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final color = isError ? AppColors.merah : AppColors.hijau;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: color.withValues(alpha: 0.35)),
        color: color.withValues(alpha: 0.08),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isError ? Icons.error_outline : Icons.check_circle_outline,
            color: color,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(message, style: TextStyle(color: color)),
          ),
        ],
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
              'Gagal memuat data unit.',
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
