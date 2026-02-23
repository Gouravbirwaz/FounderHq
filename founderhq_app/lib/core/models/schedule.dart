class Schedule {
  final String id;
  final String title;
  final String time;
  final bool isCompleted;

  const Schedule({
    required this.id,
    required this.title,
    required this.time,
    this.isCompleted = false,
  });

  Schedule copyWith({
    String? id,
    String? title,
    String? time,
    bool? isCompleted,
  }) {
    return Schedule(
      id: id ?? this.id,
      title: title ?? this.title,
      time: time ?? this.time,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'time': time,
        'is_completed': isCompleted,
      };

  factory Schedule.fromJson(Map<String, dynamic> json) => Schedule(
        id: json['id'],
        title: json['title'],
        time: json['time'],
        isCompleted: json['is_completed'] ?? false,
      );
}
