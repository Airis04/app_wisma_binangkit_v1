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
  DateTime? _checkin;
  DateTime? _checkout;
  AvailabilityResult? _availability;
  XFile? _buktiBayar;
  bool _isPaymentStep = false;
  bool _isCheckingAvailability = false;
  bool _isSubmitting = false;
  String? _errorMessage;
  String? _successMessage;

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
          _errorMessage = result.message;
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
      setState(() {
        _successMessage =
            'Reservasi ${reservasi.idReservasi} dikirim dan menunggu konfirmasi pemilik.';
      });
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

  @override
  Widget build(BuildContext context) {
    final unit = ref.watch(unitDetailProvider(widget.idUnit));

    return Scaffold(
      appBar: AppBar(title: const Text('Pesan Unit')),
      body: unit.when(
        data: (data) => _ReservasiForm(
          unit: data,
          checkin: _checkin,
          checkout: _checkout,
          availability: _availability,
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

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
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
                Text(
                  '${unit.kategori} • Kapasitas ${unit.kapasitas} orang',
                  style: const TextStyle(color: AppColors.grayMuted),
                ),
                const SizedBox(height: 10),
                Text(
                  '${formatRupiah(unit.hargaPerMalam)} / malam',
                  style: const TextStyle(
                    color: AppColors.navy,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        _StepHeader(isPaymentStep: isPaymentStep),
        const SizedBox(height: 16),
        if (!isPaymentStep) ...[
          _DateButton(
            label: 'Check-in',
            value: checkin == null ? 'Pilih tanggal' : formatTanggal(checkin!),
            onPressed: isBusy ? null : onPickCheckin,
          ),
          const SizedBox(height: 12),
          _DateButton(
            label: 'Check-out',
            value: checkout == null
                ? 'Pilih tanggal'
                : formatTanggal(checkout!),
            onPressed: isBusy ? null : onPickCheckout,
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
        if (!isPaymentStep && isAvailable) ...[
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: isBusy ? null : onContinueToPayment,
            child: const Text('Lanjutkan'),
          ),
        ],
        if (isPaymentStep) ...[
          const SizedBox(height: 16),
          _PaymentInstructionCard(totalTagihan: totalTagihan),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: isBusy ? null : onPickBukti,
            icon: const Icon(Icons.upload_file_outlined),
            label: Text(
              buktiBayar == null
                  ? 'Pilih Bukti Bayar'
                  : 'Bukti Dipilih: ${buktiBayar!.name}',
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: isBusy ? null : onBackToDateStep,
            icon: const Icon(Icons.arrow_back_outlined),
            label: const Text('Ubah Tanggal'),
          ),
        ],
        if (errorMessage != null) ...[
          const SizedBox(height: 14),
          _MessageBox(message: errorMessage!, isError: true),
        ],
        if (successMessage != null) ...[
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

class _StepHeader extends StatelessWidget {
  const _StepHeader({required this.isPaymentStep});

  final bool isPaymentStep;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _StepPill(label: 'Tanggal', isActive: !isPaymentStep),
        const Expanded(
          child: Divider(color: AppColors.grayBorder, thickness: 1),
        ),
        _StepPill(label: 'Pembayaran', isActive: isPaymentStep),
      ],
    );
  }
}

class _StepPill extends StatelessWidget {
  const _StepPill({required this.label, required this.isActive});

  final String label;
  final bool isActive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? AppColors.navy : AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isActive ? AppColors.navy : AppColors.grayBorder,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isActive ? AppColors.card : AppColors.grayMuted,
          fontWeight: FontWeight.w800,
        ),
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
        borderRadius: BorderRadius.circular(8),
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
            _SummaryRow(
              label: 'Check-in',
              value: checkin == null ? '-' : formatTanggalPendek(checkin!),
            ),
            const SizedBox(height: 6),
            _SummaryRow(
              label: 'Check-out',
              value: checkout == null ? '-' : formatTanggalPendek(checkout!),
            ),
            const SizedBox(height: 6),
            _SummaryRow(label: 'Jumlah malam', value: '$jumlahMalam malam'),
            const SizedBox(height: 6),
            _SummaryRow(
              label: 'Total tagihan',
              value: formatRupiah(totalTagihan),
              isStrong: true,
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentInstructionCard extends StatelessWidget {
  const _PaymentInstructionCard({required this.totalTagihan});

  final int totalTagihan;

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
              'Instruksi Pembayaran Manual',
              style: TextStyle(
                color: AppColors.grayText,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            const _PaymentInfoRow(label: 'Metode', value: 'Transfer Bank'),
            const SizedBox(height: 8),
            const _PaymentInfoRow(label: 'Bank', value: 'BCA'),
            const SizedBox(height: 8),
            const _PaymentInfoRow(label: 'No. Rekening', value: '1234567890'),
            const SizedBox(height: 8),
            const _PaymentInfoRow(label: 'Atas Nama', value: 'Wisma Binangkit'),
            const SizedBox(height: 8),
            _PaymentInfoRow(
              label: 'Nominal',
              value: formatRupiah(totalTagihan),
              isStrong: true,
            ),
            const SizedBox(height: 12),
            const Text(
              'Setelah transfer, unggah bukti pembayaran. Pemilik akan mengecek manual lewat Dasbor dan menyetujui pesanan.',
              style: TextStyle(color: AppColors.grayMuted),
            ),
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
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color),
        color: color.withValues(alpha: 0.08),
      ),
      child: Text(message, style: TextStyle(color: color)),
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
