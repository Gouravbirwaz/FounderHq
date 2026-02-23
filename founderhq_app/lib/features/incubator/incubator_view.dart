import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/poc_provider.dart';

class IncubatorView extends ConsumerStatefulWidget {
  const IncubatorView({Key? key}) : super(key: key);

  @override
  ConsumerState<IncubatorView> createState() => _IncubatorViewState();
}

class _IncubatorViewState extends ConsumerState<IncubatorView> {
  final Set<String> _starredIds = {};

  @override
  Widget build(BuildContext context) {
    final pocsAsync = ref.watch(pocListProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: pocsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
        data: (pocs) {
          if (pocs.isEmpty) {
            return const Center(child: Text('No POCs available.', style: TextStyle(color: Colors.white)));
          }
          
          return PageView.builder(
            scrollDirection: Axis.vertical,
            itemCount: pocs.length,
            itemBuilder: (context, index) {
              final poc = pocs[index] as Map<String, dynamic>;
              final pocId = poc['id'] as String;
              final isStarred = _starredIds.contains(pocId);
              
              return Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppTheme.charcoal,
                      Colors.black,
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Stack(
                  children: [
                    // Video/Image placeholder
                    Center(
                      child: Icon(
                        Icons.play_circle_outline,
                        size: 80,
                        color: Colors.white.withOpacity(0.2),
                      ),
                    ),
                    
                    // Overlay Content
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.8),
                              Colors.black,
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (poc['seeking'] != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: AppTheme.techBlue.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Text(
                                        poc['seeking'] as String,
                                        style: const TextStyle(
                                          color: AppTheme.techBlue,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  const SizedBox(height: 12),
                                  Text(
                                    poc['title'] ?? 'Untitled',
                                    style: const TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '@${poc['author_name'] ?? 'anonymous'}',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    poc['description'] ?? '',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Colors.white70,
                                    ),
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 40), // Space for bottom nav
                                ],
                              ),
                            ),
                            
                            const SizedBox(width: 16),
                            
                            // Actions
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () async {
                                    setState(() {
                                      if (isStarred) {
                                        _starredIds.remove(pocId);
                                      } else {
                                        _starredIds.add(pocId);
                                      }
                                    });
                                    // Trigger backend upvote asynchronously
                                    ref.read(pocActionProvider.notifier).upvotePoc(pocId);
                                  },
                                  icon: Icon(
                                    isStarred ? Icons.star : Icons.star_border,
                                    color: isStarred ? Colors.amber : Colors.white,
                                    size: 36,
                                  ),
                                ),
                                // Show backend upvote count alongside local optimistic state if desired
                                Text(
                                  '${(poc['upvotes'] as int? ?? 0) + (isStarred ? 1 : 0)}',
                                  style: const TextStyle(color: Colors.white, fontSize: 12),
                                ),
                                const SizedBox(height: 24),
                                IconButton(
                                  onPressed: () {},
                                  icon: const Icon(Icons.share, color: Colors.white, size: 32),
                                ),
                                const Text('Share', style: TextStyle(color: Colors.white, fontSize: 12)),
                                const SizedBox(height: 48), // Space for bottom nav
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
