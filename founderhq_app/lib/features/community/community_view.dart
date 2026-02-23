import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/community_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/huddle_client.dart';
import '../../services/socket_service.dart';
import 'direct_message_view.dart';

class CommunityView extends ConsumerWidget {
  const CommunityView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(communityPostsProvider);
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Community', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.techBlue)),
        actions: [
          IconButton(
            icon: const Icon(Icons.mail_outline, color: Colors.white),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const DirectMessageView()));
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(communityPostsProvider),
        child: postsAsync.when(
          data: (posts) {
            if (posts.isEmpty) {
              return const Center(child: Text('No posts yet. Start the conversation!', style: TextStyle(color: Colors.grey)));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: posts.length,
              itemBuilder: (context, index) {
                final post = posts[index];
                return _PostCard(post: post);
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
          error: (err, stack) => Center(child: Text('Failed to load posts', style: TextStyle(color: Colors.redAccent.withOpacity(0.8)))),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.techBlue,
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () => _showCreatePostSheet(context, ref),
      ),
    );
  }

  void _showCreatePostSheet(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E1E1E),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16, right: 16, top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Create Post', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              maxLines: 5,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: "What's on your mind, founder?",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                fillColor: Colors.black.withOpacity(0.3),
                filled: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                if (controller.text.trim().isEmpty) return;
                final success = await ref.read(communityNotifierProvider.notifier).createPost(controller.text.trim());
                if (success && context.mounted) Navigator.pop(context);
              },
              child: const Text('Post'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _PostCard extends ConsumerWidget {
  final Map<String, dynamic> post;
  const _PostCard({required this.post});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hasLiked = post['has_liked'] ?? false;
    final likesCount = post['likes_count'] ?? 0;
    final authorName = post['author_name'] ?? 'Anonymous';
    final timestamp = post['timestamp'] ?? '';
    final content = post['content'] ?? '';
    final role = post['author_role'] ?? 'Founder';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppTheme.techBlue.withOpacity(0.2),
                child: Text(authorName[0], style: const TextStyle(color: AppTheme.techBlue, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(authorName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(role.toUpperCase(), style: const TextStyle(color: AppTheme.techBlue, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              Text(
                'Just now', // Ideally format timestamp
                style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(content, style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.5)),
          const SizedBox(height: 16),
          Row(
            children: [
              GestureDetector(
                onTap: () => ref.read(communityNotifierProvider.notifier).likePost(post['id'].toString()),
                child: Row(
                  children: [
                    Icon(
                      hasLiked ? Icons.favorite : Icons.favorite_border,
                      color: hasLiked ? Colors.redAccent : Colors.white.withOpacity(0.3),
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(likesCount.toString(), style: TextStyle(color: Colors.white.withOpacity(0.3))),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              Icon(Icons.chat_bubble_outline, color: Colors.white.withOpacity(0.3), size: 20),
              const SizedBox(width: 4),
              Text(post['comments_count']?.toString() ?? '0', style: TextStyle(color: Colors.white.withOpacity(0.3))),
              const Spacer(),
              IconButton(
                icon: Icon(Icons.mail_outline, color: Colors.white.withOpacity(0.3), size: 20),
                onPressed: () async {
                  try {
                    final client = ref.read(huddleClientProvider);
                    final res = await client.dio.post('/messages/conversations', data: {
                      'participantId': post['author_id'].toString(),
                    });
                    final conv = res.data;
                    if (context.mounted) {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => ChatView(
                        receiverName: authorName, 
                        receiverId: post['author_id'].toString(),
                        conversationId: conv['_id'],
                      )));
                    }
                  } catch (e) {
                    // Handle error
                  }
                },
              ),
              const SizedBox(width: 8),
              Icon(Icons.share_outlined, color: Colors.white.withOpacity(0.3), size: 20),
            ],
          ),
        ],
      ),
    );
  }
}
