import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/market_provider.dart';
import 'stock_detail_view.dart';

class TerminalView extends ConsumerStatefulWidget {
  const TerminalView({Key? key}) : super(key: key);

  @override
  ConsumerState<TerminalView> createState() => _TerminalViewState();
}

class _TerminalViewState extends ConsumerState<TerminalView> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final liveMarketAsync = ref.watch(marketLiveSnapshotProvider);
    final initialStocksAsync = ref.watch(marketStocksProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Row(
          children: [
            const SizedBox(width: 4),
            Expanded(
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    icon: Icon(Icons.search, color: Colors.white.withOpacity(0.5), size: 18),
                    hintText: 'Search stocks & ETFs',
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 14),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: liveMarketAsync.when(
        data: (liveData) {
          final stocks = List<Map<String, dynamic>>.from(liveData['stocks'] ?? []);
          if (stocks.isEmpty) return _buildInitialView(initialStocksAsync);
          return _buildMarketList(stocks);
        },
        loading: () => _buildInitialView(initialStocksAsync),
        error: (err, stack) => _buildInitialView(initialStocksAsync),
      ),
    );
  }

  Widget _buildInitialView(AsyncValue<List<dynamic>> initialStocksAsync) {
    return initialStocksAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.successGreen)),
      error: (err, stack) => Center(child: Text('Failed to load market data', style: TextStyle(color: Colors.white.withOpacity(0.5)))),
      data: (stocksList) => _buildMarketList(List<Map<String, dynamic>>.from(stocksList)),
    );
  }

  Widget _buildMarketList(List<Map<String, dynamic>> stocks) {
    // Filter based on search query
    final filteredStocks = _searchQuery.isEmpty 
      ? stocks 
      : stocks.where((s) {
          final ticker = (s['ticker'] ?? '').toString().toLowerCase();
          final name = (s['name'] ?? ticker).toString().toLowerCase();
          return ticker.contains(_searchQuery) || name.contains(_searchQuery);
        }).toList();

    final indices = filteredStocks.where((s) => s['ticker'] == 'NIFTY50' || s['ticker'] == 'SENSEX').toList();
    final equity = filteredStocks.where((s) => s['ticker'] != 'NIFTY50' && s['ticker'] != 'SENSEX').toList();

    if (filteredStocks.isEmpty && _searchQuery.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            Text('No stocks found for "$_searchQuery"', style: TextStyle(color: Colors.white.withOpacity(0.5))),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Indices ROW
          if (indices.isNotEmpty) ...[
            const SizedBox(height: 16),
            SizedBox(
              height: 100,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: indices.length,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  return _IndexCard(stock: indices[index]);
                },
              ),
            ),
          ],
          const SizedBox(height: 24),
          
          // Top Tab row (Explore / Holdings)
          if (_searchQuery.isEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                   _TabChip(title: 'Explore', isSelected: true),
                  const SizedBox(width: 12),
                  _TabChip(title: 'Holdings', isSelected: false),
                  const SizedBox(width: 12),
                  _TabChip(title: 'Watchlist', isSelected: false),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          
          // Section Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              _searchQuery.isEmpty ? 'Top Movers' : 'Search Results',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
          const SizedBox(height: 16),

          // Grid of Stocks
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.builder(
              padding: EdgeInsets.zero,
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.2,
              ),
              itemCount: equity.length,
              itemBuilder: (context, index) {
                return _GridStockCard(stock: equity[index]);
              },
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _TabChip extends StatelessWidget {
  final String title;
  final bool isSelected;

  const _TabChip({required this.title, required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected ? Colors.white : Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        border: isSelected ? null : Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.black : Colors.white,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          fontSize: 14,
        ),
      ),
    );
  }
}

class _IndexCard extends StatelessWidget {
  final Map<String, dynamic> stock;

  const _IndexCard({required this.stock});

  @override
  Widget build(BuildContext context) {
    final ticker = stock['ticker'] ?? '';
    final price = (stock['price'] ?? 0.0).toDouble();
    final absChange = (stock['change'] ?? 0.0).toDouble();
    final pctChange = (stock['change_pct'] ?? 0.0).toDouble();
    final isUp = pctChange >= 0;
    final color = isUp ? AppTheme.successGreen : Colors.redAccent;
    final sign = isUp ? '+' : '';

    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(ticker, style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
          const SizedBox(height: 4),
          Text(price.toStringAsFixed(2), style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Row(
            children: [
              Flexible(
                child: Text(
                  '$sign${absChange.toStringAsFixed(2)} ($sign${pctChange.toStringAsFixed(2)}%)', 
                  style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GridStockCard extends StatelessWidget {
  final Map<String, dynamic> stock;

  const _GridStockCard({required this.stock});

  @override
  Widget build(BuildContext context) {
    final ticker = stock['ticker'] ?? '';
    final name = stock['name'] ?? ticker; 
    final price = (stock['price'] ?? 0.0).toDouble();
    final absChange = (stock['change'] ?? 0.0).toDouble();
    final pctChange = (stock['change_pct'] ?? 0.0).toDouble();
    final isUp = pctChange >= 0;
    final color = isUp ? AppTheme.successGreen : Colors.redAccent;
    final sign = isUp ? '+' : '';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => StockDetailView(stock: stock)),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: Colors.white.withOpacity(0.1),
                  child: Text(ticker[0], style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 12),
                Text(name, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text('₹${price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(
                    '$sign${absChange.toStringAsFixed(2)} ($sign${pctChange.toStringAsFixed(2)}%)', 
                    style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
