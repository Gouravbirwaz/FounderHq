import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'package:url_launcher/url_launcher.dart';

class NewsDetailView extends StatelessWidget {
  final Map<String, dynamic> newsItem;
  final String heroTag;

  const NewsDetailView({Key? key, required this.newsItem, required this.heroTag}) : super(key: key);

  Future<void> _launchUrl(String? url) async {
    if (url == null) return;
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = newsItem['title'] ?? 'Headline';
    final summary = newsItem['summary'] ?? '';
    final source = newsItem['source'] ?? 'Intel';
    final url = newsItem['url'];
    final sentimentLabel = newsItem['sentiment_label'] ?? 'neutral';

    Color badgeColor = Colors.grey;
    if (sentimentLabel == 'bullish') badgeColor = AppTheme.successGreen;
    if (sentimentLabel == 'bearish') badgeColor = Colors.redAccent;

    final imageUrl = newsItem['image_url'] ?? 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800';

    return Scaffold(
      backgroundColor: Colors.black,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            backgroundColor: Colors.black,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.black45, shape: BoxShape.circle),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Hero(
                    tag: heroTag + '_img',
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Hero(
                    tag: heroTag + '_meta',
                    child: Material(
                      color: Colors.transparent,
                      child: Row(
                        children: [
                          Text(source.toUpperCase(), style: const TextStyle(color: AppTheme.techBlue, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: badgeColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: badgeColor.withOpacity(0.5)),
                            ),
                            child: Text(
                              sentimentLabel.toUpperCase(),
                              style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Hero(
                    tag: heroTag + '_title',
                    child: Material(
                      color: Colors.transparent,
                      child: Text(
                        title,
                        style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, height: 1.1),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    summary,
                    style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 18, height: 1.7),
                  ),
                  const SizedBox(height: 48),
                  if (url != null)
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _launchUrl(url.toString()),
                        icon: const Icon(Icons.open_in_new, color: Colors.black, size: 20),
                        label: const Text('FULL ARTICLE CONTENT', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.techBlue,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
