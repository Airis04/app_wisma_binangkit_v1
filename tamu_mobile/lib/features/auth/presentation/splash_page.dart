import 'package:flutter/material.dart';

import '../../../config/theme.dart';
import '../../../shared/widgets/wisma_brand_mark.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(28),
          child: Column(
            children: [
              Spacer(),
              WismaBrandMark(),
              SizedBox(height: 18),
              Text(
                'Pengalaman menginap yang nyaman di Pangandaran.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.grayMuted, height: 1.45),
              ),
              Spacer(),
              SizedBox(
                width: 26,
                height: 26,
                child: CircularProgressIndicator(strokeWidth: 2.4),
              ),
              SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
