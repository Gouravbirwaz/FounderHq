import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

class WebRTCService {
  static Future<bool> requestPermissions() async {
    Map<Permission, PermissionStatus> statuses = await [
      Permission.camera,
      Permission.microphone,
    ].request();

    if (statuses[Permission.camera]!.isGranted && 
        statuses[Permission.microphone]!.isGranted) {
      return true;
    }
    return false;
  }
  final IO.Socket socket;
  RTCPeerConnection? peerConnection;
  MediaStream? localStream;
  MediaStream? remoteStream;

  RTCVideoRenderer localRenderer = RTCVideoRenderer();
  RTCVideoRenderer remoteRenderer = RTCVideoRenderer();

  bool isMuted = false;
  bool isVideoEnabled = true;

  WebRTCService(this.socket);

  Future<void> initRenderers() async {
    await localRenderer.initialize();
    await remoteRenderer.initialize();
  }

  Future<void> openUserMedia(bool isVideoMode) async {
    final stream = await navigator.mediaDevices.getUserMedia({
      'video': isVideoMode,
      'audio': true,
    });

    localStream = stream;
    localRenderer.srcObject = localStream;
  }

  Future<void> joinRoom(String roomId) async {
    final configuration = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
      ]
    };

    peerConnection = await createPeerConnection(configuration);

    peerConnection?.onIceCandidate = (RTCIceCandidate candidate) {
      // For simple 1-on-1, eventually we need 'to' socketId
      // But let's at least broadcast or send to room if server allows
      socket.emit('ice-candidate', {
        'roomCode': roomId,
        'candidate': {
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        }
      });
    };

    peerConnection?.onTrack = (RTCTrackEvent event) {
      if (event.streams.isNotEmpty) {
        remoteStream = event.streams[0];
        remoteRenderer.srcObject = remoteStream;
      }
    };

    localStream?.getTracks().forEach((track) {
      peerConnection?.addTrack(track, localStream!);
    });

    // Emitting join event
    socket.emit('join-room', {'roomCode': roomId});
  }

  void toggleMute() {
    if (localStream != null) {
      isMuted = !isMuted;
      localStream!.getAudioTracks()[0].enabled = !isMuted;
    }
  }

  void toggleVideo() {
    if (localStream != null) {
      isVideoEnabled = !isVideoEnabled;
      localStream!.getVideoTracks()[0].enabled = isVideoEnabled;
    }
  }

  Future<void> switchCamera() async {
    if (localStream != null) {
      final track = localStream!.getVideoTracks()[0];
      await Helper.switchCamera(track);
    }
  }

  Future<void> disposeRenderers() async {
    await localRenderer.dispose();
    await remoteRenderer.dispose();
    localStream?.dispose();
    remoteStream?.dispose();
    peerConnection?.close();
  }
}
