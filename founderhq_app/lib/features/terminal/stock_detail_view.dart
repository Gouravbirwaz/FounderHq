import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/market_provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme/app_theme.dart';

class StockDetailView extends ConsumerWidget {
  final Map<String, dynamic> stock;

  const StockDetailView({Key? key, required this.stock}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final liveSnapshot = ref.watch(marketLiveSnapshotProvider);
    final ticker = stock['ticker'] ?? 'Unknown';
    
    // Resolve live data if available
    Map<String, dynamic> currentStock = stock;
    if (liveSnapshot.hasValue) {
      final stocks = List<Map<String, dynamic>>.from(liveSnapshot.value?['stocks'] ?? []);
      final found = stocks.where((s) => s['ticker'] == ticker).toList();
      if (found.isNotEmpty) {
        currentStock = found.first;
      }
    }

    final name = currentStock['name'] ?? ticker;
    final price = (currentStock['price'] ?? 0.0).toDouble();
    final absChange = (currentStock['change'] ?? 0.0).toDouble();
    final pctChange = (currentStock['change_pct'] ?? 0.0).toDouble();
    final isUp = pctChange >= 0;
    Color trendColor = isUp ? AppTheme.successGreen : Colors.redAccent;
    final sign = isUp ? '+' : '';

    // Expand mock data for a bigger chart
    final mockData = <double>[
      price * 0.90, price * 0.92, price * 0.88, price * 0.95, 
      price * 1.01, price * 0.99, price * 1.05, price * 1.02, 
      price * 1.08, price * 0.96, price * 1.03, price
    ];

    return Scaffold(
      backgroundColor: Colors.black, // Flat dark mode
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Saved to Watchlist')));
            },
          ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      ticker,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    name,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '₹${price.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -1.0),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '$sign${absChange.toStringAsFixed(2)}',
                        style: TextStyle(color: trendColor, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '($sign${pctChange.toStringAsFixed(2)}%)',
                        style: TextStyle(color: trendColor, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      const SizedBox(width: 8),
                      Text('1D', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Groww-style clean chart
            SizedBox(
              height: 250,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  minX: 0,
                  maxX: mockData.length.toDouble() - 1,
                  minY: mockData.reduce((a, b) => a < b ? a : b) - (price * 0.05),
                  maxY: mockData.reduce((a, b) => a > b ? a : b) + (price * 0.05),
                  lineBarsData: [
                    LineChartBarData(
                      spots: mockData
                          .asMap()
                          .entries
                          .map((e) => FlSpot(e.key.toDouble(), e.value))
                          .toList(),
                      isCurved: false, // Groww charts are usually straight lines
                      color: trendColor,
                      barWidth: 2,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: trendColor.withOpacity(0.1),
                      ),
                    ),
                  ],
                  lineTouchData: LineTouchData(
                    getTouchedSpotIndicator: (LineChartBarData barData, List<int> spotIndexes) {
                      return spotIndexes.map((index) {
                        return TouchedSpotIndicatorData(
                          FlLine(color: Colors.white.withOpacity(0.5), strokeWidth: 1, dashArray: [5, 5]),
                          FlDotData(
                            show: true,
                            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(
                              radius: 4,
                              color: trendColor,
                              strokeWidth: 2,
                              strokeColor: Colors.white,
                            ),
                          ),
                        );
                      }).toList();
                    },
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipItems: (touchedSpots) {
                        return touchedSpots.map((spot) => LineTooltipItem(
                          '₹${spot.y.toStringAsFixed(2)}',
                          const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        )).toList();
                      }
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Timeline Pills
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _TimelinePill(label: '1D', isSelected: true),
                  _TimelinePill(label: '1W', isSelected: false),
                  _TimelinePill(label: '1M', isSelected: false),
                  _TimelinePill(label: '1Y', isSelected: false),
                  _TimelinePill(label: '5Y', isSelected: false),
                  _TimelinePill(label: 'ALL', isSelected: false),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Performance Bar & Stats
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Performance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 24),
                  
                  // Today's Low / High
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MinMaxText(label: "Today's Low", value: '₹${(price * 0.98).toStringAsFixed(2)}'),
                      _MinMaxText(label: "Today's High", value: '₹${(price * 1.05).toStringAsFixed(2)}', alignRight: true),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: Row(
                      children: [
                        Expanded(flex: 3, child: Container(decoration: BoxDecoration(color: trendColor, borderRadius: BorderRadius.circular(3)))),
                        Expanded(flex: 7, child: Container()),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // 52W Low / High
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MinMaxText(label: "52W Low", value: '₹${(price * 0.6).toStringAsFixed(2)}'),
                      _MinMaxText(label: "52W High", value: '₹${(price * 1.4).toStringAsFixed(2)}', alignRight: true),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: Row(
                      children: [
                        Expanded(flex: 8, child: Container(decoration: BoxDecoration(color: trendColor, borderRadius: BorderRadius.circular(3)))),
                        Expanded(flex: 2, child: Container()),
                      ],
                    ),
                  ),
                  const SizedBox(height: 48),

                  const Text('Fundamentals', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 24),
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 2.5,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    children: [
                      _StatItem(label: 'Market Cap', value: '₹${(price * 2.5).toStringAsFixed(0)}Cr'),
                      _StatItem(label: 'P/E Ratio', value: (20 + (absChange * 2)).toStringAsFixed(2)),
                      _StatItem(label: 'P/B Ratio', value: '3.45'),
                      _StatItem(label: 'Industry P/E', value: '25.60'),
                      _StatItem(label: 'Debt to Equity', value: '0.12'),
                      _StatItem(label: 'ROE', value: '18.5%'),
                    ],
                  ),
                  const SizedBox(height: 100), // padding for bottom buttons
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
        ),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1E1E), // Dark
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: Colors.redAccent.withOpacity(0.5)),
                  ),
                ),
                child: const Text('SELL', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent)),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.successGreen,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('BUY', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimelinePill extends StatelessWidget {
  final String label;
  final bool isSelected;

  const _TimelinePill({required this.label, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: isSelected ? Colors.white.withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isSelected ? Colors.white : Colors.white.withOpacity(0.5),
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          fontSize: 12,
        ),
      ),
    );
  }
}

class _MinMaxText extends StatelessWidget {
  final String label;
  final String value;
  final bool alignRight;

  const _MinMaxText({required this.label, required this.value, this.alignRight = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }
}
