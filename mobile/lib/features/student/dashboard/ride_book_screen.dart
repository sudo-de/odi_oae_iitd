import 'package:flutter/material.dart';

import 'ride_book_qr_code_screen.dart';

class RideBookScreen extends StatefulWidget {
  const RideBookScreen({super.key});

  @override
  State<RideBookScreen> createState() => _RideBookScreenState();
}

class _RideBookScreenState extends State<RideBookScreen> {
  static const List<String> _rideTypes = ['Campus shuttle', 'Electric cart', 'Cab'];
  static const List<_UpcomingRide> _upcomingRides = [
    _UpcomingRide(
      route: 'Hostel Gate 3 → Lecture Hall Complex',
      schedule: 'Today · 5:30 PM',
      status: 'Awaiting driver confirmation',
    ),
    _UpcomingRide(
      route: 'Main Building → Library',
      schedule: 'Tomorrow · 9:00 AM',
      status: 'Confirmed · Vehicle EV-12',
    ),
  ];

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _pickupController = TextEditingController();
  final TextEditingController _dropController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String _selectedRideType = _rideTypes.first;
  bool _shareRideDetails = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _pickupController.dispose();
    _dropController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final localizations = MaterialLocalizations.of(context);

    final dateLabel = _selectedDate != null
        ? localizations.formatMediumDate(_selectedDate!)
        : 'Choose date';
    final timeLabel = _selectedTime != null
        ? localizations.formatTimeOfDay(_selectedTime!, alwaysUse24HourFormat: false)
        : 'Choose time';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book a Ride'),
        actions: [
          IconButton(
            tooltip: 'Scan driver QR',
            icon: const Icon(Icons.qr_code_scanner_outlined),
            onPressed: () async {
              final result = await Navigator.of(context).push<String>(
                MaterialPageRoute(
                  builder: (_) => const RideBookQrCodeScreen(),
                ),
              );

              if (!mounted || result == null) {
                return;
              }

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Driver QR confirmed: $result'),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Plan your campus commute',
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Reserve a shuttle, electric cart, or cab for intra-campus travel. '
                'Provide the details below and the mobility desk will confirm your booking shortly.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle(context, 'Journey details'),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _pickupController,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(
                            labelText: 'Pickup point',
                            hintText: 'e.g. Hostel Gate 3',
                            prefixIcon: Icon(Icons.my_location_outlined),
                          ),
                          validator: (value) =>
                              (value == null || value.trim().isEmpty) ? 'Enter a pickup point' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _dropController,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(
                            labelText: 'Drop-off point',
                            hintText: 'e.g. Academic Block',
                            prefixIcon: Icon(Icons.location_on_outlined),
                          ),
                          validator: (value) =>
                              (value == null || value.trim().isEmpty) ? 'Enter a drop-off point' : null,
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _selectedRideType,
                          decoration: const InputDecoration(
                            labelText: 'Ride type',
                            prefixIcon: Icon(Icons.directions_bus_filled_outlined),
                          ),
                          items: _rideTypes
                              .map(
                                (type) => DropdownMenuItem<String>(
                                  value: type,
                                  child: Text(type),
                                ),
                              )
                              .toList(),
                          onChanged: (value) {
                            if (value == null) {
                              return;
                            }
                            setState(() {
                              _selectedRideType = value;
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: _DateTimePickerButton(
                                label: 'Date',
                                valueText: dateLabel,
                                isSet: _selectedDate != null,
                                icon: Icons.calendar_today_outlined,
                                onPressed: _selectDate,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _DateTimePickerButton(
                                label: 'Time',
                                valueText: timeLabel,
                                isSet: _selectedTime != null,
                                icon: Icons.schedule_outlined,
                                onPressed: _selectTime,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _notesController,
                          maxLines: 3,
                          decoration: const InputDecoration(
                            labelText: 'Notes to driver (optional)',
                            hintText: 'Add details such as luggage or accessibility needs',
                            alignLabelWithHint: true,
                          ),
                        ),
                        const SizedBox(height: 16),
                        SwitchListTile(
                          value: _shareRideDetails,
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Share ride details'),
                          subtitle: const Text('Notify your guardian or roommates about this booking.'),
                          onChanged: (value) => setState(() => _shareRideDetails = value),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: _isSubmitting ? null : _submitBooking,
                            child: _isSubmitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Text('Confirm booking'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              _buildRideTipsCard(context),
              const SizedBox(height: 24),
              _UpcomingRidesList(upcomingRides: _upcomingRides),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRideTipsCard(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      color: theme.colorScheme.surfaceVariant,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.tips_and_updates_outlined, color: theme.colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'Booking tips',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text('• Book at least 15 minutes before departure for guaranteed slots.'),
            const SizedBox(height: 4),
            const Text('• Shuttle services are free for campus loops; cabs are chargeable.'),
            const SizedBox(height: 4),
            const Text('• For accessibility assistance, mention it in the notes section.'),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final theme = Theme.of(context);

    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
    );
  }

  Future<void> _selectDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 60)),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _selectTime() async {
    final now = TimeOfDay.now();
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? now,
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
      });
    }
  }

  Future<void> _submitBooking() async {
    final messenger = ScaffoldMessenger.of(context);

    if (!_formKey.currentState!.validate()) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Please fix the highlighted fields before submitting.'),
        ),
      );
      return;
    }

