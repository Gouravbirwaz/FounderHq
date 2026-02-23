import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api_client.dart';
import 'market_provider.dart';

final pocListProvider = FutureProvider((ref) async {
  final client = ref.watch(apiClientProvider);
  final response = await client.dio.get('/api/v1/pocs/');
  return response.data as List<dynamic>;
});

class PocActionNotifier extends Notifier<AsyncValue<void>> {
  @override
  AsyncValue<void> build() {
    return const AsyncValue.data(null);
  }

  Future<void> upvotePoc(String pocId) async {
    state = const AsyncValue.loading();
    try {
      final client = ref.read(apiClientProvider);
      await client.dio.post('/api/v1/pocs/$pocId/upvote');
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final pocActionProvider = NotifierProvider<PocActionNotifier, AsyncValue<void>>(() {
  return PocActionNotifier();
});
