# ⚡ XP Blog — Gamified Blogging Platform

A production-ready gamified blog where users earn XP, unlock badges, and compete on a leaderboard. Built with React + Vite + Supabase.

![XP Blog Screenshot](https://via.placeholder.com/1200x600/07070f/00d4ff?text=XP+Blog+%E2%80%94+Gamified+Blogging)

## ✨ Features

| Category | Features |
|----------|----------|
| 🔐 Auth | Sign up / login / logout via Supabase Auth |
| 📝 Blog | Create, edit, delete posts with image upload |
| ❤️ Social | Likes system, comment system, post sharing |
| 🪙 XP | Real-time points for every action |
| 🏅 Badges | 9 badges (7 visible + 2 secret) |
| 🧬 Levels | 6 levels from Initiate → Grandmaster |
| 🏆 Leaderboard | Ranked by XP, posts, likes, comments, streak |
| 🎯 Missions | 6 challenges with bonus XP rewards |
| 🔥 Streaks | Daily login streak tracker |
| 🔍 Search | Full-text post search + tag filtering |
| 📱 Responsive | Mobile-first, works on all devices |

## 🪙 XP System

| Action | XP |
|--------|----|
| Create post | +10 |
| Like a post | +2 |
| Post a comment | +5 |
| Daily login | +3 |
| Delete a post | -5 |

## 🧬 Level Thresholds

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | 🔰 Initiate | 0 |
| 2 | ⚡ Apprentice | 100 |
| 3 | 🔮 Adept | 300 |
| 4 | 🌟 Expert | 600 |
| 5 | 👑 Master | 1000 |
| 6 | 🏆 Grandmaster | 2000 |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx    
│   ├── blog/
│   │   ├── PostCard.jsx           
│   │   ├── PostEditor.jsx        
│   │   └── CommentSection.jsx     
│   ├── gamification/
│   │   ├── LevelProgress.jsx     
│   │   ├── BadgeCard.jsx          
│   │   └── MissionCard.jsx        
│   ├── layout/
│   │   ├── Layout.jsx            
│   │   └── Navbar.jsx             
│   └── ui/
│       ├── LoadingSpinner.jsx      
│       └── XPPopupLayer.jsx       
├── context/
│   ├── AuthContext.jsx            
│   └── XPContext.jsx               
├── lib/
│   ├── supabase.js                
│   └── gamification.js            
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── FeedPage.jsx               
│   ├── PostDetailPage.jsx          
│   ├── CreatePostPage.jsx
│   ├── EditPostPage.jsx
│   ├── ProfilePage.jsx           
│   ├── LeaderboardPage.jsx        
│   └── MissionsPage.jsx
├── styles/
│   └── globals.css                 
├── App.jsx                         
└── main.jsx               
```
## 🗄️ Database Schema

```
profiles         
posts           
comments        
likes           
badges          
user_badges     
user_missions 
