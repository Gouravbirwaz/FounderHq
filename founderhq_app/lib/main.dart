import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/auth_provider.dart';
import 'features/main_view.dart';
import 'features/auth/login_view.dart';

void main() {
  runApp(const ProviderScope(child: FounderHQApp()));
}

class FounderHQApp extends StatelessWidget {
  const FounderHQApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FounderHQ',
      theme: AppTheme.darkTheme,
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class AuthWrapper extends ConsumerWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState.isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.charcoal,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text('FounderHQ', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
              SizedBox(height: 24),
              CircularProgressIndicator(color: AppTheme.techBlue),
            ],
          ),
        ),
      );
    }

    if (authState.isAuthenticated && !authState.isBiometricLocked) {
      return const MainView();
    }

    return const LoginView();
  }
}
