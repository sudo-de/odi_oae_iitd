import 'package:flutter/material.dart';

class StudentNotificationsScreen extends StatefulWidget {
  const StudentNotificationsScreen({super.key});

  @override
  State<StudentNotificationsScreen> createState() => _StudentNotificationsScreenState();
}

class _StudentNotificationsScreenState extends State<StudentNotificationsScreen> {
  bool _pushEnabled = true;
  bool _emailEnabled = false;
  bool _smsEnabled = false;

  final Map<_PreferenceKey, bool> _categoryPreferences = {
    _PreferenceKey.classUpdates: true,
    _PreferenceKey.assignmentReminders: true,
    _PreferenceKey.transportAlerts: false,
    _PreferenceKey.financeNotices: false,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          Text(
            'Channels',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          _buildChannelSwitch(
            title: 'Push notifications',
            subtitle: 'Receive instant updates on your device.',
            value: _pushEnabled,
            onChanged: (value) => setState(() => _pushEnabled = value),
          ),
          _buildChannelSwitch(
            title: 'Email notifications',
            subtitle: 'Get summaries and important alerts via email.',
            value: _emailEnabled,
            onChanged: (value) => setState(() => _emailEnabled = value),
          ),
          _buildChannelSwitch(
            title: 'SMS alerts',
            subtitle: 'Critical updates like shuttle changes and emergencies.',
            value: _smsEnabled,
            onChanged: (value) => setState(() => _smsEnabled = value),
          ),
          const SizedBox(height: 24),
          Text(
            'Categories',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._categoryPreferences.entries.map(
            (entry) => CheckboxListTile(
              value: entry.value,
              onChanged: (_pushEnabled || _emailEnabled || _smsEnabled)
                  ? (value) => setState(() => _categoryPreferences[entry.key] = value ?? false)
                  : null,
              title: Text(_preferenceLabel(entry.key)),
              subtitle: Text(_preferenceDescription(entry.key)),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Preferences saved.')),
              );
            },
            icon: const Icon(Icons.save_outlined),
            label: const Text('Save preferences'),
          ),
        ],
      ),
    );
  }

  Widget _buildChannelSwitch({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: SwitchListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        value: value,
        onChanged: onChanged,
      ),
    );
  }

  String _preferenceLabel(_PreferenceKey key) {
    switch (key) {
      case _PreferenceKey.classUpdates:
        return 'Class updates';
      case _PreferenceKey.assignmentReminders:
        return 'Assignment reminders';
      case _PreferenceKey.transportAlerts:
        return 'Transport alerts';
      case _PreferenceKey.financeNotices:
        return 'Finance notices';
    }
  }

  String _preferenceDescription(_PreferenceKey key) {
    switch (key) {
      case _PreferenceKey.classUpdates:
        return 'Schedule changes, cancellations, and announcements.';
      case _PreferenceKey.assignmentReminders:
        return 'Upcoming deadlines and evaluation updates.';
      case _PreferenceKey.transportAlerts:
        return 'Shuttle delays, driver updates, and route changes.';
      case _PreferenceKey.financeNotices:
        return 'Fee payment reminders and scholarship updates.';
    }
  }
}

enum _PreferenceKey {
  classUpdates,
  assignmentReminders,
  transportAlerts,
  financeNotices,
}

