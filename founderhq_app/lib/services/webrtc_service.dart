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
  String? _roomId;
  String? _targetSocketId;
  final List<RTCIceCandidate> _localIceCandidatesBuffer = [];
  final List<Map<String, dynamic>> _remoteIceCandidatesBuffer = [];

  RTCVideoRenderer localRenderer = RTCVideoRenderer();
  RTCVideoRenderer remoteRenderer = RTCVideoRenderer();

  bool isMuted = false;
  bool isVideoEnabled = true;

  Function? onRemoteStream;

  WebRTCService(this.socket) {
    _setupSocketListeners();
  }

  void _setupSocketListeners() {
    // Clear any previous listeners to avoid duplicates
    socket.off('user-joined');
    socket.off('offer');
    socket.off('answer');
    socket.off('ice-candidate');

    socket.on('user-joined', (data) async {
      final remoteSocketId = data['socketId'];
      print('User joined: $remoteSocketId. Initiating offer...');
      _targetSocketId = remoteSocketId;
      await _createOffer();
    });

    socket.on('offer', (data) async {
      final from = data['from'];
      final offer = data['offer'];
      print('Received offer from: $from');
      _targetSocketId = from;
      await _handleOffer(offer);
    });

    socket.on('answer', (data) async {
      final from = data['from'];
      final answer = data['answer'];
      print('Received answer from: $from');
      await _handleAnswer(answer);
    });

    socket.on('ice-candidate', (data) async {
      final from = data['from'];
      final candidateMap = data['candidate'];
      print('Received ICE candidate from: $from');
      if (peerConnection != null && 
          peerConnection!.signalingState != RTCSignalingState.RTCSignalingStateClosed &&
          (await peerConnection!.getRemoteDescription()) != null) {
        await _handleIceCandidate(candidateMap);
      } else {
        print('Buffering remote ICE candidate...');
        _remoteIceCandidatesBuffer.add(candidateMap);
      }
    });

    socket.on('room-joined', (data) async {
      final participants = data['participants'] as List;
      print('Room joined. Found ${participants.length} existing participants.');
      if (participants.isNotEmpty) {
        // Multi-party would need multiple connections, but for 1-on-1 we take the first
        final firstPeer = participants[0];
        _targetSocketId = firstPeer['socketId'];
        print('Target peer established: $_targetSocketId. Initiating offer...');
        await _createOffer();
      }
    });
  }

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
    _roomId = roomId;
    final configuration = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
        {'urls': 'stun:stun1.l.google.com:19302'},
        {'urls': 'stun:stun2.l.google.com:19302'},
        {'urls': 'stun:stun3.l.google.com:19302'},
        {'urls': 'stun:stun4.l.google.com:19302'},
      ]
    };

    peerConnection = await createPeerConnection(configuration);

    peerConnection?.onIceCandidate = (RTCIceCandidate candidate) {
      print('Local ICE candidate found: ${candidate.candidate?.substring(0, 20)}...');
      if (_targetSocketId != null) {
        _sendIceCandidate(candidate);
      } else {
        print('Buffering local ICE candidate (no target yet)...');
        _localIceCandidatesBuffer.add(candidate);
      }
    };

    peerConnection?.onTrack = (RTCTrackEvent event) {
      print('Remote track received: ${event.track.kind}');
      if (event.streams.isNotEmpty) {
        remoteStream = event.streams[0];
        remoteRenderer.srcObject = remoteStream;
        if (onRemoteStream != null) onRemoteStream!();
      }
    };

    localStream?.getTracks().forEach((track) {
      peerConnection?.addTrack(track, localStream!);
    });

    // Emitting join event
    socket.emit('join-room', {'roomCode': roomId});
  }

  Future<void> _createOffer() async {
    if (peerConnection == null) return;
    RTCSessionDescription offer = await peerConnection!.createOffer({
      'offerToReceiveVideo': 1,
      'offerToReceiveAudio': 1,
    });
    await peerConnection!.setLocalDescription(offer);
    
    socket.emit('offer', {
      'to': _targetSocketId,
      'offer': {
        'type': offer.type,
        'sdp': offer.sdp,
      }
    });

    _sendBufferedLocalCandidates();
  }

  Future<void> _handleOffer(Map<String, dynamic> offerMap) async {
    if (peerConnection == null) return;
    
    await peerConnection!.setRemoteDescription(
      RTCSessionDescription(offerMap['sdp'], offerMap['type']),
    );

    RTCSessionDescription answer = await peerConnection!.createAnswer({
      'offerToReceiveVideo': 1,
      'offerToReceiveAudio': 1,
    });
    await peerConnection!.setLocalDescription(answer);

    socket.emit('answer', {
      'to': _targetSocketId,
      'answer': {
        'type': answer.type,
        'sdp': answer.sdp,
      }
    });

    _sendBufferedLocalCandidates();
    _processBufferedRemoteCandidates();
  }

  Future<void> _handleAnswer(Map<String, dynamic> answerMap) async {
    if (peerConnection == null) return;
    await peerConnection!.setRemoteDescription(
      RTCSessionDescription(answerMap['sdp'], answerMap['type']),
    );
    _processBufferedRemoteCandidates();
  }

  void _sendIceCandidate(RTCIceCandidate candidate) {
    socket.emit('ice-candidate', {
      'to': _targetSocketId,
      'candidate': {
        'candidate': candidate.candidate,
        'sdpMid': candidate.sdpMid,
        'sdpMLineIndex': candidate.sdpMLineIndex,
      }
    });
  }

  void _sendBufferedLocalCandidates() {
    if (_targetSocketId == null) return;
    print('Sending ${_localIceCandidatesBuffer.length} buffered local candidates...');
    for (var candidate in _localIceCandidatesBuffer) {
      _sendIceCandidate(candidate);
    }
    _localIceCandidatesBuffer.clear();
  }

  void _processBufferedRemoteCandidates() {
    print('Processing ${_remoteIceCandidatesBuffer.length} buffered remote candidates...');
    for (var candidateMap in _remoteIceCandidatesBuffer) {
      _handleIceCandidate(candidateMap);
    }
    _remoteIceCandidatesBuffer.clear();
  }

  Future<void> _handleIceCandidate(Map<String, dynamic> candidateMap) async {
    if (peerConnection == null) {
      print('Warning: peerConnection is null when receiving ICE candidate');
      return;
    }
    print('Applying remote ICE candidate...');
    try {
      await peerConnection!.addCandidate(
        RTCIceCandidate(
          candidateMap['candidate'],
          candidateMap['sdpMid'],
          candidateMap['sdpMLineIndex'],
        ),
      );
    } catch (e) {
      print('Error adding remote ICE candidate: $e');
    }
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
