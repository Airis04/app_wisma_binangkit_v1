import 'package:flutter/material.dart';

/// Palet warna terkunci sesuai AGENTS.md.
/// Dilarang tambah warna baru di luar palet ini tanpa persetujuan.
class AppColors {
  AppColors._();

  static const navy = Color(0xFF1E3A8A);
  static const navyHover = Color(0xFF162D6E);
  static const background = Color(0xFFF9FAFB);
  static const card = Color(0xFFFFFFFF);

  static const hijau = Color(0xFF10B981);
  static const merah = Color(0xFFEF4444);
  static const biruTerang = Color(0xFF3B82F6);

  static const grayBorder = Color(0xFFE5E7EB);
  static const grayMuted = Color(0xFF6B7280);
  static const grayText = Color(0xFF111827);
}

class AppRadius {
  AppRadius._();

  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
}

class AppSpacing {
  AppSpacing._();

  static const page = 16.0;
  static const section = 18.0;
}

ThemeData buildAppTheme() {
  const primary = AppColors.navy;

  final colorScheme = ColorScheme.fromSeed(
    seedColor: primary,
    primary: primary,
    surface: AppColors.card,
    error: AppColors.merah,
    brightness: Brightness.light,
  );

  return ThemeData(
    colorScheme: colorScheme,
    scaffoldBackgroundColor: AppColors.background,
    useMaterial3: true,
    fontFamily: 'Roboto',
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.background,
      foregroundColor: AppColors.grayText,
      elevation: 0,
      centerTitle: false,
      surfaceTintColor: AppColors.background,
      titleTextStyle: TextStyle(
        color: AppColors.grayText,
        fontSize: 20,
        fontWeight: FontWeight.w800,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.navy,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.navy,
        side: const BorderSide(color: AppColors.navy),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.grayBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.grayBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.navy, width: 1.5),
      ),
    ),
    cardTheme: const CardThemeData(
      color: AppColors.card,
      elevation: 1,
      surfaceTintColor: AppColors.card,
      margin: EdgeInsets.zero,
      shadowColor: Color(0x14000000),
    ),
  );
}
