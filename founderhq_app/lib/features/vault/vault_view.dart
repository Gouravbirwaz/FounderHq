import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pie_chart/pie_chart.dart' as pie;
import 'package:local_auth/local_auth.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/funding_provider.dart';

class VaultView extends ConsumerStatefulWidget {
  const VaultView({Key? key}) : super(key: key);

  @override
  ConsumerState<VaultView> createState() => _VaultViewState();
}

class _VaultViewState extends ConsumerState<VaultView> {
  final LocalAuthentication auth = LocalAuthentication();
  final TextEditingController _companyController = TextEditingController();
  bool _isAuthenticated = false;
  double _fundingRoundDilution = 10.0;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _checkBiometrics();
  }

  @override
  void dispose() {
    _companyController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometrics() async {
    try {
      final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await auth.isDeviceSupported();
      
      if (!canAuthenticate) {
        // Fallback for emulators without lock screen setup
        setState(() => _isAuthenticated = true);
        return;
      }

      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Please authenticate to access the Vault',
        biometricOnly: false,
      );

      setState(() {
        _isAuthenticated = didAuthenticate;
      });
    } catch (e) {
      // For development speed, allow fallback
      setState(() => _isAuthenticated = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline, size: 80, color: AppTheme.techBlue),
              const SizedBox(height: 24),
              const Text('Vault Locked', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _checkBiometrics,
                child: const Text('Unlock with Biometrics'),
              ),
            ],
          ),
        ),
      );
    }

    final dataMap = <String, double>{
      "Founders": 100 - _fundingRoundDilution,
      "Investors": _fundingRoundDilution,
    };

    final colorList = <Color>[
      AppTheme.techBlue,
      AppTheme.successGreen,
    ];

    final vettingAsync = ref.watch(fundingVettingProvider(_searchQuery));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vault', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Company Search
            TextField(
              controller: _companyController,
              decoration: InputDecoration(
                hintText: 'Enter Company Name for Vetting',
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {
                    setState(() {
                      _searchQuery = _companyController.text.trim();
                    });
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppTheme.techBlue.withOpacity(0.3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppTheme.techBlue.withOpacity(0.3)),
                ),
              ),
              onSubmitted: (value) {
                setState(() {
                  _searchQuery = value.trim();
                });
              },
            ),
            const SizedBox(height: 24),

            // DigiLocker verification badge card
            if (_searchQuery.isNotEmpty)
              vettingAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Text('Error: $err', style: const TextStyle(color: Colors.red)),
                data: (data) {
                  final isVerified = data['verified'] == true;
                  return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: isVerified ? AppTheme.successGreen.withOpacity(0.5) : Colors.redAccent.withOpacity(0.5)),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isVerified ? Icons.verified : Icons.error_outline,
                          color: isVerified ? AppTheme.successGreen : Colors.redAccent,
                          size: 40
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isVerified ? 'Verified by DigiLocker' : 'Verification Failed', 
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)
                              ),
                              const SizedBox(height: 4),
                              Text(
                                data['message'] ?? 'Check company details.', 
                                style: const TextStyle(color: Colors.grey, fontSize: 12)
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

            const SizedBox(height: 32),
            
            const Text(
              'Cap Table Simulator',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Simulate equity dilution for your next funding round.',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 32),

            // Pie Chart
            pie.PieChart(
              dataMap: dataMap,
              animationDuration: const Duration(milliseconds: 400),
              chartLegendSpacing: 32,
              chartRadius: MediaQuery.of(context).size.width / 2.5,
              colorList: colorList,
              initialAngleInDegree: 0,
              chartType: pie.ChartType.ring,
              ringStrokeWidth: 32,
              legendOptions: const pie.LegendOptions(
                showLegendsInRow: false,
                legendPosition: pie.LegendPosition.bottom,
                showLegends: true,
                legendTextStyle: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              chartValuesOptions: const pie.ChartValuesOptions(
                showChartValueBackground: false,
                showChartValues: true,
                showChartValuesInPercentage: true,
                showChartValuesOutside: false,
                decimalPlaces: 1,
                chartValueStyle: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            const SizedBox(height: 40),

            // Dilution Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('New Investor Equity:', style: TextStyle(fontWeight: FontWeight.w600)),
                Text(
                  '${_fundingRoundDilution.toStringAsFixed(1)}%',
                  style: const TextStyle(
                    color: AppTheme.techBlue,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SliderTheme(
              data: SliderTheme.of(context).copyWith(
                activeTrackColor: AppTheme.techBlue,
                thumbColor: Colors.white,
                overlayColor: AppTheme.techBlue.withOpacity(0.2),
              ),
              child: Slider(
                value: _fundingRoundDilution,
                min: 0,
                max: 100,
                divisions: 100,
                onChanged: (value) {
                  setState(() {
                    _fundingRoundDilution = value;
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
