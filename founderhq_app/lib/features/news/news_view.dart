import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/market_provider.dart';
import 'news_detail_view.dart';

class NewsView extends ConsumerWidget {
  const NewsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final newsState = ref.watch(marketNewsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text('Startup News', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: newsState.when(
        data: (news) {
          if (news.isEmpty) {
            return const Center(child: Text('No news available currently.', style: TextStyle(color: Colors.grey)));
          }

          return PageView.builder(
            scrollDirection: Axis.vertical,
            itemCount: news.length,
            itemBuilder: (context, index) {
              final item = news[index];
              return _NewsPage(item: item, index: index);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
        error: (err, stack) => Center(child: Text('Error loading news', style: TextStyle(color: Colors.redAccent.withOpacity(0.8)))),
      ),
    );
  }
}

class _NewsPage extends StatelessWidget {
  final Map<String, dynamic> item;
  final int index;

  const _NewsPage({required this.item, required this.index});

  @override
  Widget build(BuildContext context) {
    final title = item['title'] ?? 'Headline';
    final summary = item['summary'] ?? '';
    final source = item['source'] ?? 'Intel';
    final imageUrl = item['image_url'] ??
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800';
    final sentimentLabel = item['sentiment_label'] ?? 'neutral';

    Color badgeColor = Colors.grey;
    if (sentimentLabel == 'bullish') badgeColor = AppTheme.successGreen;
    if (sentimentLabel == 'bearish') badgeColor = Colors.redAccent;

    final heroTag = 'news_card_${item['id']}_$index';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          PageRouteBuilder(
            transitionDuration: const Duration(milliseconds: 600),
            pageBuilder: (_, __, ___) =>
                NewsDetailView(newsItem: item, heroTag: heroTag),
            transitionsBuilder: (_, animation, __, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        );
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Background Image
          Hero(
            tag: heroTag + '_img',
            child: Image.network(
              imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(color: const Color(0xFF1E1E1E)),
            ),
          ),
          // Gradient Overlay
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.2),
                  Colors.black.withOpacity(0.1),
                  Colors.black.withOpacity(0.8),
                  Colors.black,
                ],
                stops: const [0.0, 0.3, 0.7, 1.0],
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Hero(
                  tag: heroTag + '_meta',
                  child: Material(
                    color: Colors.transparent,
                    child: Row(
                      children: [
                        Text(
                          source.toUpperCase(),
                          style: const TextStyle(color: AppTheme.techBlue,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: badgeColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                                color: badgeColor.withOpacity(0.5), width: 1.5),
                          ),
                          child: Text(
                            sentimentLabel.toUpperCase(),
                            style: TextStyle(color: badgeColor,
                                fontSize: 10,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Hero(
                  tag: heroTag + '_title',
                  child: Material(
                    color: Colors.transparent,
                    child: Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        height: 1.1,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  summary,
                  style: TextStyle(color: Colors.white.withOpacity(0.7),
                      fontSize: 16,
                      height: 1.5),
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 40),
                Row(
                  children: [
                    Icon(
                        Icons.keyboard_arrow_up, color: Colors.white.withOpacity(0.5)),
                    const SizedBox(width: 8),
                    Text('SWIPE FOR MORE', style: TextStyle(
                        color: Colors.white.withOpacity(0.3),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2)),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
