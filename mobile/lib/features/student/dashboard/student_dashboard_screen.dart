import 'package:flutter/material.dart';

import 'package:mobile/models/user.dart';
import 'package:mobile/services/user_service.dart';
import 'package:mobile/widgets/notification_widgets.dart';
import 'package:mobile/features/student/account/setting/help_support_screen.dart';
import 'package:mobile/features/student/account/setting/notifications_screen.dart';
import 'package:mobile/features/student/account/setting/security_screen.dart';
import 'package:mobile/features/student/account/setting/theme_screen.dart';
import 'package:mobile/features/student/courses/student_courses_screen.dart';
import 'package:mobile/features/student/account/student_account_screen.dart';
import 'package:mobile/features/student/dashboard/ride_book_screen.dart';
import 'package:mobile/features/student/dashboard/activity_screen.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({
    super.key,
    required this.user,
    required this.onLogout,
    required this.onUserUpdated,
    required this.onThemeModeChange,
    required this.themeMode,
  });

  final User user;
  final Future<void> Function() onLogout;
  final ValueChanged<User> onUserUpdated;
  final ValueChanged<ThemeMode> onThemeModeChange;
  final ThemeMode themeMode;

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  late User _user;
  int _selectedTabIndex = 0;
  final UserService _userService = UserService();
  bool _isLoadingProfile = true;
  String? _profileError;
  final List<NotificationItem> _notifications = const <NotificationItem>[
    NotificationItem(
      title: 'Class rescheduled',
      description: 'Your CS201 lecture has been moved to 4:15 PM.',
      timestamp: 'Today · 10:30 AM',
    ),
    NotificationItem(
      title: 'Library due reminder',
      description: 'Return “Distributed Systems” by Friday to avoid late fees.',
      timestamp: 'Yesterday · 6:10 PM',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _user = widget.user;
    if (_needsRefresh(widget.user)) {
      _loadProfile();
    } else {
      _isLoadingProfile = false;
    }
  }

  @override
  void didUpdateWidget(StudentDashboardScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.user.id != widget.user.id || _needsRefresh(widget.user)) {
      _user = widget.user;
      if (_needsRefresh(widget.user)) {
        _loadProfile();
      } else {
        setState(() {
          _isLoadingProfile = false;
        });
      }
    }
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoadingProfile = true;
      _profileError = null;
    });

    try {
      final profile = await _userService.fetchProfile();
      if (!mounted) {
        return;
      }

      setState(() {
        _user = profile;
        _isLoadingProfile = false;
      });

      widget.onUserUpdated(profile);
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _profileError = error.toString();
        _isLoadingProfile = false;
      });
    }
  }

  Widget _buildHome(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome back, ${_user.name.isEmpty ? 'Student' : _user.name}! 🎓',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Text(
            'Track your schedule, stay on top of coursework, and manage your campus information in one place.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Card(
            color: theme.colorScheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Icon(Icons.event_available, color: theme.colorScheme.onPrimaryContainer),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Your upcoming classes will appear here. Sync with the academic calendar for real-time updates.',
                      style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onPrimaryContainer),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: theme.colorScheme.primary,
                        child: Icon(
                          Icons.directions_car_outlined,
                          color: theme.colorScheme.onPrimary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Need a campus ride?',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Book a shuttle, electric cart, or cab for your next trip across campus.',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const RideBookScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Book a ride'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: theme.colorScheme.secondary,
                        child: Icon(
                          Icons.timeline_outlined,
                          color: theme.colorScheme.onSecondary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'See your activity timeline',
                              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Review past ride requests, course syncs, and help desk updates in one place.',
                              style: theme.textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const StudentActivityScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.open_in_new),
                    label: const Text('Open activity history'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccount(BuildContext context) => StudentAccountScreen(user: _user);

  bool _needsRefresh(User user) {
    final photoMissing = user.profilePhoto == null || user.profilePhoto!.data.isEmpty;
    return user.programme == null || user.department == null || user.entryNumber == null || photoMissing;
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      _buildHome(context),
      const StudentCoursesScreen(),
      _buildAccount(context),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _selectedTabIndex == 0
              ? 'Dashboard'
              : _selectedTabIndex == 1
                  ? 'Courses'
                  : 'Account',
        ),
        actions: [
          IconButton(
            icon: NotificationBell(count: _notifications.length),
            onPressed: _showNotificationsSheet,
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _showSettingsSheet,
            tooltip: 'Settings',
          ),
        ],
      ),
      body: _isLoadingProfile
          ? const Center(child: CircularProgressIndicator())
          : _profileError != null
              ? _ErrorState(message: _profileError!, onRetry: _loadProfile)
              : pages[_selectedTabIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedTabIndex,
        onTap: (index) {
          setState(() {
            _selectedTabIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.menu_book), label: 'Courses'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.red)),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

extension on _StudentDashboardScreenState {
  void _showNotificationsSheet() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Notifications',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (_notifications.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24.0),
                    child: Center(
                      child: Text(
                        'You’re all caught up! No new notifications.',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  )
                else
                  ..._notifications.map((notification) => Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: NotificationCard(notification: notification),
                      )),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showSettingsSheet() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  subtitle: const Text('Manage push, email, and SMS alerts'),
                  onTap: () {
                    final navigator = Navigator.of(context);
                    navigator.pop();
                    navigator.push(
                      MaterialPageRoute(
                        builder: (_) => const StudentNotificationsScreen(),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.brightness_6_outlined),
                  title: const Text('Theme'),
                  subtitle: const Text('Light, dark, or system default'),
                  onTap: () {
                    Navigator.of(context).pop();
                    _showThemeSheet();
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.lock_outline),
                  title: const Text('Security'),
                  subtitle: const Text('Manage password and 2FA'),
                  onTap: () {
                    final navigator = Navigator.of(context);
                    navigator.pop();
                    navigator.push(
                      MaterialPageRoute(
                        builder: (_) => const StudentSecurityScreen(),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.help_outline),
                  title: const Text('Help & Support'),
                  subtitle: const Text('FAQs and contact information'),
                  onTap: () {
                    final navigator = Navigator.of(context);
                    navigator.pop();
                    navigator.push(
                      MaterialPageRoute(
                        builder: (_) => const StudentHelpSupportScreen(),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.logout),
                  title: const Text('Log out'),
                  onTap: () async {
                    Navigator.of(context).pop();
                    await widget.onLogout();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showThemeSheet() {
    showModalBottomSheet<ThemeMode>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StudentThemeSheet(
        selectedMode: widget.themeMode,
      ),
    ).then((selectedMode) {
      if (selectedMode != null) {
        widget.onThemeModeChange(selectedMode);
      }
    });
  }
}

