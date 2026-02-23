import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../api_client.dart';
import 'market_provider.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? user;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = true,
    this.error,
    this.user,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
    Map<String, dynamic>? user,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  @override
  AuthState build() {
    _initAuth();
    return const AuthState();
  }

  Future<void> _initAuth() async {
    final token = await _storage.read(key: 'jwt');
    if (token != null && token.isNotEmpty) {
      // Validate token by fetching 'me'
      try {
        final client = ref.read(apiClientProvider);
        final res = await client.dio.get('/api/v1/auth/me');
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: res.data as Map<String, dynamic>,
        );
      } catch (e) {
        // Token invalid or expired
        await _storage.delete(key: 'jwt');
        state = state.copyWith(isAuthenticated: false, isLoading: false);
      }
    } else {
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.post('/api/v1/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      final token = res.data['access_token'];
      await _storage.write(key: 'jwt', value: token);
      
      state = state.copyWith(isAuthenticated: true, isLoading: false);
      // Fetch user details
      await _initAuth();
      return true;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Login failed';
      state = state.copyWith(isLoading: false, error: detail.toString());
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> register(String name, String email, String phoneNumber, String password, String role) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.post('/api/v1/auth/register', data: {
        'name': name,
        'email': email,
        'phone_number': phoneNumber,
        'password': password,
        'role': role.toLowerCase(),
      });
      
      final token = res.data['access_token'];
      await _storage.write(key: 'jwt', value: token);
      
      state = state.copyWith(isAuthenticated: true, isLoading: false);
      await _initAuth();
      return true;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Registration failed';
      state = state.copyWith(isLoading: false, error: detail.toString());
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> updateProfile(String name, String email, String phoneNumber) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.put('/api/v1/auth/me', data: {
        'name': name,
        'email': email,
        'phone_number': phoneNumber,
      });
      
      state = state.copyWith(isAuthenticated: true, isLoading: false, user: res.data as Map<String, dynamic>);
      return true;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Update failed';
      state = state.copyWith(isLoading: false, error: detail.toString());
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> uploadAvatar(String imagePath) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(imagePath),
      });

      await client.dio.post(
        '/api/v1/auth/avatar',
        data: formData,
      );
      
      // Refresh user to get new avatar_url
      await _initAuth();
      return true;
    } on DioException catch (e) {
      final detail = e.response?.data?['detail'] ?? 'Avatar upload failed';
      state = state.copyWith(isLoading: false, error: detail.toString());
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt');
    state = const AuthState(isAuthenticated: false, isLoading: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
