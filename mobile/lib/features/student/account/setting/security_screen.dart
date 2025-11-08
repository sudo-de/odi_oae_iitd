import 'package:flutter/material.dart';
import 'package:mobile/screens/rest_password/rest_password_screen.dart';

class StudentSecurityScreen extends StatefulWidget {
  const StudentSecurityScreen({super.key});

  @override
  State<StudentSecurityScreen> createState() => _StudentSecurityScreenState();
}

class _StudentSecurityScreenState extends State<StudentSecurityScreen> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isSubmittingChange = false;
  bool _isSendingReset = false;

  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Security Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          Text(
            'Change Password',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _PasswordField(
                      controller: _currentPasswordController,
                      label: 'Current password',
                      obscureText: _obscureCurrent,
                      onVisibilityToggle: () => setState(() => _obscureCurrent = !_obscureCurrent),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Enter your current password';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    _PasswordField(
                      controller: _newPasswordController,
                      label: 'New password',
                      obscureText: _obscureNew,
                      onVisibilityToggle: () => setState(() => _obscureNew = !_obscureNew),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Enter a new password';
                        }
                        if (value.length < 8) {
                          return 'Use at least 8 characters';
                        }
                        if (!RegExp(r'[A-Z]').hasMatch(value) || !RegExp(r'[0-9]').hasMatch(value)) {
                          return 'Include an uppercase letter and a number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    _PasswordField(
                      controller: _confirmPasswordController,
                      label: 'Confirm new password',
                      obscureText: _obscureConfirm,
                      onVisibilityToggle: () => setState(() => _obscureConfirm = !_obscureConfirm),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Confirm your new password';
                        }
                        if (value != _newPasswordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: _isSubmittingChange ? null : _handleChangePassword,
                      icon: const Icon(Icons.lock_reset),
                      label: _isSubmittingChange
                          ? const Text('Updating password...')
                          : const Text('Update password'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Forgot Password',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'If you no longer remember your password, you can reset it using a verification code sent to your email.',
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: _isSendingReset ? null : _handleResetPassword,
                    icon: const Icon(Icons.email_outlined),
                    label: _isSendingReset
                        ? const Text('Opening reset flow...')
                        : const Text('Reset via email'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleChangePassword() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmittingChange = true;
    });

    await Future<void>.delayed(const Duration(seconds: 1));

    if (!mounted) {
      return;
    }

    setState(() {
      _isSubmittingChange = false;
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Password updated successfully.')),
    );
  }

  Future<void> _handleResetPassword() async {
    setState(() {
      _isSendingReset = true;
    });

    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => const ResetPasswordScreen(),
      ),
    );

    if (!mounted) {
      return;
    }

    setState(() {
      _isSendingReset = false;
    });

    if (result == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully.')),
      );
    }
  }
}

class _PasswordField extends StatelessWidget {
  const _PasswordField({
    required this.controller,
    required this.label,
    required this.obscureText,
    required this.onVisibilityToggle,
    required this.validator,
  });

  final TextEditingController controller;
  final String label;
  final bool obscureText;
  final VoidCallback onVisibilityToggle;
  final FormFieldValidator<String> validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(
        labelText: label,
        suffixIcon: IconButton(
          icon: Icon(obscureText ? Icons.visibility_outlined : Icons.visibility_off_outlined),
          onPressed: onVisibilityToggle,
        ),
      ),
      validator: validator,
    );
  }
}

