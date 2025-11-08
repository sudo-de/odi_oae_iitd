import 'package:flutter/material.dart';

class StudentThemeSheet extends StatelessWidget {
  const StudentThemeSheet({super.key, required this.selectedMode});

  final ThemeMode selectedMode;

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
            Text(
              'Choose Theme',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            RadioListTile<ThemeMode>(
              value: ThemeMode.light,
              groupValue: selectedMode,
              title: const Text('Light'),
              onChanged: (mode) {
                if (mode != null) {
                  Navigator.of(context).pop(mode);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              value: ThemeMode.dark,
              groupValue: selectedMode,
              title: const Text('Dark'),
              onChanged: (mode) {
                if (mode != null) {
                  Navigator.of(context).pop(mode);
                }
              },
            ),
            RadioListTile<ThemeMode>(
              value: ThemeMode.system,
              groupValue: selectedMode,
              title: const Text('System Default'),
              onChanged: (mode) {
                if (mode != null) {
                  Navigator.of(context).pop(mode);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

