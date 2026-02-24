import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

class BiometricService {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<bool> isBiometricAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics = await _auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _auth.isDeviceSupported();
      print('Biometric available: $canAuthenticate (canCheck: $canAuthenticateWithBiometrics)');
      return canAuthenticate;
    } on PlatformException catch (e) {
      print('Error checking biometrics: $e');
      return false;
    }
  }

  Future<bool> authenticate() async {
    try {
      print('Starting biometric authentication prompt...');
      final authenticated = await _auth.authenticate(
        localizedReason: 'Please authenticate to log in to FounderHQ',
        persistAcrossBackgrounding: true,
        biometricOnly: false,
      );
      print('Biometric authentication result: $authenticated');
      return authenticated;
    } on PlatformException catch (e) {
      print('Error during biometric authentication: $e');
      return false;
    }
  }

  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } on PlatformException catch (e) {
      print('Error getting available biometrics: $e');
      return <BiometricType>[];
    }
  }
}
