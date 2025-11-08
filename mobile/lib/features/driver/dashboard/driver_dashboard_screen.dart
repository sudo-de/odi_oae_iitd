import 'package:flutter/material.dart';

import 'package:mobile/models/user.dart';
import 'package:mobile/widgets/notification_widgets.dart';
import 'driver_account_screen.dart';
import 'driver_activity_screen.dart';
import 'driver_qr_screen.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({
    super.key,
    required this.user,
    required this.onLogout,
    required this.onUserUpdated,
  });

  final User user;
  final Future<void> Function() onLogout;
  final ValueChanged<User> onUserUpdated;

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  late User _user;
  int _selectedTab = 0;

  final List<NotificationItem> _notifications = const <NotificationItem>[
    NotificationItem(
      title: 'Shift confirmed',
      description: 'You are assigned to Shuttle Route A at 6:30 PM.',
      timestamp: 'Today · 8:45 AM',
    ),
    NotificationItem(
      title: 'Safety reminder',
      description: 'Seatbelt checks are mandatory before departure.',
      timestamp: 'Yesterday · 7:10 PM',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _user = widget.user;
  }

  @override
  void didUpdateWidget(covariant DriverDashboardScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.user.id != widget.user.id) {
      _user = widget.user;
    }
  }

  Future<void> _openDriverQr() async {
    final updatedUser = await Navigator.of(context).push<User>(
      MaterialPageRoute(
        builder: (_) => DriverQrScreen(user: _user),
      ),
    );

    if (!mounted || updatedUser == null) {
      return;
    }

    setState(() {
      _user = updatedUser;
    });

    widget.onUserUpdated(updatedUser);
  }

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
                        'No new alerts. Drive safe!',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  )
                else
                  ..._notifications.map(
                    (notification) => Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: NotificationCard(notification: notification),
                    ),
                  ),
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
                Text(
                  'Settings',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.brightness_6_outlined),
                  title: const Text('Theme'),
                  subtitle: const Text('Light, dark, or system default'),
                  onTap: () {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Theme settings coming soon.')),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.lock_outline),
                  title: const Text('Security'),
                  subtitle: const Text('Manage password and 2FA'),
                  onTap: () {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Security settings coming soon.')),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.help_outline),
                  title: const Text('Help & Support'),
                  subtitle: const Text('FAQs and contact information'),
                  onTap: () {
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Help center coming soon.')),
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

  Widget _buildHome(BuildContext context) {
    final theme = Theme.of(context);
    final infoCards = <_InfoCardData>[
      _InfoCardData(Icons.account_circle_outlined, 'Name', _user.name.isEmpty ? '—' : _user.name),
      _InfoCardData(Icons.email_outlined, 'Email', _user.email.isEmpty ? '—' : _user.email),
      _InfoCardData(Icons.assignment_ind_outlined, 'Role', (_user.role ?? '—').isEmpty ? '—' : _user.role!),
      _InfoCardData(Icons.badge_outlined, 'User ID', _user.id.isEmpty ? '—' : _user.id),
    ];

    final highlightItems = const <_HighlightData>[
      _HighlightData(Icons.directions_bus_outlined, 'Next route', 'Route A · 6:30 PM'),
      _HighlightData(Icons.people_outline, 'Passengers', '24 registered passengers'),
      _HighlightData(Icons.timelapse_outlined, 'Shift length', 'Ends at 9:30 PM'),
    ];

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, ${_user.name.isEmpty ? 'Driver' : _user.name}! 👋',
                      style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Keep your schedule on track and manage today’s shifts.',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
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
          const SizedBox(height: 24),
          Card(
            elevation: 1,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: infoCards
                    .map((card) => _InfoRow(icon: card.icon, label: card.label, value: card.value))
                    .toList(),
              ),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _openDriverQr,
            icon: const Icon(Icons.qr_code),
            label: const Text('View Driver QR Code'),
          ),
          const SizedBox(height: 24),
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Today’s highlights',
                      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    for (int i = 0; i < highlightItems.length; i++) ...[
                      _HighlightRow(
                        icon: highlightItems[i].icon,
                        label: highlightItems[i].label,
                        value: highlightItems[i].value,
                      ),
                      if (i != highlightItems.length - 1) const Divider(),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivity() => const DriverActivityScreen();

  Widget _buildAccount() => DriverAccountScreen(
        user: _user,
        onLogout: widget.onLogout,
      );

  @override
  Widget build(BuildContext context) {
    final tabs = [
      _buildHome(context),
      _buildActivity(),
      _buildAccount(),
    ];

    return Scaffold(
      body: SafeArea(child: tabs[_selectedTab]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedTab,
        onTap: (index) {
          setState(() {
            _selectedTab = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.access_time), label: 'Activity'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Icon(icon, color: theme.colorScheme.primary),
          const SizedBox(width: 12),
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyLarge,
            ),
          ),
        ],
      ),
    );
  }
}

class _HighlightRow extends StatelessWidget {
  const _HighlightRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, color: theme.colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: theme.textTheme.bodyMedium),
              Text(
                value,
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoCardData {
  const _InfoCardData(this.icon, this.label, this.value);

  final IconData icon;
  final String label;
  final String value;
}

class _HighlightData {
  const _HighlightData(this.icon, this.label, this.value);

  final IconData icon;
  final String label;
  final String value;
}

