import 'package:flutter/material.dart';

class StudentActivityScreen extends StatefulWidget {
  const StudentActivityScreen({super.key});

  @override
  State<StudentActivityScreen> createState() => _StudentActivityScreenState();
}

enum _ActivityCategory { rides, academics, support }

class _StudentActivityScreenState extends State<StudentActivityScreen> {
  final Set<_ActivityCategory> _selectedCategories = _ActivityCategory.values.toSet();

  static final List<_ActivityEntry> _activities = [
    _ActivityEntry(
      title: 'Ride confirmed · EV-12',
      description: 'Hostel Gate 3 → Lecture Hall Complex · Seats reserved for 2 passengers.',
      date: DateTime.now().subtract(const Duration(hours: 2)),
      category: _ActivityCategory.rides,
      icon: Icons.directions_car_filled_outlined,
      accent: Colors.green,
      status: 'Completed',
    ),
    _ActivityEntry(
      title: 'Ride request declined',
      description: 'Library → Main Building · No drivers were available.',
      date: DateTime.now().subtract(const Duration(hours: 7)),
      category: _ActivityCategory.rides,
      icon: Icons.dangerous_outlined,
      accent: Colors.red,
      status: 'Declined',
    ),
    _ActivityEntry(
      title: 'Course submission synced',
      description: 'Uploaded lab report to EE101 · Marks pending faculty review.',
      date: DateTime.now().subtract(const Duration(days: 1, hours: 4)),
      category: _ActivityCategory.academics,
      icon: Icons.assignment_turned_in_outlined,
      accent: Colors.blue,
      status: 'Synced',
    ),
    _ActivityEntry(
      title: 'Support ticket resolved',
      description: 'Transport desk resolved query: “Cab reimbursement form”.',
      date: DateTime.now().subtract(const Duration(days: 2, hours: 3)),
      category: _ActivityCategory.support,
      icon: Icons.support_agent_outlined,
      accent: Colors.deepPurple,
      status: 'Resolved',
    ),
    _ActivityEntry(
      title: 'Ride completed · Shuttle S5',
      description: 'Academic Block → Hostel Gate 3 · Feedback shared with transport desk.',
      date: DateTime.now().subtract(const Duration(days: 3)),
      category: _ActivityCategory.rides,
      icon: Icons.directions_bus_filled_outlined,
      accent: Colors.green,
      status: 'Completed',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filteredActivities = _activities.where((activity) => _selectedCategories.contains(activity.category)).toList()
      ..sort((a, b) => b.date.compareTo(a.date));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Activity history'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(context),
            const Divider(height: 0),
            Expanded(
              child: filteredActivities.isEmpty
                  ? _EmptyState(onResetFilters: _resetFilters)
                  : ListView.separated(
                      padding: const EdgeInsets.all(24.0),
                      itemBuilder: (context, index) => _ActivityTile(entry: filteredActivities[index]),
                      separatorBuilder: (context, _) => const SizedBox(height: 12),
                      itemCount: filteredActivities.length,
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showDownloadSheet(context),
        icon: const Icon(Icons.download_outlined),
        label: const Text('Download report'),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);
    final ridesCount = _activities.where((activity) => activity.category == _ActivityCategory.rides).length;
    final academicsCount = _activities.where((activity) => activity.category == _ActivityCategory.academics).length;
    final supportCount = _activities.where((activity) => activity.category == _ActivityCategory.support).length;

    return Material(
      color: Theme.of(context).colorScheme.surface,
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Review your recent campus activity',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Filter by category to find ride bookings, course updates, and support interactions.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _SummaryChip(
                  icon: Icons.directions_car_outlined,
                  label: 'Rides',
                  count: ridesCount,
                  selected: _selectedCategories.contains(_ActivityCategory.rides),
                  onSelected: (value) => _toggleCategory(_ActivityCategory.rides, value),
                ),
                _SummaryChip(
                  icon: Icons.school_outlined,
                  label: 'Academics',
                  count: academicsCount,
                  selected: _selectedCategories.contains(_ActivityCategory.academics),
                  onSelected: (value) => _toggleCategory(_ActivityCategory.academics, value),
                ),
                _SummaryChip(
                  icon: Icons.support_agent_outlined,
                  label: 'Support',
                  count: supportCount,
                  selected: _selectedCategories.contains(_ActivityCategory.support),
                  onSelected: (value) => _toggleCategory(_ActivityCategory.support, value),
                ),
              ],
            ),
            if (_selectedCategories.length != _ActivityCategory.values.length)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: _resetFilters,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reset filters'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _toggleCategory(_ActivityCategory category, bool selected) {
    setState(() {
      if (selected) {
        _selectedCategories.add(category);
      } else {
        _selectedCategories.remove(category);
      }
    });
  }

