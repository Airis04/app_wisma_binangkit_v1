import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/env.dart';
import '../../../shared/api/api_exception.dart';
import '../../../shared/api/dio_client.dart';

class ReservationMobile {
  const ReservationMobile({
    required this.idReservasi,
    required this.idUnit,
    required this.tglCheckin,
    required this.tglCheckout,
    required this.totalTagihan,
    required this.statusPesanan,
    required this.createdAt,
    this.buktiBayar,
    this.namaUnit,
    this.kategoriUnit,
    this.hargaPerMalam,
    this.kapasitasUnit,
  });

  final String idReservasi;
  final String idUnit;
  final DateTime tglCheckin;
  final DateTime tglCheckout;
  final int totalTagihan;
  final String statusPesanan;
  final DateTime createdAt;
  final String? buktiBayar;
  final String? namaUnit;
  final String? kategoriUnit;
  final int? hargaPerMalam;
  final int? kapasitasUnit;

  factory ReservationMobile.fromJson(Map<String, dynamic> json) {
    final unitJson = json['unit'];

    return ReservationMobile(
      idReservasi: json['id_reservasi'] as String,
      idUnit: json['id_unit'] as String,
      tglCheckin: DateTime.parse(json['tgl_checkin'] as String),
      tglCheckout: DateTime.parse(json['tgl_checkout'] as String),
      totalTagihan: json['total_tagihan'] as int,
      statusPesanan: json['status_pesanan'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      buktiBayar: json['bukti_bayar'] as String?,
      namaUnit: unitJson is Map<String, dynamic>
          ? unitJson['nama_unit'] as String?
          : null,
      kategoriUnit: unitJson is Map<String, dynamic>
          ? unitJson['kategori'] as String?
          : null,
      hargaPerMalam: unitJson is Map<String, dynamic>
          ? unitJson['harga_per_malam'] as int?
          : null,
      kapasitasUnit: unitJson is Map<String, dynamic>
          ? unitJson['kapasitas'] as int?
          : null,
    );
  }

  int get jumlahMalam => tglCheckout.difference(tglCheckin).inDays;

  String? get buktiBayarUrl {
    final path = buktiBayar;
    if (path == null || path.isEmpty) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    final origin = AppEnv.apiBaseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    if (path.startsWith('/')) return '$origin$path';
    return '$origin/$path';
  }
}

class AvailabilityResult {
  const AvailabilityResult({
    required this.available,
    required this.message,
    required this.jumlahMalam,
    required this.totalTagihan,
    this.reason,
    this.overlap,
  });

  final bool available;
  final String message;
  final int jumlahMalam;
  final int totalTagihan;
  final String? reason;
  final ReservationOverlap? overlap;

  factory AvailabilityResult.fromJson(Map<String, dynamic> json) {
    final overlapJson = json['overlap'];

    return AvailabilityResult(
      available: json['available'] == true,
      message: json['message'] as String? ?? 'Status ketersediaan diterima.',
      jumlahMalam: json['jumlah_malam'] as int? ?? 0,
      totalTagihan: json['total_tagihan'] as int? ?? 0,
      reason: json['reason'] as String?,
      overlap: overlapJson is Map<String, dynamic>
          ? ReservationOverlap.fromJson(overlapJson)
          : null,
    );
  }
}

class ReservationOverlap {
  const ReservationOverlap({
    required this.idReservasi,
    required this.tglCheckin,
    required this.tglCheckout,
    required this.statusPesanan,
  });

  final String idReservasi;
  final DateTime tglCheckin;
  final DateTime tglCheckout;
  final String statusPesanan;

  factory ReservationOverlap.fromJson(Map<String, dynamic> json) {
    return ReservationOverlap(
      idReservasi: json['id_reservasi'] as String,
      tglCheckin: DateTime.parse(json['tgl_checkin'] as String),
      tglCheckout: DateTime.parse(json['tgl_checkout'] as String),
      statusPesanan: json['status_pesanan'] as String,
    );
  }
}

class PaymentSettingManual {
  const PaymentSettingManual({
    required this.namaBank,
    required this.nomorRekening,
    required this.namaPemilikRekening,
    required this.instruksiPembayaran,
  });

