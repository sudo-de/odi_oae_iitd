import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService {
  static const String _key = 'theme_mode';

  Future<ThemeMode> loadThemeMode() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString(_key);
    if (value == 'light') {
      return ThemeMode.light;
    }
    if (value == 'dark') {
      return ThemeMode.dark;
    }
    return ThemeMode.system;
  }

  Future<void> saveThemeMode(ThemeMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    final value = _serialize(mode);
    await prefs.setString(_key, value);
  }

  String _serialize(ThemeMode mode) {
    if (mode == ThemeMode.light) {
      return 'light';
    }
    if (mode == ThemeMode.dark) {
      return 'dark';
    }
    return 'system';
  }
}