    if (_selectedDate == null || _selectedTime == null) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Select both a pickup date and time.'),
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    await Future<void>.delayed(const Duration(milliseconds: 900));

    if (!mounted) {
      return;
    }

    final selectedDate = _selectedDate!;
    final selectedTime = _selectedTime!;
    final selectedRideType = _selectedRideType;
    final formattedDate = MaterialLocalizations.of(context).formatMediumDate(selectedDate);
    final formattedTime = MaterialLocalizations.of(context).formatTimeOfDay(
      selectedTime,
      alwaysUse24HourFormat: false,
    );

    setState(() {
      _isSubmitting = false;
      _selectedDate = null;
      _selectedTime = null;
      _selectedRideType = _rideTypes.first;
    });

    _pickupController.clear();
    _dropController.clear();
    _notesController.clear();

    messenger.showSnackBar(
      SnackBar(
        content: Text(
          'Ride request sent for $selectedRideType on $formattedDate at $formattedTime.',
        ),
      ),
    );
  }
}

class _DateTimePickerButton extends StatelessWidget {
  const _DateTimePickerButton({
    required this.label,
    required this.valueText,
    required this.isSet,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final String valueText;
  final bool isSet;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final textStyle = isSet
        ? theme.textTheme.titleMedium
        : theme.textTheme.titleMedium?.copyWith(color: theme.hintColor);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: theme.textTheme.labelLarge),
        const SizedBox(height: 8),
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            alignment: Alignment.centerLeft,
            minimumSize: const Size.fromHeight(48),
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          ),
          onPressed: onPressed,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Icon(icon),
              const SizedBox(width: 12),
              Expanded(child: Text(valueText, style: textStyle)),
            ],
          ),
        ),
      ],
    );
  }
}

class _UpcomingRidesList extends StatelessWidget {
  const _UpcomingRidesList({required this.upcomingRides});

  final List<_UpcomingRide> upcomingRides;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (upcomingRides.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              const Icon(Icons.inbox_outlined),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  'No upcoming rides yet. Confirm a booking to see it here.',
                  style: theme.textTheme.bodyMedium,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upcoming rides',
          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        ...upcomingRides.map(
          (ride) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: const Icon(Icons.directions_car_outlined),
              title: Text(ride.route),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ride.schedule),
                  Text(
                    ride.status,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              trailing: IconButton(
                icon: const Icon(Icons.open_in_new),
                tooltip: 'View details',
                onPressed: () => _showSnack(context, 'Ride details coming soon.'),
              ),
            ),
          ),
        ),
      ],
    );
  }

  static void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}

class _UpcomingRide {
  const _UpcomingRide({
    required this.route,
    required this.schedule,
    required this.status,
  });

  final String route;
  final String schedule;
  final String status;
}
