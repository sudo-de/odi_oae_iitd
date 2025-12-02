import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class RideBookQrCodeScreen extends StatefulWidget {
  const RideBookQrCodeScreen({super.key});

  @override
  State<RideBookQrCodeScreen> createState() => _RideBookQrCodeScreenState();
}

class _RideBookQrCodeScreenState extends State<RideBookQrCodeScreen> {
  final MobileScannerController _controller = MobileScannerController(
    formats: [BarcodeFormat.qrCode],
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );
  final ImagePicker _imagePicker = ImagePicker();

  bool _isProcessing = false;
  String? _lastCode;
  bool _torchEnabled = false;
  CameraFacing _cameraFacing = CameraFacing.back;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (!mounted || _isProcessing) {
      return;
    }

    final rawValue = _extractRawValue(capture);
    if (rawValue == null) {
      return;
    }

    await _handleScanResult(rawValue);
  }

  String? _extractRawValue(BarcodeCapture? capture) {
    if (capture == null) {
      return null;
    }

    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value != null && value.isNotEmpty) {
        return value;
      }
    }
    return null;
  }

  Future<void> _handleScanResult(String rawValue) async {
    setState(() {
      _isProcessing = true;
      _lastCode = rawValue;
    });

    final bool wasRunning = _controller.value.isRunning;

    if (wasRunning) {
      await _controller.stop();
      if (!mounted) {
        return;
      }
      if (_torchEnabled) {
        setState(() {
          _torchEnabled = false;
        });
      }
    }

    if (!mounted) {
      return;
    }

    final bool? confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (sheetContext) => _ScanResultSheet(
        code: rawValue,
        onConfirm: () => Navigator.of(sheetContext).pop(true),
        onScanAgain: () => Navigator.of(sheetContext).pop(false),
      ),
    );

    if (!mounted) {
      return;
    }

    if (confirmed == true) {
      Navigator.of(context).pop(rawValue);
      return;
    }

    setState(() {
      _isProcessing = false;
    });

    if (wasRunning) {
      await _controller.start();
    }
  }

  Future<void> _scanFromGallery() async {
    if (_isProcessing) {
      return;
    }

    try {
      final XFile? file = await _imagePicker.pickImage(
        source: ImageSource.gallery,
      );
      if (file == null) {
        return;
      }

      setState(() {
        _isProcessing = true;
      });

      final capture = await _controller.analyzeImage(
        file.path,
        formats: const [BarcodeFormat.qrCode],
      );

      if (!mounted) {
        return;
      }

      final rawValue = _extractRawValue(capture);
      if (rawValue == null) {
        setState(() {
          _isProcessing = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No QR code found in the selected image.'),
          ),
        );
        return;
      }

      await _handleScanResult(rawValue);
    } on MobileScannerException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Unable to process the image: ${error.errorCode.name}'),
        ),
      );
    } on Exception catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _isProcessing = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to open image: ${error.toString()}')),
      );
    }
  }

  Future<void> _toggleTorch() async {
    try {
      await _controller.toggleTorch();
      if (!mounted) {
        return;
      }
      setState(() {
        _torchEnabled = !_torchEnabled;
      });
    } on Exception catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to toggle flash: ${error.toString()}')),
      );
    }
  }

  Future<void> _switchCamera() async {
    await _controller.switchCamera();
    if (!mounted) {
      return;
    }
    setState(() {
      _cameraFacing = _cameraFacing == CameraFacing.back
          ? CameraFacing.front
          : CameraFacing.back;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Driver QR'),
        actions: [
          IconButton(
            tooltip: 'Scan from photo',
            icon: const Icon(Icons.photo_library_outlined),
            onPressed: _isProcessing ? null : _scanFromGallery,
          ),
          if (_lastCode != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Center(
                child: Text(
                  'Last scan: $_lastCode',
                  style: theme.textTheme.labelMedium,
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: AspectRatio(
                aspectRatio: 3 / 4,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      MobileScanner(
                        controller: _controller,
                        onDetect: _onDetect,
                      ),
                      _ScannerOverlay(),
                      if (_isProcessing)
                        Container(
                          color: Colors.black45,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const CircularProgressIndicator(),
                              const SizedBox(height: 12),
                              Text(
                                'Processing…',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    'Hold the driver’s QR code inside the frame to verify their assigned ride.',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: _isProcessing ? null : _toggleTorch,
                        icon: Icon(
                          _torchEnabled ? Icons.flash_on : Icons.flash_off,
                        ),
                        label: Text(_torchEnabled ? 'Flash on' : 'Flash off'),
                      ),
                      FilledButton.tonalIcon(
                        onPressed: _isProcessing ? null : _switchCamera,
                        icon: const Icon(Icons.cameraswitch),
                        label: Text(
                          _cameraFacing == CameraFacing.back
                              ? 'Rear camera'
                              : 'Front camera',
                        ),
                      ),
                      FilledButton.tonalIcon(
                        onPressed: _isProcessing ? null : _scanFromGallery,
                        icon: const Icon(Icons.photo_library_outlined),
                        label: const Text('From photos'),
                      ),
                    ],
                  ),
                  if (_lastCode != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Last scanned: $_lastCode',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.hintColor,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScannerOverlay extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final borderSize = 24.0;
        final borderWidth = 4.0;
        return CustomPaint(
          painter: _CornerBorderPainter(
            borderSize: borderSize,
            borderWidth: borderWidth,
          ),
        );
      },
    );
  }
}

class _CornerBorderPainter extends CustomPainter {
  _CornerBorderPainter({required this.borderSize, required this.borderWidth});

  final double borderSize;
  final double borderWidth;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = borderWidth
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(0, borderSize)
      ..lineTo(0, 0)
      ..lineTo(borderSize, 0)
      ..moveTo(size.width - borderSize, 0)
      ..lineTo(size.width, 0)
      ..lineTo(size.width, borderSize)
      ..moveTo(size.width, size.height - borderSize)
      ..lineTo(size.width, size.height)
      ..lineTo(size.width - borderSize, size.height)
      ..moveTo(borderSize, size.height)
      ..lineTo(0, size.height)
      ..lineTo(0, size.height - borderSize);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ScanResultSheet extends StatelessWidget {
  const _ScanResultSheet({
    required this.code,
    required this.onConfirm,
    required this.onScanAgain,
  });

  final String code;
  final VoidCallback onConfirm;
  final VoidCallback onScanAgain;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        bottom: 24 + MediaQuery.of(context).viewPadding.bottom,
        top: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.outlineVariant,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Driver QR detected',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  code,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Ensure this matches the driver ID shared by the mobility desk.',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: onConfirm,
              child: const Text('Confirm driver'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onScanAgain,
              child: const Text('Scan again'),
            ),
          ),
        ],
      ),
    );
  }
}
