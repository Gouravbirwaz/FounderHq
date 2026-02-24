import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double padding;

  const GlassCard({
    Key? key,
    required this.child,
    this.padding = 32.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(32.0),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20.0, sigmaY: 20.0),
        child: Container(
          padding: EdgeInsets.all(padding),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(32.0),
            border: Border.all(
              color: Colors.white.withOpacity(0.15),
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 40,
                offset: const Offset(0, 20),
              ),
              // Inner glowing effect simulation
              BoxShadow(
                color: AppTheme.techBlue.withOpacity(0.08),
                blurRadius: 30,
                spreadRadius: -10,
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

class GlowingBackground extends StatefulWidget {
  final Widget child;

  const GlowingBackground({Key? key, required this.child}) : super(key: key);

  @override
  State<GlowingBackground> createState() => _GlowingBackgroundState();
}

class _GlowingBackgroundState extends State<GlowingBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Dark base
        Container(color: const Color(0xFF0F172A)), // Richer charcoal
        
        // Tech Blue Radial Blob Top Left
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Positioned(
              top: -150 + (30 * _controller.value),
              left: -150 - (20 * _controller.value),
              child: Transform.scale(
                scale: 1.0 + (0.1 * _controller.value),
                child: child,
              ),
            );
          },
          child: Container(
            width: 450,
            height: 450,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.techBlue.withOpacity(0.18),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 120, sigmaY: 120),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        
        // Success Green Radial Blob Bottom Right
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Positioned(
              bottom: -150 - (40 * _controller.value),
              right: -100 + (30 * _controller.value),
              child: Transform.scale(
                scale: 1.0 + (0.15 * (1.0 - _controller.value)),
                child: child,
              ),
            );
          },
          child: Container(
            width: 500,
            height: 500,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF38BDF8).withOpacity(0.12), // Deep sky blue instead of green for tech feel
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 120, sigmaY: 120),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        
        // Dot Grid Overlay (More subtle)
        Positioned.fill(
          child: Opacity(
            opacity: 0.05,
            child: IgnorePointer(
              child: CustomPaint(
                painter: _DotGridPainter(),
              ),
            ),
          ),
        ),

        // Main Content
        SafeArea(child: widget.child),
      ],
    );
  }
}

class _DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.0
      ..strokeCap = StrokeCap.round;

    const double spacing = 30.0;
    
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawPoints(PointMode.points, [Offset(x, y)], paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