  final String namaBank;
  final String nomorRekening;
  final String namaPemilikRekening;
  final String instruksiPembayaran;

  factory PaymentSettingManual.fromJson(Map<String, dynamic> json) {
    return PaymentSettingManual(
      namaBank: json['nama_bank'] as String,
      nomorRekening: json['nomor_rekening'] as String,
      namaPemilikRekening: json['nama_pemilik_rekening'] as String,
      instruksiPembayaran: json['instruksi_pembayaran'] as String,
    );
  }
}

class ReservationRepository {
  ReservationRepository(this._dio);

  final Dio _dio;

  Future<PaymentSettingManual> fetchPaymentSetting() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/mobile/payment-settings',
    );

    return PaymentSettingManual.fromJson(_readData(response.data));
  }

  Future<AvailabilityResult> checkAvailability({
    required String idUnit,
    required DateTime checkin,
    required DateTime checkout,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/reservations/check-availability',
      data: {
        'id_unit': idUnit,
        'tgl_checkin': _dateOnly(checkin),
        'tgl_checkout': _dateOnly(checkout),
      },
    );

    return AvailabilityResult.fromJson(_readData(response.data));
  }

  Future<ReservationMobile> createReservation({
    required String idUnit,
    required DateTime checkin,
    required DateTime checkout,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/reservations',
      data: {
        'id_unit': idUnit,
        'tgl_checkin': _dateOnly(checkin),
        'tgl_checkout': _dateOnly(checkout),
      },
    );

    return ReservationMobile.fromJson(_readData(response.data));
  }

  Future<ReservationMobile> uploadBuktiBayar({
    required String idReservasi,
    required String filePath,
  }) async {
    final formData = FormData.fromMap({
      'bukti_bayar': await MultipartFile.fromFile(filePath),
    });

    final response = await _dio.post<Map<String, dynamic>>(
      '/mobile/reservations/$idReservasi/bukti-bayar',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );

    return ReservationMobile.fromJson(_readData(response.data));
  }

  Future<List<ReservationMobile>> fetchMyReservations() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/mobile/reservations/me',
    );
    final data = _readRawData(response.data);

    if (data is! List) {
      throw ApiException(message: 'Format riwayat reservasi tidak valid.');
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(ReservationMobile.fromJson)
        .toList();
  }

  Future<ReservationMobile> fetchReservation(String idReservasi) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/mobile/reservations/$idReservasi',
    );

    return ReservationMobile.fromJson(_readData(response.data));
  }

  Map<String, dynamic> _readData(Map<String, dynamic>? body) {
    final data = _readRawData(body);

    if (data is! Map<String, dynamic>) {
      throw ApiException(message: 'Format reservasi tidak valid.');
    }

    return data;
  }

  Object? _readRawData(Map<String, dynamic>? body) {
    if (body == null) {
      throw ApiException(message: 'Respons server kosong.');
    }

    if (body['ok'] != true) {
      final message = body['message'];
      throw ApiException(
        message: message is String ? message : 'Permintaan gagal diproses.',
        statusCode: null,
      );
    }

    return body['data'];
  }
}

String _dateOnly(DateTime date) {
  final year = date.year.toString().padLeft(4, '0');
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '$year-$month-$day';
}

final reservationRepositoryProvider = Provider<ReservationRepository>((ref) {
  return ReservationRepository(ref.watch(dioClientProvider));
});

final myReservationsProvider = FutureProvider<List<ReservationMobile>>((ref) {
  return ref.watch(reservationRepositoryProvider).fetchMyReservations();
});

final reservationDetailProvider =
    FutureProvider.family<ReservationMobile, String>((ref, idReservasi) {
      return ref
          .watch(reservationRepositoryProvider)
          .fetchReservation(idReservasi);
    });

final paymentSettingProvider = FutureProvider<PaymentSettingManual>((ref) {
  return ref.watch(reservationRepositoryProvider).fetchPaymentSetting();
});
