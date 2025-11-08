import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import 'package:mobile/models/user.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/services/user_service.dart';

class DriverQrScreen extends StatefulWidget {
  const DriverQrScreen({super.key, required this.user});

  final User user;

  @override
  State<DriverQrScreen> createState() => _DriverQrScreenState();
}

class _DriverQrScreenState extends State<DriverQrScreen> {
  final UserService _userService = UserService();
  final AuthService _authService = AuthService();
  bool _isLoading = true;
  bool _isSharing = false;
  String? _errorMessage;
  late User _user;
  final GlobalKey _shareButtonKey = GlobalKey(debugLabel: 'driverShareButton');

  @override
  void initState() {
    super.initState();
    _user = widget.user;
    _loadDriverProfile();
  }

  Future<void> _loadDriverProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final updatedUser = await _userService.fetchProfile();
      if (!mounted) {
        return;
      }

      setState(() {
        _user = updatedUser;
        _isLoading = false;
      });

      await _authService.updateCachedUser(updatedUser);
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _isLoading = false;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _shareQr() async {
    final qrData = _user.qrCode;
    if (qrData == null || qrData.isEmpty) {
      return;
    }

    setState(() {
      _isSharing = true;
      _errorMessage = null;
    });

    try {
      final bytes = _decodeQrBytes(qrData);
      final directory = await getTemporaryDirectory();
      final file = File('${directory.path}/driver-qr.png');
      await file.writeAsBytes(bytes, flush: true);

      Rect shareOrigin = _calculateShareOrigin();

      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'Driver QR Code',
        sharePositionOrigin: shareOrigin,
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _errorMessage = 'Unable to share QR code: $error';
      });
    } finally {
      if (!mounted) {
        return;
      }
      setState(() {
        _isSharing = false;
      });
    }
  }

  Rect _calculateShareOrigin() {
    final buttonRenderBox =
        _shareButtonKey.currentContext?.findRenderObject() as RenderBox?;
    if (buttonRenderBox != null) {
      final position = buttonRenderBox.localToGlobal(Offset.zero);
      return position & buttonRenderBox.size;
    }

    final overlayState = Overlay.maybeOf(context);
    if (overlayState != null) {
      final overlayRenderBox =
          overlayState.context.findRenderObject() as RenderBox?;
      if (overlayRenderBox != null) {
        final position = overlayRenderBox.localToGlobal(Offset.zero);
        return position & overlayRenderBox.size;
      }
    }

    final size = MediaQuery.of(context).size;
    return Rect.fromLTWH(0, 0, size.width, size.height / 2);
  }

  Uint8List _decodeQrBytes(String qrData) {
    final dataUriPrefix = 'base64,';
    final startIndex = qrData.contains(dataUriPrefix)
        ? qrData.indexOf(dataUriPrefix) + dataUriPrefix.length
        : 0;
    final normalized = qrData.substring(startIndex).replaceAll(RegExp(r'\s'), '');
    return base64Decode(normalized);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Navigator.of(context).pop(_user);
        return false;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Driver QR Code'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(_user),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null) ...[
                Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 16),
              ],
              Expanded(
                child: Center(
                  child: _buildContent(),
                ),
              ),
              const SizedBox(height: 24),
              OutlinedButton.icon(
                key: _shareButtonKey,
                onPressed:
                    _isSharing || _user.qrCode == null || _user.qrCode!.isEmpty
                        ? null
                        : _shareQr,
                icon: _isSharing
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.share),
                label: const Text('Share'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: const [
          CircularProgressIndicator(),
          SizedBox(height: 16),
          Text('Fetching your QR code...'),
        ],
      );
    }

    final qrCode = _user.qrCode;

    if (qrCode == null || qrCode.isEmpty) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: const [
          Icon(Icons.qr_code_2_outlined, size: 96),
          SizedBox(height: 16),
          Text(
            'No QR code found for your account yet. Use the button below to generate one.',
            textAlign: TextAlign.center,
          ),
        ],
      );
    }

    try {
      final bytes = _decodeQrBytes(qrCode);
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Image.memory(
              bytes,
              width: 220,
              height: 220,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            _user.name.isEmpty ? 'Driver' : _user.name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          if (_user.email.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(_user.email),
          ],
        ],
      );
    } catch (error) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 72, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            'Unable to display QR code. Please regenerate.\n$error',
            textAlign: TextAlign.center,
          ),
        ],
      );
    }
  }

  @override
  void dispose() {
    super.dispose();
  }
}

