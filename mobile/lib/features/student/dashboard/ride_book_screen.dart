import 'package:flutter/material.dart';

import 'ride_book_qr_code_screen.dart';

class RideBookScreen extends StatefulWidget {
  const RideBookScreen({super.key});

  @override
  State<RideBookScreen> createState() => _RideBookScreenState();
}

class _RideBookScreenState extends State<RideBookScreen> {
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

  String? _driverQrCode;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _pickupController.dispose();
    _dropController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book a Ride'),
        actions: [
          IconButton(
            tooltip: 'Scan driver QR',
            icon: const Icon(Icons.qr_code_scanner_outlined),
            onPressed: _startDriverQrScan,
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
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
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
                              (value == null || value.trim().isEmpty)
                              ? 'Enter a pickup point'
                              : null,
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
                              (value == null || value.trim().isEmpty)
                              ? 'Enter a drop-off point'
                              : null,
                        ),
                        const SizedBox(height: 16),
                        _buildDriverVerificationSection(context),
                        const SizedBox(height: 16),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: _isSubmitting ? null : _submitBooking,
                            child: _isSubmitting
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
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

  Future<void> _startDriverQrScan() async {
    final result = await Navigator.of(context).push<String>(
      MaterialPageRoute(builder: (_) => const RideBookQrCodeScreen()),
    );

    if (!mounted || result == null) {
      return;
    }

    setState(() {
      _driverQrCode = result;
    });

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Driver QR confirmed: $result')));
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
                Icon(
                  Icons.tips_and_updates_outlined,
                  color: theme.colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Text(
                  'Booking tips',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Text(
              '• Book at least 15 minutes before departure for guaranteed slots.',
            ),
            const SizedBox(height: 4),
            const Text(
              '• Shuttle services are free for campus loops; cabs are chargeable.',
            ),
            const SizedBox(height: 4),
            const Text(
              '• For accessibility assistance, mention it in the notes section.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverVerificationSection(BuildContext context) {
    final theme = Theme.of(context);

    if (_driverQrCode == null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(context, 'Driver verification'),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _startDriverQrScan,
            icon: const Icon(Icons.qr_code_scanner_outlined),
            label: const Text('Scan driver QR'),
          ),
          const SizedBox(height: 8),
          Text(
            'Use the driver’s QR to confirm their identity or pickup location before boarding.',
            style: theme.textTheme.bodySmall,
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle(context, 'Driver verification'),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceVariant,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.verified_outlined, color: theme.colorScheme.primary),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Driver QR confirmed',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _driverQrCode!,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'If the driver’s location changes, rescan to refresh the details.',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Remove',
                onPressed: () => setState(() => _driverQrCode = null),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: _startDriverQrScan,
          icon: const Icon(Icons.qr_code_scanner_outlined),
          label: const Text('Rescan driver QR'),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    final theme = Theme.of(context);

    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
    );
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

    setState(() {
      _isSubmitting = true;
    });

    await Future<void>.delayed(const Duration(milliseconds: 900));

    if (!mounted) {
      return;
    }

    final driverCode = _driverQrCode;

    setState(() {
      _isSubmitting = false;
      _driverQrCode = null;
    });

    _pickupController.clear();
    _dropController.clear();
    final confirmationMessage = StringBuffer('Ride request sent successfully.');
    if (driverCode != null) {
      confirmationMessage.write(' Driver QR: $driverCode.');
    }

    messenger.showSnackBar(
      SnackBar(content: Text(confirmationMessage.toString())),
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
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
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
                onPressed: () =>
                    _showSnack(context, 'Ride details coming soon.'),
              ),
            ),
          ),
        ),
      ],
    );
  }

  static void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
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
