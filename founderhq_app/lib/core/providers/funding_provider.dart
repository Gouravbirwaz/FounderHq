import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api_client.dart';
import 'market_provider.dart';

final fundingVettingProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, companyName) async {
  if (companyName.isEmpty) return {'verified': false, 'message': 'Company name required'};
  
  final client = ref.watch(apiClientProvider);
  final response = await client.dio.get('/api/v1/funding/vetting/$companyName');
  return response.data as Map<String, dynamic>;
});
