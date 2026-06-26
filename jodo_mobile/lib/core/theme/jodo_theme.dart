import 'package:flutter/material.dart';

class JodoTheme {
  // Custom design system hex values
  static const Color primarySage = Color(0xFF5E7A73);
  static const Color backgroundCream = Color(0xFFFCFBF8);
  static const Color accentGold = Color(0xFFCFA56A);
  static const Color textCharcoal = Color(0xFF2D3436);
  static const Color textMuted = Color(0xFF6E7577);
  static const Color successOlive = Color(0xFF7BA37A);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0x265E7A73); // 15% opacity primarySage

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: backgroundCream,
      colorScheme: const ColorScheme.light(
        primary: primarySage,
        secondary: accentGold,
        surface: surfaceWhite,
        error: Colors.redAccent,
        onPrimary: backgroundCream,
        onSecondary: textCharcoal,
        onSurface: textCharcoal,
      ),
      fontFamily: 'Inter',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w800,
          fontSize: 32.0,
          color: primarySage,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w700,
          fontSize: 24.0,
          color: primarySage,
        ),
        titleLarge: TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w700,
          fontSize: 18.0,
          color: textCharcoal,
        ),
        bodyLarge: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.w500,
          fontSize: 16.0,
          color: textCharcoal,
        ),
        bodyMedium: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.w400,
          fontSize: 14.0,
          color: textCharcoal,
        ),
        labelSmall: TextStyle(
          fontFamily: 'Inter',
          fontWeight: FontWeight.w600,
          fontSize: 11.0,
          color: textMuted,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceWhite,
        elevation: 0.5,
        iconTheme: IconThemeData(color: primarySage),
        titleTextStyle: TextStyle(
          fontFamily: 'Outfit',
          fontWeight: FontWeight.w700,
          fontSize: 20.0,
          color: primarySage,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: borderLight, width: 1.0),
          borderRadius: BorderRadius.circular(12.0),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceWhite,
        selectedItemColor: primarySage,
        unselectedItemColor: textMuted,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
