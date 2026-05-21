import 'package:flutter/material.dart';

import '../../../config/theme.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.home_work_rounded,
                  size: 64, color: AppColors.navy),
              const SizedBox(height: 16),
              const Text(
                'Wisma Binangkit',
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.navy),
              ),
              const SizedBox(height: 8),
              const Text(
                'Masuk untuk memesan unit homestay favorit Anda.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.grayMuted),
              ),
              const SizedBox(height: 32),
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Center(
                    child: Text(
                      'Form login akan dibangun di branch feature/mobile-auth.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: AppColors.grayMuted),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
