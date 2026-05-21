import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class KatalogPage extends StatelessWidget {
  const KatalogPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog Unit'),
      ),
      body: const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'Daftar unit Wisma Binangkit akan dibangun di branch '
            'feature/mobile-katalog.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.grayMuted),
          ),
        ),
      ),
    );
  }
}
