import 'package:flutter/material.dart';

const String youtubeChannelId = "UCUerZC3kOwd13O3BlJFPSaA";
const String youtubeApiKey = "AIzaSyDgHuM8nL8c3FHkFjnYauhl3vYx_kUEqh4";

class BrandColors {
  static const Color primary = Color(0xFF6B334B);
  static const Color accent1 = Color(0xFFC9625C);
  static const Color accent2 = Color(0xFFFCA53F);
  static const Color accent3 = Color(0xFFFFB082);
  static const Color accent4 = Color(0xFFFFD8A1);
  static const Color white = Colors.white;
  static const Color background = Color(0xFFF5F5F5);
  static const Color text = Color(0xFF333333);
  static const Color textLight = Color(0xFF666666);
  static const Color textMuted = Color(0xFF999999);
  static const Color border = Color(0xFFE0E0E0);
}

class ChurchInfo {
  static const String name = "Powell Butte Christian Church";
  static const String shortName = "PBCC";
  static const String address = "16250 SE Powell Butte Rd, Powell Butte, OR 97753";
  static const String phone = "(541) 548-3066";
  static const String email = "info@powellbuttechurch.com";
  static const String website = "https://powellbuttechurch.com";
  static const String youtubeChannelId = "UCUerZC3kOwd13O3BlJFPSaA";
  static const String givingUrl = "https://pushpay.com/g/thenetministry?src=hpp";

  static const List<String> serviceTimes = [
    "Sunday: 8:30 AM - Early Service",
    "Sunday: 10:30 AM - Contemporary Service",
    "Sunday: 11:30 AM - Traditional Service",
  ];

  static const List<String> inPersonOnly = ["Wednesday: 7:00 PM - Bible Study"];

  static const List<NotificationTime> notificationTimes = [
    NotificationTime(
      hour: 8,
      minute: 30,
      message: "Early Service starting now! Join us for worship.",
      name: "Early Service",
    ),
    NotificationTime(
      hour: 10,
      minute: 30,
      message: "Traditional Service starting now! Join us for worship.",
      name: "Traditional Service",
    ),
    NotificationTime(
      hour: 11,
      minute: 30,
      message: "Contemporary Service starting now! Join us for worship.",
      name: "Contemporary Service",
    ),
  ];

  static const Map<String, String> socialMedia = {
    "facebook": "https://facebook.com/powellbuttechurch",
    "youtube": "https://www.youtube.com/channel/UCUerZC3kOwd13O3BlJFPSaA",
    "instagram": "https://instagram.com/powellbuttechurch",
    "website": "https://powellbuttechurch.com",
  };

  static final List<Ministry> ministries = [
    Ministry(
      id: "youth",
      name: "Youth Ministry",
      icon: Icons.people,
      description: "For students grades 6-12",
      meetingTime: "Wednesdays at 6:30 PM",
      color: BrandColors.accent1,
    ),
    Ministry(
      id: "kids",
      name: "Children's Ministry",
      icon: Icons.emoji_emotions,
      description: "Ages 0-5th grade",
      meetingTime: "Sundays during service",
      color: BrandColors.accent2,
    ),
    Ministry(
      id: "mens",
      name: "Men's Ministry",
      icon: Icons.man,
      description: "Fellowship and growth for men",
      meetingTime: "Saturdays at 7:00 AM",
      color: BrandColors.primary,
    ),
    Ministry(
      id: "womens",
      name: "Women's Ministry",
      icon: Icons.woman,
      description: "Connection and study for women",
      meetingTime: "Thursdays at 9:30 AM",
      color: BrandColors.accent3,
    ),
  ];
}

class NotificationTime {
  final int hour;
  final int minute;
  final String message;
  final String name;

  const NotificationTime({
    required this.hour,
    required this.minute,
    required this.message,
    required this.name,
  });
}

class Ministry {
  final String id;
  final String name;
  final IconData icon;
  final String description;
  final String meetingTime;
  final Color color;

  Ministry({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
    required this.meetingTime,
    required this.color,
  });
}

class BibleVerse {
  final String text;
  final String reference;

  const BibleVerse({required this.text, required this.reference});
}

const List<BibleVerse> bibleVerses = [
  BibleVerse(
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
  ),
  BibleVerse(
    text: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
  ),
  BibleVerse(
    text: "The Lord is my shepherd, I lack nothing.",
    reference: "Psalm 23:1",
  ),
  BibleVerse(
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  ),
  BibleVerse(
    text: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
  ),
  BibleVerse(
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9",
  ),
  BibleVerse(
    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
    reference: "Zephaniah 3:17",
  ),
];
