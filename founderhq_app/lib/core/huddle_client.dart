import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class HuddleClient {
  final Dio dio;
  final FlutterSecureStorage _storage;

  HuddleClient({Dio? client, FlutterSecureStorage? storage})
      : dio = client ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage() {
    dio.options.baseUrl = const String.fromEnvironment('HUDDLE_URL', defaultValue: 'https://unengaged-slatier-anibal.ngrok-free.dev');
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
      ),
    );
  }

  Future<Map<String, dynamic>> createRoom(String type) async {
    final res = await dio.post('/rooms/create', data: {'type': type});
    return res.data;
  }

  Future<Map<String, dynamic>> getRoom(String code) async {
    final res = await dio.get('/rooms/${code.toUpperCase()}');
    return res.data;
  }
}

final huddleClientProvider = Provider((ref) => HuddleClient());
