import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../../core/theme/app_theme.dart';
import '../../services/webrtc_service.dart';
import '../../services/socket_service.dart';
import '../community/direct_message_view.dart';

class HuddleRoomView extends ConsumerStatefulWidget {
  final String roomId;
  
  const HuddleRoomView({Key? key, required this.roomId}) : super(key: key);

  @override
  ConsumerState<HuddleRoomView> createState() => _HuddleRoomViewState();
}

class _HuddleRoomViewState extends ConsumerState<HuddleRoomView> {
  late WebRTCService _webRTCService;
  bool _isInit = false;

  @override
  void initState() {
    super.initState();
    _connectAndInit();
  }

  Future<void> _connectAndInit() async {
    final socketService = ref.read(socketServiceProvider);
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'jwt');

    if (token != null) {
      socketService.connect(token);
    }

    final hasPermissions = await WebRTCService.requestPermissions();
    if (!hasPermissions) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Camera and Microphone permissions are required for Huddle')),
        );
        Navigator.pop(context);
      }
      return;
    }
    
    _webRTCService = WebRTCService(socketService.socket);
    await _initWebRTC();
    if (mounted) setState(() => _isInit = true);
  }

  Future<void> _initWebRTC() async {
    await _webRTCService.initRenderers();
    await _webRTCService.openUserMedia(true);
    await _webRTCService.joinRoom(widget.roomId);
  }

  @override
  void dispose() {
    _webRTCService.disposeRenderers();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInit) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Remote Video (Full Screen Grid)
            Positioned.fill(
              child: RTCVideoView(
                _webRTCService.remoteRenderer,
                objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
              ),
            ),
            
            // Local Video (PiP)
            Positioned(
              top: 16,
              right: 16,
              width: 120,
              height: 160,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.techBlue, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.5),
                      blurRadius: 10,
                    )
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: RTCVideoView(
                    _webRTCService.localRenderer,
                    mirror: true,
                    objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                  ),
                ),
              ),
            ),

            // Top Bar
            Positioned(
              top: 16,
              left: 16,
              child: InkWell(
                onTap: () => Navigator.pop(context),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_downward, color: Colors.white),
                ),
              ),
            ),

            // Bottom Controls
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _controlButton(
                    icon: _webRTCService.isMuted ? Icons.mic_off : Icons.mic,
                    color: _webRTCService.isMuted ? Colors.red : Colors.white24,
                    onTap: () {
                      setState(() {
                        _webRTCService.toggleMute();
                      });
                    },
                  ),
                  _controlButton(
                    icon: Icons.flip_camera_ios,
                    color: Colors.white24,
                    onTap: () async {
                      await _webRTCService.switchCamera();
                      setState(() {});
                    },
                  ),
                  _controlButton(
                    icon: _webRTCService.isVideoEnabled ? Icons.videocam : Icons.videocam_off,
                    color: _webRTCService.isVideoEnabled ? Colors.white24 : Colors.red,
                    onTap: () {
                      setState(() {
                        _webRTCService.toggleVideo();
                      });
                    },
                  ),
                  _controlButton(
                    icon: Icons.call_end,
                    color: Colors.red,
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _controlButton({required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 28),
      ),
    );
  }
}
