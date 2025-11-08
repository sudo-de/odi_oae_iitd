import 'package:flutter/material.dart';

import 'package:mobile/models/user.dart';
import 'package:mobile/widgets/notification_widgets.dart';

class DriverAccountScreen extends StatefulWidget {
  const DriverAccountScreen({super.key, required this.user, this.onLogout});

  final User user;
  final Future<void> Function()? onLogout;

  @override
  State<DriverAccountScreen> createState() => _DriverAccountScreenState();
}

class _DriverAccountScreenState extends State<DriverAccountScreen>
    with _DriverAccountScreenStateHelper {
  @override
  Future<void> get onLogoutFuture => widget.onLogout?.call() ?? Future.value();
  final List<NotificationItem> _notifications = const [
    NotificationItem(
      title: 'Shift confirmed',
      description: 'You are assigned to Shuttle Route A at 6:30 PM.',
      timestamp: 'Today · 8:45 AM',
    ),
    NotificationItem(
      title: 'Vehicle check reminder',
      description: 'Complete the weekly vehicle inspection checklist.',
      timestamp: 'Yesterday · 5:20 PM',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final sections = _buildSections().where((section) => section.rows.isNotEmpty).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account'),
        actions: [
          IconButton(
            icon: NotificationBell(count: _notifications.length),
            onPressed: () => _showNotificationsSheet(context),
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _showSettingsSheet(context),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Column(
                      children: [
                        _DriverAvatar(photo: widget.user.profilePhoto),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              widget.user.name.isEmpty ? 'Driver' : widget.user.name,
                              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.verified, color: Colors.green, size: 20),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.user.email,
                          style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Driver Account',
                    style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Manage your profile details and contact information. Updates will sync with the operations team.',
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                  for (int i = 0; i < sections.length; i++) ...[
                    _AccountSection(title: sections[i].title, rows: sections[i].rows),
                    if (i != sections.length - 1) const SizedBox(height: 24),
                  ],
                  if (sections.isNotEmpty) const SizedBox(height: 24),
                  Text(
                    'Need changes? Contact the admin support team to update your driver records.',
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  List<_AccountSectionData> _buildSections() {
    return [
      _AccountSectionData(
        title: 'Basic Information',
        rows: _filterRows([
          _AccountRowData(icon: Icons.badge_outlined, label: 'User ID', value: widget.user.id),
          _AccountRowData(icon: Icons.assignment_ind_outlined, label: 'Role', value: _valueOrDash(widget.user.role)),
          _AccountRowData(icon: Icons.verified_user_outlined, label: 'Account Status', value: _driverStatus(widget.user.metadata)),
        ]),
      ),
      _AccountSectionData(
        title: 'Contact Information',
        rows: _filterRows([
          _AccountRowData(icon: Icons.email_outlined, label: 'Email', value: widget.user.email),
          _AccountRowData(icon: Icons.phone_outlined, label: 'Phone', value: _formatPhone(widget.user.phone)),
        ]),
      ),
      _AccountSectionData(
        title: 'Emergency Contact',
        rows: _filterRows([
          _AccountRowData(icon: Icons.person_outline, label: 'Emergency Contact', value: _valueOrDash(widget.user.emergencyDetails?.name)),
          _AccountRowData(icon: Icons.call_outlined, label: 'Phone', value: _formatEmergencyPhone(widget.user.emergencyDetails)),
          _AccountRowData(icon: Icons.place_outlined, label: 'Address', value: _valueOrDash(widget.user.emergencyDetails?.address)),
        ]),
      ),
    ];
  }

  List<_AccountRowData> _filterRows(List<_AccountRowData> rows) =>
      rows.where((row) => row.value != '—' && row.value.isNotEmpty).toList();

  String _valueOrDash(String? value) => (value == null || value.isEmpty) ? '—' : value;

  String _formatPhone(PhoneInfo? phone) {
    if (phone == null) {
      return '—';
    }
    final countryCode = phone.countryCode.trim();
    final number = phone.number.trim();
    if (countryCode.isEmpty && number.isEmpty) {
      return '—';
    }
    if (countryCode.isEmpty) {
      return number;
    }
    if (number.isEmpty) {
      return countryCode;
    }
    return '$countryCode $number';
  }

  String _formatEmergencyPhone(EmergencyDetails? emergency) {
    if (emergency == null) {
      return '—';
    }
    final primary = emergency.phone.trim();
    final secondary = emergency.additionalPhone?.trim() ?? '';
    if (primary.isEmpty && secondary.isEmpty) {
      return '—';
    }
    if (secondary.isEmpty) {
      return primary;
    }
    return '$primary · Alt: $secondary';
  }

  String _driverStatus(Map<String, dynamic>? metadata) {
    if (metadata == null) {
      return '—';
    }
    final isActive = metadata['isActive'];
    if (isActive is bool) {
      return isActive ? 'Active' : 'Inactive';
    }
    final status = metadata['status'];
    if (status is String && status.isNotEmpty) {
      return status;
    }
    return '—';
  }

  void _showNotificationsSheet(BuildContext context) {
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

  void _showSettingsSheet(BuildContext context) {
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
                    await handleLogout(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DriverAvatar extends StatelessWidget {
  const _DriverAvatar({required this.photo});

  final ProfilePhoto? photo;

  @override
  Widget build(BuildContext context) {
    if (photo != null && photo!.data.isNotEmpty) {
      final bytes = photo!.bytes;
      if (bytes != null) {
        return CircleAvatar(
          radius: 100,
          backgroundImage: MemoryImage(bytes),
        );
      }
    }

    return const CircleAvatar(
      radius: 52,
      child: Icon(Icons.person),
    );
  }
}

class _AccountSection extends StatelessWidget {
  const _AccountSection({required this.title, required this.rows});

  final String title;
  final List<_AccountRowData> rows;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Column(
            children: [
              for (int i = 0; i < rows.length; i++) ...[
                if (i != 0) const Divider(height: 1, thickness: 0.6),
                ListTile(
                  leading: Icon(rows[i].icon, color: theme.colorScheme.primary),
                  title: Text(rows[i].label),
                  subtitle: Text(rows[i].value),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _AccountRowData {
  const _AccountRowData({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;
}

class _AccountSectionData {
  const _AccountSectionData({required this.title, required this.rows});

  final String title;
  final List<_AccountRowData> rows;
}

mixin _DriverAccountScreenStateHelper {
  Future<void> get onLogoutFuture;

  Future<void> handleLogout(BuildContext context) async {
    await onLogoutFuture;
    if (context.mounted) {
      Navigator.of(context).maybePop();
    }
  }
}
