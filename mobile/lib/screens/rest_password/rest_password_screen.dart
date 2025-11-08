import 'package:flutter/material.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

enum _ResetStage { email, verify, success }

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _emailController = TextEditingController();
  final _codeController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _emailFormKey = GlobalKey<FormState>();
  final _resetFormKey = GlobalKey<FormState>();

  _ResetStage _stage = _ResetStage.email;
  bool _isSendingCode = false;
  bool _isUpdatingPassword = false;
  String? _sentCode;

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reset Password'),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: switch (_stage) {
          _ResetStage.email => _buildEmailStep(context),
          _ResetStage.verify => _buildVerificationStep(context),
          _ResetStage.success => _buildSuccessState(context),
        },
      ),
    );
  }

  Widget _buildEmailStep(BuildContext context) {
    return Padding(
      key: const ValueKey('email-step'),
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _emailFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your institute email',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'We will send a one-time password (OTP) to verify your identity before you choose a new password.',
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email address',
                prefixIcon: Icon(Icons.email_outlined),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Enter your email address';
                }
                final email = value.trim();
                final emailPattern = RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$');
                if (!emailPattern.hasMatch(email)) {
                  return 'Enter a valid email address';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _isSendingCode ? null : _handleSendCode,
              icon: const Icon(Icons.send_outlined),
              label:
                  _isSendingCode ? const Text('Sending code...') : const Text('Send verification code'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVerificationStep(BuildContext context) {
    return Padding(
      key: const ValueKey('verify-step'),
      padding: const EdgeInsets.all(24.0),
      child: Form(
        key: _resetFormKey,
        child: ListView(
          children: [
            Text(
              'Verify OTP & Set new password',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'An OTP has been sent to ${_emailController.text.trim()}. Enter it below along with your new password.',
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _codeController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'One-time password',
                prefixIcon: Icon(Icons.password_outlined),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Enter the OTP';
                }
                if (_sentCode != null && value.trim() != _sentCode) {
                  return 'OTP does not match';
                }
                if (value.trim().length != 6) {
                  return 'OTP should be 6 digits';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _newPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'New password',
                prefixIcon: Icon(Icons.lock_outline),
              ),
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
            const SizedBox(height: 16),
            TextFormField(
              controller: _confirmPasswordController,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirm new password',
                prefixIcon: Icon(Icons.lock_reset_outlined),
              ),
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
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _isUpdatingPassword ? null : _handleUpdatePassword,
              icon: const Icon(Icons.check_circle_outline),
              label: _isUpdatingPassword
                  ? const Text('Updating password...')
                  : const Text('Update password'),
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: _isSendingCode ? null : _handleResendCode,
              icon: const Icon(Icons.refresh_outlined),
              label: const Text('Resend code'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessState(BuildContext context) {
    return Center(
      key: const ValueKey('success-step'),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified_outlined, size: 72, color: Colors.green),
            const SizedBox(height: 16),
            Text(
              'Password updated!',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'You can now sign in using your new password.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Return to security settings'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSendCode() async {
    if (!_emailFormKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSendingCode = true;
    });

    await Future<void>.delayed(const Duration(seconds: 1));

    if (!mounted) {
      return;
    }

    setState(() {
      _isSendingCode = false;
      _sentCode = '123456';
      _stage = _ResetStage.verify;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Verification code sent to your email.')),
    );
  }

  Future<void> _handleUpdatePassword() async {
    if (!_resetFormKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isUpdatingPassword = true;
    });

    await Future<void>.delayed(const Duration(seconds: 1));

    if (!mounted) {
      return;
    }

    setState(() {
      _isUpdatingPassword = false;
      _stage = _ResetStage.success;
    });
  }

  Future<void> _handleResendCode() async {
    setState(() {
      _isSendingCode = true;
    });

    await Future<void>.delayed(const Duration(seconds: 1));

    if (!mounted) {
      return;
    }

    setState(() {
      _isSendingCode = false;
      _sentCode = '654321';
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('A new verification code has been sent.')),
    );
  }
}

