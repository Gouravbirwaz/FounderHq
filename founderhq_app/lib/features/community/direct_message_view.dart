import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../services/socket_service.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/huddle_client.dart';

// Provider to manage socket state for messages
// Moved to socket_service.dart

final conversationsProvider = FutureProvider((ref) async {
  final client = ref.read(huddleClientProvider);
  final res = await client.dio.get('/messages/conversations');
  return res.data as List;
});

class DirectMessageView extends ConsumerWidget {
  const DirectMessageView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.techBlue)),
      ),
      body: conversationsAsync.when(
        data: (conversations) {
          if (conversations.isEmpty) {
            return const Center(child: Text('No conversations yet.', style: TextStyle(color: Colors.grey)));
          }
          return ListView.builder(
            itemCount: conversations.length,
            itemBuilder: (context, index) {
              final conv = conversations[index];
              final otherUser = conv['otherParticipant'] ?? {};
              final name = otherUser['name'] ?? 'Unknown';
              final lastMsg = conv['lastMessage']?['text'] ?? 'No messages yet';
              final time = conv['updatedAt'] != null 
                ? DateTime.parse(conv['updatedAt']).toLocal().toString().substring(11, 16) 
                : '';

              return ListTile(
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => ChatView(
                    receiverName: name, 
                    receiverId: otherUser['id'] ?? '',
                    conversationId: conv['_id'],
                  )));
                },
                leading: CircleAvatar(
                  backgroundColor: AppTheme.techBlue.withOpacity(0.1),
                  child: Text(name.isNotEmpty ? name[0] : '?', style: const TextStyle(color: AppTheme.techBlue)),
                ),
                title: Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                subtitle: Text(lastMsg, style: const TextStyle(color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: Text(time, style: const TextStyle(color: Colors.white24, fontSize: 12)),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.redAccent))),
      ),
    );
  }
}

class ChatView extends ConsumerStatefulWidget {
  final String receiverName;
  final String receiverId;
  final String conversationId;
  const ChatView({Key? key, required this.receiverName, required this.receiverId, required this.conversationId}) : super(key: key);

  @override
  ConsumerState<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends ConsumerState<ChatView> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  late SocketService _socketService;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _socketService = ref.read(socketServiceProvider);
    _initChat();
  }

  Future<void> _initChat() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'jwt');
    if (token != null) {
      _socketService.connect(token);
    }
    
    // Fetch History
    try {
      final client = ref.read(huddleClientProvider);
      final res = await client.dio.get('/messages/conversations/${widget.conversationId}/messages');
      if (mounted) {
        setState(() {
          _messages.addAll(List<Map<String, dynamic>>.from(res.data));
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }

    _socketService.socket.on('receive-message', (data) {
      if (mounted) {
        final newMsg = Map<String, dynamic>.from(data);
        if (newMsg['conversationId'] == widget.conversationId) {
          setState(() {
            _messages.add(newMsg);
          });
        }
      }
    });

    _socketService.socket.on('message-sent', (data) {
       // Confirmation handled if needed, usually just local update is enough
    });
  }

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;
    
    final messageData = {
      'conversationId': widget.conversationId,
      'receiverId': widget.receiverId,
      'text': _controller.text.trim(),
    };

    _socketService.socket.emit('send-message', messageData);
    
    // Optimistic Update
    setState(() {
      _messages.add({
        'senderId': ref.read(authProvider).user?['id'],
        'receiverId': widget.receiverId,
        'text': _controller.text.trim(),
        'timestamp': DateTime.now().toIso8601String(),
      });
      _controller.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.receiverName, style: const TextStyle(color: Colors.white, fontSize: 16)),
        centerTitle: false,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.techBlue))
        : Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              reverse: true, // Show latest at bottom
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[_messages.length - 1 - index];
                final isMe = msg['senderId'] == ref.read(authProvider).user?['id'];

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isMe ? AppTheme.techBlue : const Color(0xFF2A2A2A),
                      borderRadius: BorderRadius.circular(20).copyWith(
                        bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(20),
                        bottomLeft: isMe ? const Radius.circular(20) : const Radius.circular(0),
                      ),
                    ),
                    child: Text(
                      msg['text'] ?? '',
                      style: TextStyle(color: isMe ? Colors.black : Colors.white70),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.only(left: 16, right: 8, top: 8, bottom: 24),
            color: const Color(0xFF1E1E1E),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    maxLines: null,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: AppTheme.techBlue),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