  void _resetFilters() {
    setState(() {
      _selectedCategories
        ..clear()
        ..addAll(_ActivityCategory.values);
    });
  }

  void _showDownloadSheet(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => const _DownloadSheet(),
    );
  }
}

class _SummaryChip extends StatelessWidget {
  const _SummaryChip({
    required this.icon,
    required this.label,
    required this.count,
    required this.selected,
    required this.onSelected,
  });

  final IconData icon;
  final String label;
  final int count;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selectedColor = theme.colorScheme.primary;
    final borderColor = selected ? selectedColor : theme.colorScheme.outlineVariant;

    return FilterChip(
      selected: selected,
      onSelected: onSelected,
      avatar: Icon(icon, size: 18, color: selected ? theme.colorScheme.onPrimary : theme.colorScheme.primary),
      label: Text('$label · $count'),
      labelStyle: selected
          ? theme.textTheme.labelLarge?.copyWith(color: theme.colorScheme.onPrimary)
          : theme.textTheme.labelLarge,
      selectedColor: selectedColor,
      checkmarkColor: theme.colorScheme.onPrimary,
      side: BorderSide(color: borderColor),
    );
  }
}

class _ActivityTile extends StatelessWidget {
  const _ActivityTile({required this.entry});

  final _ActivityEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localizations = MaterialLocalizations.of(context);
    final dateText = localizations.formatMediumDate(entry.date);
    final timeText = localizations.formatTimeOfDay(TimeOfDay.fromDateTime(entry.date), alwaysUse24HourFormat: false);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: entry.accent.withOpacity(0.15),
                  child: Icon(entry.icon, color: entry.accent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.title,
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(entry.description, style: theme.textTheme.bodyMedium),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  entry.status,
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: entry.accent,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today_outlined, size: 16, color: theme.colorScheme.onSurfaceVariant),
                const SizedBox(width: 6),
                Text('$dateText · $timeText', style: theme.textTheme.bodySmall),
                const Spacer(),
                TextButton.icon(
                  onPressed: () => _showSnack(context, 'Detailed timeline coming soon.'),
                  icon: const Icon(Icons.timeline_outlined, size: 18),
                  label: const Text('View timeline'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onResetFilters});

  final VoidCallback onResetFilters;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inbox_outlined, size: 48, color: theme.colorScheme.primary),
            const SizedBox(height: 16),
            Text(
              'No activity in the selected categories',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Adjust the filters or download a full report for a comprehensive history.',
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: onResetFilters,
              child: const Text('Reset filters'),
            ),
          ],
        ),
      ),
    );
  }
}

class _DownloadSheet extends StatelessWidget {
  const _DownloadSheet();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
                    'Download activity report',
                    style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text('Choose your preferred format. Detailed ride information includes driver IDs and feedback.'),
            const SizedBox(height: 16),
            _DownloadOption(
              icon: Icons.description_outlined,
              title: 'PDF summary',
              subtitle: 'Best for sharing or printing. Includes charts and key highlights.',
            ),
            const SizedBox(height: 12),
            _DownloadOption(
              icon: Icons.table_chart_outlined,
              title: 'CSV export',
              subtitle: 'Excel-ready data file. Contains every event with timestamps.',
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Report generation is in progress...')),
                );
              },
              icon: const Icon(Icons.download),
              label: const Text('Generate report'),
            ),
          ],
        ),
      ),
    );
  }
}

class _DownloadOption extends StatelessWidget {
  const _DownloadOption({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$title download coming soon.')),
        ),
      ),
    );
  }
}

class _ActivityEntry {
  const _ActivityEntry({
    required this.title,
    required this.description,
    required this.date,
    required this.category,
    required this.icon,
    required this.accent,
    required this.status,
  });

  final String title;
  final String description;
  final DateTime date;
  final _ActivityCategory category;
  final IconData icon;
  final Color accent;
  final String status;
}
