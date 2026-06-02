import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

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
    this.buktiBayar,
  });

  final String idReservasi;
  final String idUnit;
  final DateTime tglCheckin;
  final DateTime tglCheckout;
  final int totalTagihan;
  final String statusPesanan;
  final String? buktiBayar;

  factory ReservationMobile.fromJson(Map<String, dynamic> json) {
    return ReservationMobile(
      idReservasi: json['id_reservasi'] as String,
      idUnit: json['id_unit'] as String,
      tglCheckin: DateTime.parse(json['tgl_checkin'] as String),
      tglCheckout: DateTime.parse(json['tgl_checkout'] as String),
      totalTagihan: json['total_tagihan'] as int,
      statusPesanan: json['status_pesanan'] as String,
      buktiBayar: json['bukti_bayar'] as String?,
    );
  }
}

class ReservationRepository {
  ReservationRepository(this._dio);

  final Dio _dio;

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

  Map<String, dynamic> _readData(Map<String, dynamic>? body) {
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

    final data = body['data'];
    if (data is! Map<String, dynamic>) {
      throw ApiException(message: 'Format reservasi tidak valid.');
    }

    return data;
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
