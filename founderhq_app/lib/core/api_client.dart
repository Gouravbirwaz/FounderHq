import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio dio;
  final FlutterSecureStorage _storage;

  ApiClient({Dio? client, FlutterSecureStorage? storage})
      : dio = client ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage() {
    dio.options.baseUrl = const String.fromEnvironment('API_URL', defaultValue: 'https://unengaged-slatier-anibal.ngrok-free.dev');
    dio.options.connectTimeout = const Duration(seconds: 15);
    dio.options.receiveTimeout = const Duration(seconds: 15);

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          // Add logic to refresh tokens if implemented
          return handler.next(e);
        },
      ),
    );
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});
