import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api_client.dart';
import 'market_provider.dart';

final communityPostsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.dio.get('/api/v1/community/');
  return List<Map<String, dynamic>>.from(response.data);
});

class CommunityNotifier extends Notifier<AsyncValue<void>> { 
  @override
  AsyncValue<void> build() {
    return const AsyncValue.data(null);
  }

  Future<bool> createPost(String content, {String? imagePath}) async {
    final api = ref.read(apiClientProvider);
    state = const AsyncValue.loading();
    try {
      // Create FormData
      final formData = FormData.fromMap({
        'content': content,
        'tags': '[]',
      });

      if (imagePath != null) {
        formData.files.add(MapEntry(
          'image',
          await MultipartFile.fromFile(imagePath),
        ));
      }

      await api.dio.post(
        '/api/v1/community/',
        data: formData,
      );
      
      ref.invalidate(communityPostsProvider);
      state = const AsyncValue.data(null);
      return true;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      return false;
    }
  }

  Future<void> likePost(String postId) async {
    final api = ref.read(apiClientProvider);
    try {
      await api.dio.post('/api/v1/community/$postId/like');
      ref.invalidate(communityPostsProvider);
    } catch (e) {
      // Silent error for like failing
    }
  }
}

final communityNotifierProvider = NotifierProvider<CommunityNotifier, AsyncValue<void>>(CommunityNotifier.new);
