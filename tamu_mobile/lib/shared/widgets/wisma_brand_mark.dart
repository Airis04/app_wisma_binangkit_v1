import 'package:flutter/material.dart';

import '../../config/theme.dart';

class WismaBrandMark extends StatelessWidget {
  const WismaBrandMark({
    super.key,
    this.compact = false,
    this.color = AppColors.navy,
    this.textColor,
  });

  final bool compact;
  final Color color;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    final resolvedTextColor = textColor ?? color;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: compact ? 78 : 118,
          height: compact ? 54 : 78,
          child: CustomPaint(painter: _WismaLogoPainter(color)),
        ),
        if (!compact) ...[
          const SizedBox(height: 8),
          Text(
            'Wisma Binangkit',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: resolvedTextColor,
              fontSize: 25,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.6,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            'HOMESTAY PANGANDARAN',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: resolvedTextColor.withValues(alpha: 0.72),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 3,
            ),
          ),
        ],
      ],
    );
  }
}

class _WismaLogoPainter extends CustomPainter {
  const _WismaLogoPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final w = size.width;
    final h = size.height;

    final roof = Path()
      ..moveTo(w * 0.12, h * 0.48)
      ..lineTo(w * 0.43, h * 0.22)
      ..lineTo(w * 0.62, h * 0.48);
    canvas.drawPath(roof, paint..strokeWidth = w * 0.045);

    final roofLine = Path()
      ..moveTo(w * 0.43, h * 0.22)
      ..quadraticBezierTo(w * 0.52, h * 0.34, w * 0.62, h * 0.48);
    canvas.drawPath(roofLine, paint..strokeWidth = w * 0.026);

    final waveTop = Path()
      ..moveTo(w * 0.08, h * 0.72)
      ..cubicTo(w * 0.28, h * 0.58, w * 0.45, h * 0.66, w * 0.62, h * 0.74)
      ..cubicTo(w * 0.76, h * 0.81, w * 0.86, h * 0.72, w * 0.96, h * 0.64);
    canvas.drawPath(waveTop, paint..strokeWidth = w * 0.03);

    final waveBottom = Path()
      ..moveTo(w * 0.18, h * 0.84)
      ..cubicTo(w * 0.38, h * 0.76, w * 0.52, h * 0.86, w * 0.68, h * 0.88)
      ..cubicTo(w * 0.79, h * 0.9, w * 0.9, h * 0.84, w * 0.99, h * 0.78);
    canvas.drawPath(waveBottom, paint..strokeWidth = w * 0.034);

    final leafPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final stem = Path()
      ..moveTo(w * 0.58, h * 0.49)
      ..cubicTo(w * 0.66, h * 0.28, w * 0.76, h * 0.18, w * 0.9, h * 0.1);
    canvas.drawPath(stem, paint..strokeWidth = w * 0.022);

    for (var i = 0; i < 7; i++) {
      final t = i / 6;
      final cx = w * (0.61 + t * 0.25);
      final cy = h * (0.43 - t * 0.28);
      final length = w * (0.16 - t * 0.045);
      final angle = -0.85 + t * 0.3;
      canvas.save();
      canvas.translate(cx, cy);
      canvas.rotate(angle);
      final leaf = Path()
        ..moveTo(0, 0)
        ..quadraticBezierTo(length * 0.42, -h * 0.085, length, 0)
        ..quadraticBezierTo(length * 0.4, h * 0.035, 0, 0);
      canvas.drawPath(leaf, leafPaint);
      canvas.restore();
    }

    final windowPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    final square = w * 0.045;
    final startX = w * 0.42;
    final startY = h * 0.42;
    for (final dx in [0.0, square * 1.35]) {
      for (final dy in [0.0, square * 1.35]) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromLTWH(startX + dx, startY + dy, square, square),
            Radius.circular(square * 0.12),
          ),
          windowPaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _WismaLogoPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
