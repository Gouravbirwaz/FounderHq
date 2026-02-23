import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SocketService {
  late IO.Socket _socket;
  final String serverUrl;

  SocketService({this.serverUrl = const String.fromEnvironment('HUDDLE_URL', defaultValue: 'https://unengaged-slatier-anibal.ngrok-free.dev')}) {
    _initSocket();
  }

  void _initSocket() {
    _socket = IO.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket.onConnect((_) {
      debugPrint('Socket Connected');
    });

    _socket.onDisconnect((_) {
      debugPrint('Socket Disconnected');
    });

    // Market Alerts
    _socket.on('price_alert', (data) {
      debugPrint('Received price alert: $data');
    });

    // Huddle / Direct Messages
    _socket.on('receive-message', (data) {
      debugPrint('Received message: $data');
    });

    _socket.on('message-sent', (data) {
      debugPrint('Message sent confirmation: $data');
    });
  }

  void sendMessage(String receiverId, String text) {
    _socket.emit('send-message', {
      'receiverId': receiverId,
      'text': text,
    });
  }

  void connect(String token) {
    _socket.io.options?['auth'] = {'token': token};
    if (!_socket.connected) {
      _socket.connect();
    }
  }

  void disconnect() {
    _socket.disconnect();
  }

  IO.Socket get socket => _socket;
}

final socketServiceProvider = Provider((ref) => SocketService());
