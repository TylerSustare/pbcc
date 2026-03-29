// IMPORTANT: Replace these with your actual values
export const YOUTUBE_CHANNEL_ID = "UCUerZC3kOwd13O3BlJFPSaA"; // Get from YouTube Studio
export const YOUTUBE_API_KEY = "AIzaSyDgHuM8nL8c3FHkFjnYauhl3vYx_kUEqh4"; // Get from Google Cloud Console

export const BRAND_COLORS = {
  primary: "#6b334b", // Primary burgundy from logo
  accent1: "#c9625c", // Gradient color 1
  accent2: "#fca53f", // Gradient color 2 (orange)
  accent3: "#ffb082", // Gradient color 3
  accent4: "#ffd8a1", // Gradient color 4 (light peach)
  white: "#ffffff",
  background: "#f5f5f5",
  text: "#333333",
  textLight: "#666666",
  textMuted: "#999999",
  border: "#e0e0e0",
};

export const CHURCH_INFO = {
  name: "Powell Butte Christian Church",
  shortName: "PBCC",
  address: "16250 SE Powell Butte Rd, Powell Butte, OR 97753",
  phone: "(541) 548-3066",
  email: "info@powellbuttechurch.com",
  website: "https://powellbuttechurch.com",
  youtubeChannelId: YOUTUBE_CHANNEL_ID,

  serviceTimes: [
    "Sunday: 8:30 AM - Early Service",
    "Sunday: 10:30 AM - Contemporary Service",
    "Sunday: 11:30 AM - Traditional Service",
  ],

  // Bible study is in-person only (not live streamed)
  inPersonOnly: ["Wednesday: 7:00 PM - Bible Study"],

  // Sunday service notification times
  notificationTimes: [
    {
      hour: 8,
      minute: 30,
      message: "Early Service starting now! Join us for worship.",
    },
    {
      hour: 10,
      minute: 30,
      message: "Traditional Service starting now! Join us for worship.",
    },
    {
      hour: 11,
      minute: 30,
      message: "Contemporary Service starting now! Join us for worship.",
    },
  ],

  socialMedia: {
    facebook: "https://facebook.com/powellbuttechurch",
    youtube: `https://www.youtube.com/channel/YOUR_CHANNEL_ID_HERE`, // Update with actual channel ID
    instagram: "https://instagram.com/powellbuttechurch",
    website: "https://powellbuttechurch.com",
  },

  // Ministries and groups
  ministries: [
    {
      id: "youth",
      name: "Youth Ministry",
      icon: "people",
      description: "For students grades 6-12",
      meetingTime: "Wednesdays at 6:30 PM",
      color: BRAND_COLORS.accent1,
    },
    {
      id: "kids",
      name: "Children's Ministry",
      icon: "happy",
      description: "Ages 0-5th grade",
      meetingTime: "Sundays during service",
      color: BRAND_COLORS.accent2,
    },
    {
      id: "mens",
      name: "Men's Ministry",
      icon: "man",
      description: "Fellowship and growth for men",
      meetingTime: "Saturdays at 7:00 AM",
      color: BRAND_COLORS.primary,
    },
    {
      id: "womens",
      name: "Women's Ministry",
      icon: "woman",
      description: "Connection and study for women",
      meetingTime: "Thursdays at 9:30 AM",
      color: BRAND_COLORS.accent3,
    },
  ],
};

// Sample Bible verses for rotation
export const BIBLE_VERSES = [
  {
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
  },
  {
    text: "I can do all this through him who gives me strength.",
    reference: "Philippians 4:13",
  },
  {
    text: "The Lord is my shepherd, I lack nothing.",
    reference: "Psalm 23:1",
  },
  {
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "And we know that in all things God works for the good of those who love him.",
    reference: "Romans 8:28",
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9",
  },
  {
    text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.",
    reference: "Zephaniah 3:17",
  },
];
