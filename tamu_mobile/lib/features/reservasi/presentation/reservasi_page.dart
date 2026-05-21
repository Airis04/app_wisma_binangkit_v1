import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class ReservasiPage extends StatelessWidget {
  const ReservasiPage({required this.idUnit, super.key});

  final String idUnit;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pesan Unit'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Reservasi untuk $idUnit',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.navy,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Form pilih tanggal, kalkulasi tagihan, dan upload bukti '
                'transfer akan dibangun di branch feature/mobile-reservasi.',
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
