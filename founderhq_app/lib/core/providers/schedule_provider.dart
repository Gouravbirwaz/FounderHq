import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/schedule.dart';
import '../api_client.dart';

class ScheduleNotifier extends Notifier<List<Schedule>> {
  @override
  List<Schedule> build() {
    _fetchSchedules();
    return [];
  }

  Future<void> _fetchSchedules() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.get('/api/v1/schedule/');
      final List data = res.data;
      state = data.map((json) => Schedule.fromJson(json)).toList();
    } catch (e) {
      // Handle error
    }
  }

  Future<void> addSchedule(String title, String time) async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.post('/api/v1/schedule/', data: {
        'title': title,
        'time': time,
      });
      final newSchedule = Schedule.fromJson(res.data);
      state = [...state, newSchedule];
    } catch (e) {
      // Handle error
    }
  }

  Future<void> toggleComplete(String id) async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.dio.patch('/api/v1/schedule/$id/toggle');
      final updated = Schedule.fromJson(res.data);
      state = [
        for (final s in state)
          if (s.id == id) updated else s
      ];
    } catch (e) {
      // Handle error
    }
  }

  Future<void> removeSchedule(String id) async {
    try {
      final client = ref.read(apiClientProvider);
      await client.dio.delete('/api/v1/schedule/$id');
      state = state.where((s) => s.id != id).toList();
    } catch (e) {
      // Handle error
    }
  }
}

final scheduleProvider = NotifierProvider<ScheduleNotifier, List<Schedule>>(ScheduleNotifier.new);
