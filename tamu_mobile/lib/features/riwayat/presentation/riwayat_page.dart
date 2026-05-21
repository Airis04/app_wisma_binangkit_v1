import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class RiwayatPage extends StatelessWidget {
  const RiwayatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Pesanan'),
      ),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Daftar pesanan dengan status terkini akan dibangun di branch '
            'feature/mobile-riwayat.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.grayMuted),
          ),
        ),
      ),
    );
  }
}
