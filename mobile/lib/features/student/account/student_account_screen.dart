import 'package:flutter/material.dart';

import 'package:mobile/models/user.dart';

class StudentAccountScreen extends StatelessWidget {
  const StudentAccountScreen({super.key, required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final sections = _buildSections().where((section) => section.rows.isNotEmpty).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Column(
              children: [
                _ProfileAvatar(photo: user.profilePhoto),
                const SizedBox(height: 12),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      user.name.isEmpty ? 'Student' : user.name,
                      style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.verified, color: Colors.green, size: 20),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Account',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Review your contact information and emergency details. Please reach out to the admin office for updates.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          for (int i = 0; i < sections.length; i++) ...[
            _AccountSection(title: sections[i].title, rows: sections[i].rows),
            if (i != sections.length - 1) const SizedBox(height: 24),
          ],
        ],
      ),
    );
  }

  List<_AccountSectionData> _buildSections() {
    return [
      _AccountSectionData(
        title: 'Academic Information',
        rows: _filterRows([
          _AccountRowData(icon: Icons.badge_outlined, label: 'Entry Number', value: _valueOrDash(user.entryNumber)),
          _AccountRowData(icon: Icons.school_outlined, label: 'Programme', value: _valueOrDash(user.programme)),
          _AccountRowData(icon: Icons.domain_outlined, label: 'Department', value: _valueOrDash(user.department)),
          _AccountRowData(icon: Icons.home_outlined, label: 'Hostel', value: _formatHostel(user.hostel)),
        ]),
      ),
      _AccountSectionData(
        title: 'Contact Information',
        rows: _filterRows([
          _AccountRowData(icon: Icons.email_outlined, label: 'Email', value: user.email),
          _AccountRowData(icon: Icons.phone_outlined, label: 'Phone', value: _formatPhone(user.phone)),
        ]),
      ),
      _AccountSectionData(
        title: 'Emergency Contact',
        rows: _filterRows([
          _AccountRowData(icon: Icons.person_outline, label: 'Contact Name', value: _valueOrDash(user.emergencyDetails?.name)),
          _AccountRowData(icon: Icons.call_outlined, label: 'Phone', value: _formatEmergencyPhone(user.emergencyDetails)),
          _AccountRowData(icon: Icons.place_outlined, label: 'Address', value: _valueOrDash(user.emergencyDetails?.address)),
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

  String _formatHostel(HostelInfo? hostel) {
    if (hostel == null) {
      return '—';
    }
    final name = hostel.name.trim();
    final room = hostel.roomNo.trim();
    if (name.isEmpty && room.isEmpty) {
      return '—';
    }
    if (name.isNotEmpty && room.isNotEmpty) {
      return '$name · Room $room';
    }
    return name.isNotEmpty ? name : 'Room $room';
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
}

class _ProfileAvatar extends StatelessWidget {
  const _ProfileAvatar({required this.photo});

  final ProfilePhoto? photo;

  @override
  Widget build(BuildContext context) {
    if (photo != null && photo!.data.isNotEmpty) {
      final bytes = photo!.bytes;

      if (bytes != null) {
        return CircleAvatar(
          radius: 48,
          backgroundImage: MemoryImage(bytes),
        );
      }
    }

    return const CircleAvatar(
      radius: 48,
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

