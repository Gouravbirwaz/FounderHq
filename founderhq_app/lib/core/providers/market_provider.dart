import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../api_client.dart';

final marketSnapshotProvider = FutureProvider((ref) async {
  final client = ref.watch(apiClientProvider);
  final response = await client.dio.get('/api/v1/market/snapshot');
  return response.data;
});

final marketStocksProvider = FutureProvider((ref) async {
  final client = ref.watch(apiClientProvider);
  final response = await client.dio.get('/api/v1/market/stocks');
  return response.data as List<dynamic>;
});

final marketNewsProvider = FutureProvider((ref) async {
  final client = ref.watch(apiClientProvider);
  final response = await client.dio.get('/api/v1/market/news');
  return response.data as List<dynamic>;
});

final marketLiveSnapshotProvider = StreamProvider<Map<String, dynamic>>((ref) {
  final baseUrl = ref.watch(apiClientProvider).dio.options.baseUrl;
  final wsUrl = baseUrl.replaceAll('http', 'ws') + '/ws/market';
  
  final channel = WebSocketChannel.connect(Uri.parse(wsUrl));
  
  ref.onDispose(() => channel.sink.close());
  
  return channel.stream.map((event) {
    final decoded = jsonDecode(event);
    if (decoded['type'] == 'tick') {
      final dataMap = decoded['data'] as Map<String, dynamic>;
      final List<Map<String, dynamic>> stocks = [];
      dataMap.forEach((ticker, info) {
        stocks.add({
          'ticker': ticker,
          ...info as Map<String, dynamic>,
        });
      });
      return {'stocks': stocks};
    }
    return {'stocks': <Map<String, dynamic>>[]};
  });
});
