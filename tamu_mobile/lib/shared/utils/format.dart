import 'package:intl/intl.dart';

final NumberFormat _rupiahFormatter = NumberFormat.currency(
  locale: 'id_ID',
  symbol: 'Rp ',
  decimalDigits: 0,
);

final DateFormat _tanggalFormatter = DateFormat('d MMMM yyyy', 'id_ID');
final DateFormat _tanggalPendekFormatter = DateFormat('d MMM yyyy', 'id_ID');

String formatRupiah(num value) => _rupiahFormatter.format(value);

String formatTanggal(DateTime tanggal) => _tanggalFormatter.format(tanggal);

String formatTanggalPendek(DateTime tanggal) =>
    _tanggalPendekFormatter.format(tanggal);
