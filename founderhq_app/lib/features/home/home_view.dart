import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/auth_provider.dart';
import '../terminal/terminal_view.dart';
import '../incubator/incubator_view.dart';
import '../vault/vault_view.dart';
import '../huddle/huddle_landing_view.dart';
import '../community/community_view.dart';
import '../profile/profile_view.dart';
import '../../shared/custom_bottom_sheet.dart';
import '../../core/providers/market_provider.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../news/news_view.dart';
import '../news/news_detail_view.dart';

import '../../core/models/schedule.dart';
import '../../core/providers/schedule_provider.dart';

class HomeView extends ConsumerWidget {
  const HomeView({Key? key}) : super(key: key);

  void _navigateTo(BuildContext context, Widget page) {
    Navigator.push(context, MaterialPageRoute(builder: (_) => page));
  }

  void _onAddSchedule(BuildContext context, WidgetRef ref) {
    final now = TimeOfDay.now();
    final timeStr = "${now.hourOfPeriod}:${now.minute.toString().padLeft(2, '0')} ${now.period == DayPeriod.am ? 'AM' : 'PM'}";
    
    String title = '';
    String time = timeStr; // Default to system time

    CustomBottomSheet.show(
      context,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Add Schedule',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextField(
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Task Title',
              hintStyle: const TextStyle(color: Colors.grey),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
            onChanged: (val) => title = val,
          ),
          const SizedBox(height: 16),
          TextField(
            style: const TextStyle(color: Colors.white),
            controller: TextEditingController(text: timeStr),
            decoration: InputDecoration(
              hintText: 'Time (e.g., 10:00 AM)',
              hintStyle: const TextStyle(color: Colors.grey),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
            onChanged: (val) => time = val,
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {
              if (title.isNotEmpty && time.isNotEmpty) {
                ref.read(scheduleProvider.notifier).addSchedule(title, time);
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.techBlue,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Add to Schedule', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final name = user?['name'] ?? 'Founder';
    final newsState = ref.watch(marketNewsProvider);
    final schedules = ref.watch(scheduleProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: CustomScrollView(
        slivers: [
          // Immersive Folding News Header
          SliverAppBar(
            expandedHeight: 350,
            pinned: true,
            backgroundColor: Colors.black,
            flexibleSpace: FlexibleSpaceBar(
              background: newsState.when(
                data: (news) {
                  if (news.isEmpty) return Container(color: Colors.grey[900]);
                  final topNews = news.first;
                  return GestureDetector(
                    onTap: () => _navigateTo(context, const NewsView()),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          topNews['image_url'] ?? 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800',
                          fit: BoxFit.cover,
                        ),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withOpacity(0.4),
                                Colors.black,
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 40,
                          left: 20,
                          right: 20,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.techBlue,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text('LATEST NEWS', style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                topNews['title'] ?? '',
                                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, height: 1.2),
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.techBlue)),
                error: (_, __) => Container(color: Colors.black),
              ),
            ),
          ),
          
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Welcome back,', style: TextStyle(color: Colors.grey, fontSize: 14)),
                          Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Colors.white)),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.video_call_outlined, color: AppTheme.techBlue),
                            onPressed: () => _navigateTo(context, const HuddleLandingView()),
                          ),
                          IconButton(
                            icon: const Icon(Icons.calendar_month_outlined, color: AppTheme.techBlue),
                            onPressed: () => _onAddSchedule(context, ref),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  
                  // Feature Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.4,
                    children: [
                      _FeatureCard(
                        title: 'Huddle Room',
                        subtitle: 'Live Collab',
                        icon: Icons.video_call,
                        color: Colors.purpleAccent,
                        onTap: () => _navigateTo(context, const HuddleLandingView()),
                      ),
                      _FeatureCard(
                        title: 'Terminal',
                        subtitle: 'Market Pulse',
                        icon: Icons.show_chart,
                        color: AppTheme.successGreen,
                        onTap: () => _navigateTo(context, const TerminalView()),
                      ),
                      _FeatureCard(
                        title: 'Community',
                        subtitle: 'Founder Network',
                        icon: Icons.groups,
                        color: AppTheme.techBlue,
                        onTap: () => _navigateTo(context, const CommunityView()),
                      ),
                      _FeatureCard(
                        title: 'Incubator',
                        subtitle: 'Scale Ideas',
                        icon: Icons.rocket_launch,
                        color: Colors.orangeAccent,
                        onTap: () => _navigateTo(context, const IncubatorView()),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Daily Schedule Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Today\'s Schedule', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.white)),
                      Text('${schedules.length} TASKS', style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (schedules.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: const Center(
                        child: Text('No tasks scheduled for today.', style: TextStyle(color: Colors.grey)),
                      ),
                    )
                  else
                    ...schedules.map((s) => _ScheduleItem(
                      schedule: s,
                      onToggle: () => ref.read(scheduleProvider.notifier).toggleComplete(s.id),
                      onDelete: () => ref.read(scheduleProvider.notifier).removeSchedule(s.id),
                    )).toList(),
                  
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ScheduleItem extends StatelessWidget {
  final Schedule schedule;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  const _ScheduleItem({
    required this.schedule,
    required this.onToggle,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: schedule.isCompleted ? AppTheme.successGreen.withOpacity(0.3) : Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Checkbox(
            value: schedule.isCompleted,
            onChanged: (_) => onToggle(),
            activeColor: AppTheme.successGreen,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  schedule.title,
                  style: TextStyle(
                    color: schedule.isCompleted ? Colors.grey : Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    decoration: schedule.isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                Text(schedule.time, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 18),
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    title, 
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle, 
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
