import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../api_client.dart';
import 'market_provider.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final bool isBiometricLocked;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = true,
    this.isBiometricLocked = false,
    this.error,
    this.user,
    this.token,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    bool? isBiometricLocked,
    String? error,
    Map<String, dynamic>? user,
    String? token,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      isBiometricLocked: isBiometricLocked ?? this.isBiometricLocked,
      error: error,
      user: user ?? this.user,
      token: token ?? this.token,
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
    final biometricEnabled = await _storage.read(key: 'biometric_enabled') == 'true';

    if (token != null && token.isNotEmpty) {
      if (biometricEnabled) {
        // We have a token but need biometrics to "unlock"
        state = state.copyWith(
          isBiometricLocked: true,
          isLoading: false,
          token: token,
        );
      } else {
        // Auto-login if biometrics not enabled
        await _validateToken(token);
      }
    } else {
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  Future<void> _validateToken(String token) async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.get('/api/v1/auth/me');
      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        isBiometricLocked: false,
        user: res.data as Map<String, dynamic>,
        token: token,
      );
    } catch (e) {
      // Token invalid or expired
      await logout();
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
      
      // Store credentials for biometric login
      await _storage.write(key: 'saved_email', value: email);
      await _storage.write(key: 'saved_password', value: password);
      
      state = state.copyWith(isAuthenticated: true, isLoading: false, token: token);
      // Automatically enable biometrics after first successful login
      await _storage.write(key: 'biometric_enabled', value: 'true');
      
      // Fetch user details
      await _validateToken(token);
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

  Future<bool> loginWithBiometrics() async {
    if (state.isBiometricLocked && state.token != null) {
      print('Unlocking with stored JWT immediately...');
      
      // Immediately unlock the session for the user
      state = state.copyWith(
        isAuthenticated: true,
        isBiometricLocked: false,
        isLoading: false,
        error: null,
      );
      
      // Validate token and fetch user details in the background
      _validateToken(state.token!);
      return true;
    }

    // Fallback to credential-based biometric login if token is missing
    state = state.copyWith(isLoading: true, error: null);
    try {
      final email = await _storage.read(key: 'saved_email');
      final password = await _storage.read(key: 'saved_password');

      if (email == null || password == null) {
        state = state.copyWith(isLoading: false, error: 'Please log in manually first.');
        return false;
      }

      return await login(email, password);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Login failed');
      return false;
    }
  }

  Future<bool> isBiometricEnabled() async {
    return (await _storage.read(key: 'biometric_enabled')) == 'true';
  }

  Future<bool> hasSavedCredentials() async {
    final email = await _storage.read(key: 'saved_email');
    final password = await _storage.read(key: 'saved_password');
    return email != null && password != null;
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
