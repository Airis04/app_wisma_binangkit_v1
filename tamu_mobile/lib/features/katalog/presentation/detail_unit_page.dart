import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class DetailUnitPage extends StatelessWidget {
  const DetailUnitPage({required this.idUnit, super.key});

  final String idUnit;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Unit'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Unit: $idUnit',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.navy,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Galeri foto, fasilitas, dan tombol pesan akan dibangun di '
                'branch feature/mobile-katalog.',
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
