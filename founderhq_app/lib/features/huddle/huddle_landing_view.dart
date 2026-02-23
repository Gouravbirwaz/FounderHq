import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/huddle_client.dart';
import 'huddle_room_view.dart';
import '../../shared/custom_bottom_sheet.dart';

class HuddleLandingView extends ConsumerStatefulWidget {
  const HuddleLandingView({Key? key}) : super(key: key);

  @override
  ConsumerState<HuddleLandingView> createState() => _HuddleLandingViewState();
}

class _HuddleLandingViewState extends ConsumerState<HuddleLandingView> {
  final TextEditingController _codeController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  Future<void> _createHuddle(String type) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(huddleClientProvider);
      final room = await client.createRoom(type);
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => HuddleRoomView(roomId: room['roomCode']),
          ),
        );
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'Failed to create huddle. Service might be down.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _joinHuddle() async {
    final code = _codeController.text.trim();
    if (code.length != 8) {
      setState(() => _error = 'Enter a valid 8-character code');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(huddleClientProvider);
      final room = await client.getRoom(code);
      if (room['active'] == true) {
        if (mounted) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => HuddleRoomView(roomId: room['roomCode']),
            ),
          );
        }
      } else {
        setState(() => _error = 'This huddle has already ended');
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'Room not found or invalid code');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Huddle', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Huddle. Connect. Build.',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: -1,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'High-quality voice and video rooms for effortless collaboration.',
              style: TextStyle(color: Colors.grey, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),

            // Create Section
            _buildCard(
              title: 'Create a Huddle',
              subtitle: 'Start a new session and invite your team.',
              icon: Icons.add_circle_outline,
              color: AppTheme.techBlue,
              child: Column(
                children: [
                  _actionButton(
                    label: 'Start Video Huddle',
                    icon: Icons.videocam,
                    onPressed: () => _createHuddle('video'),
                    primary: true,
                  ),
                  const SizedBox(height: 12),
                  _actionButton(
                    label: 'Start Voice Only',
                    icon: Icons.mic,
                    onPressed: () => _createHuddle('voice'),
                    primary: false,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Join Section
            _buildCard(
              title: 'Join a Huddle',
              subtitle: 'Enter a unique 8-character room code.',
              icon: Icons.group_outlined,
              color: AppTheme.successGreen,
              child: Column(
                children: [
                  TextField(
                    controller: _codeController,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'Enter 8-digit code',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                      prefixIcon: const Icon(Icons.tag, color: Colors.grey, size: 20),
                      filled: true,
                      fillColor: Colors.black.withOpacity(0.3),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                    textCapitalization: TextCapitalization.characters,
                    maxLength: 8,
                  ),
                  const SizedBox(height: 12),
                  _actionButton(
                    label: 'Join Huddle',
                    icon: Icons.arrow_forward,
                    onPressed: _joinHuddle,
                    primary: true,
                    color: Colors.white,
                    textColor: Colors.black,
                  ),
                ],
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.2)),
                ),
                child: Text(
                  _error!,
                  style: const TextStyle(color: Colors.redAccent, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ),
            ],

            if (_isLoading)
              const Padding(
                padding: EdgeInsets.only(top: 24),
                child: Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }

  Widget _actionButton({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
    bool primary = true,
    Color? color,
    Color? textColor,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isLoading ? null : onPressed,
        icon: Icon(icon, size: 18),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          backgroundColor: color ?? (primary ? AppTheme.techBlue : Colors.white.withOpacity(0.05)),
          foregroundColor: textColor ?? (primary ? Colors.black : Colors.white),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: primary ? 4 : 0,
        ),
      ),
    );
  }
}
