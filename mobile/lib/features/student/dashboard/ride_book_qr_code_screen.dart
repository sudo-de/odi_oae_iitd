import 'package:flutter/material.dart';
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

    String? rawValue;
    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue;
      if (value != null && value.isNotEmpty) {
        rawValue = value;
        break;
      }
    }

    if (rawValue == null) {
      return;
    }

    setState(() {
      _isProcessing = true;
      _lastCode = rawValue;
    });

    await _controller.stop();

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
        code: rawValue!,
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

    await _controller.start();
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
        SnackBar(
          content: Text('Unable to toggle flash: ${error.toString()}'),
        ),
      );
    }
  }

  Future<void> _switchCamera() async {
    await _controller.switchCamera();
    if (!mounted) {
      return;
    }
    setState(() {
      _cameraFacing =
          _cameraFacing == CameraFacing.back ? CameraFacing.front : CameraFacing.back;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Driver QR'),
        actions: [
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: _toggleTorch,
                        icon: Icon(_torchEnabled ? Icons.flash_on : Icons.flash_off),
                        label: Text(_torchEnabled ? 'Flash on' : 'Flash off'),
                      ),
                      const SizedBox(width: 12),
                      FilledButton.tonalIcon(
                        onPressed: _switchCamera,
                        icon: const Icon(Icons.cameraswitch),
                        label: Text(
                          _cameraFacing == CameraFacing.back ? 'Rear camera' : 'Front camera',
                        ),
                      ),
                    ],
                  ),
                  if (_lastCode != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Last scanned: $_lastCode',
                      style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
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
          painter: _CornerBorderPainter(borderSize: borderSize, borderWidth: borderWidth),
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
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w600),
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
                  style: theme.textTheme.titleMedium?.copyWith(fontFamily: 'monospace'),
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

