import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../config/env.dart';
import '../../../shared/api/api_exception.dart';
import '../../../shared/api/dio_client.dart';

class UnitFoto {
  const UnitFoto({
    required this.idFoto,
    required this.filePath,
    required this.urutan,
  });

  final int idFoto;
  final String filePath;
  final int urutan;

  factory UnitFoto.fromJson(Map<String, dynamic> json) {
    return UnitFoto(
      idFoto: json['id_foto'] as int,
      filePath: json['file_path'] as String,
      urutan: json['urutan'] as int,
    );
  }

  String get imageUrl => toPublicUrl(filePath);
}

class UnitHomestay {
  const UnitHomestay({
    required this.idUnit,
    required this.namaUnit,
    required this.kategori,
    required this.hargaPerMalam,
    required this.kapasitas,
    required this.fasilitas,
    required this.statusUnit,
    this.fotoUnit,
    this.fotos = const [],
  });

  final String idUnit;
  final String namaUnit;
  final String kategori;
  final int hargaPerMalam;
  final int kapasitas;
  final List<String> fasilitas;
  final String? fotoUnit;
  final String statusUnit;
  final List<UnitFoto> fotos;

  factory UnitHomestay.fromJson(Map<String, dynamic> json) {
    final fasilitasJson = json['fasilitas'];
    final fotosJson = json['fotos'];

    return UnitHomestay(
      idUnit: json['id_unit'] as String,
      namaUnit: json['nama_unit'] as String,
      kategori: json['kategori'] as String,
      hargaPerMalam: json['harga_per_malam'] as int,
      kapasitas: json['kapasitas'] as int,
      fasilitas: fasilitasJson is List
          ? fasilitasJson.whereType<String>().toList()
          : const [],
      fotoUnit: json['foto_unit'] as String?,
      statusUnit: json['status_unit'] as String,
      fotos: fotosJson is List
          ? fotosJson
                .whereType<Map<String, dynamic>>()
                .map(UnitFoto.fromJson)
                .toList()
          : const [],
    );
  }

  String? get coverUrl {
    final cover = fotoUnit;
    if (cover != null && cover.isNotEmpty) return toPublicUrl(cover);
    if (fotos.isNotEmpty) return fotos.first.imageUrl;
    return null;
  }

  bool get bisaDipesan => statusUnit != 'Perawatan';
}

String toPublicUrl(String path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  final origin = AppEnv.apiBaseUrl.replaceFirst(RegExp(r'/api/?$'), '');
  if (path.startsWith('/')) return '$origin$path';
  return '$origin/$path';
}

class UnitRepository {
  UnitRepository(this._dio);

  final Dio _dio;

  Future<List<UnitHomestay>> fetchUnits() async {
    final response = await _dio.get<Map<String, dynamic>>('/mobile/units');
    final data = _readData(response.data);

    if (data is! List) {
      throw ApiException(message: 'Format daftar unit tidak valid.');
    }

    return data
        .whereType<Map<String, dynamic>>()
        .map(UnitHomestay.fromJson)
        .toList();
  }

  Future<UnitHomestay> fetchUnit(String idUnit) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/mobile/units/$idUnit',
    );
    final data = _readData(response.data);

    if (data is! Map<String, dynamic>) {
      throw ApiException(message: 'Format detail unit tidak valid.');
    }

    return UnitHomestay.fromJson(data);
  }

  Object? _readData(Map<String, dynamic>? body) {
    if (body == null) {
      throw ApiException(message: 'Respons server kosong.');
    }

    if (body['ok'] != true) {
      final message = body['message'];
      throw ApiException(
        message: message is String ? message : 'Permintaan gagal diproses.',
      );
    }

    return body['data'];
  }
}

final unitRepositoryProvider = Provider<UnitRepository>((ref) {
  return UnitRepository(ref.watch(dioClientProvider));
});

final unitListProvider = FutureProvider<List<UnitHomestay>>((ref) {
  return ref.watch(unitRepositoryProvider).fetchUnits();
});

final unitDetailProvider = FutureProvider.family<UnitHomestay, String>((
  ref,
  idUnit,
) {
  return ref.watch(unitRepositoryProvider).fetchUnit(idUnit);
});
