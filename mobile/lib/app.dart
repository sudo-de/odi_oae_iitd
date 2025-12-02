import 'package:flutter/material.dart';

import 'models/user.dart';
import 'screens/login/login_screen.dart';
import 'features/driver/dashboard/driver_dashboard_screen.dart';
import 'features/student/dashboard/student_dashboard_screen.dart';
import 'services/auth_service.dart';
import 'features/theme/theme_service.dart';

class IITDApp extends StatefulWidget {
  const IITDApp({super.key});

  @override
  State<IITDApp> createState() => _IITDAppState();
}

class _IITDAppState extends State<IITDApp> {
  final AuthService _authService = AuthService();
  final ThemeService _themeService = ThemeService();
  User? _currentUser;
  bool _isBootstrapping = true;
  ThemeMode _themeMode = ThemeMode.system;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final mode = await _themeService.loadThemeMode();
    setState(() {
      _themeMode = mode;
    });

    final user = await _authService.tryRestoreSession();
    if (!mounted) {
      return;
    }

    setState(() {
      _currentUser = user;
      _isBootstrapping = false;
    });
  }

  void _handleLoginSuccess(LoginResult result) {
    setState(() {
      _currentUser = result.user;
    });
  }

  void _handleUserUpdated(User user) {
    setState(() {
      _currentUser = user;
    });
  }

  Future<void> _handleLogout() async {
    await _authService.logout();
    if (!mounted) {
      return;
    }

    setState(() {
      _currentUser = null;
    });
  }

  Future<void> _handleThemeModeChange(ThemeMode mode) async {
    await _themeService.saveThemeMode(mode);
    if (!mounted) return;
    setState(() {
      _themeMode = mode;
    });
  }

  @override
  Widget build(BuildContext context) {
    final lightTheme = ThemeData(
      colorScheme: const ColorScheme.dark(
        brightness: Brightness.dark,
        primary: Colors.white,
        onPrimary: Colors.black,
        secondary: Colors.white,
        onSecondary: Colors.black,
        surface: Color(0xFF000000),
        onSurface: Colors.white,
        background: Color(0xFF000000),
        onBackground: Colors.white,
        error: Colors.red,
        onError: Colors.white,
      ),
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.black,
      cardColor: const Color(0xFF111111),
      useMaterial3: true,
    );

    final darkTheme = ThemeData(
      colorScheme: const ColorScheme.dark(
        brightness: Brightness.dark,
        primary: Colors.white,
        onPrimary: Colors.black,
        secondary: Colors.white,
        onSecondary: Colors.black,
        surface: Color(0xFF000000),
        onSurface: Colors.white,
        background: Color(0xFF000000),
        onBackground: Colors.white,
        error: Colors.red,
        onError: Colors.white,
      ),
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.black,
      cardColor: const Color(0xFF111111),
      useMaterial3: true,
    );

    return MaterialApp(
      title: 'IITD Mobile',
      debugShowCheckedModeBanner: false,
      theme: darkTheme,
      darkTheme: darkTheme,
      themeMode: ThemeMode.dark,
      home: _isBootstrapping
          ? const _SplashScreen()
          : _currentUser == null
              ? LoginScreen(onLoginSuccess: _handleLoginSuccess)
              : _currentUser!.role?.toLowerCase() == 'student'
                  ? StudentDashboardScreen(
                      user: _currentUser!,
                      onLogout: _handleLogout,
                      onUserUpdated: _handleUserUpdated,
                      onThemeModeChange: _handleThemeModeChange,
                      themeMode: _themeMode,
                    )
                  : DriverDashboardScreen(
                      user: _currentUser!,
                      onLogout: _handleLogout,
                      onUserUpdated: _handleUserUpdated,
                    ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading...'),
          ],
        ),
      ),
    );
  }
}

