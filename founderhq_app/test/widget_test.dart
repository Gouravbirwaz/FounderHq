import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:founderhq_app/main.dart';
import 'package:founderhq_app/core/providers/auth_provider.dart';

class MockAuthNotifier extends AuthNotifier {
  @override
  AuthState build() => const AuthState(isAuthenticated: false, isLoading: false);
}

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith(() => MockAuthNotifier()),
        ],
        child: const FounderHQApp(),
      ),
    );

    // Initial state is unauthenticated, so LoginView should render
    expect(find.text('Sign In'), findsWidgets);
  });
}
