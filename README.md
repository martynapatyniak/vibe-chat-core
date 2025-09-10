# ChatFlow - Real-time Chat Application

A modern, production-ready chat application built with React, TypeScript, Tailwind CSS, and Supabase. Features real-time messaging, user authentication, rooms, reactions, and file sharing capabilities.

## 🚀 Features

- **Real-time messaging** with instant updates
- **User authentication** with email/password
- **Multiple chat rooms** with public/private options
- **Message reactions** with emoji support
- **File attachments** (images, documents, voice messages)
- **User profiles** with avatars and status indicators
- **Admin/Moderator roles** with moderation capabilities
- **Responsive design** optimized for mobile and desktop
- **Dark/Light theme** support
- **Rate limiting** and security features
- **XSS protection** with input sanitization

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**: React hooks and context
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Modern web browser

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd chatflow-app
npm install
\`\`\`

### 2. Environment Setup

Copy the environment template:
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your Supabase credentials in \`.env\`:
\`\`\`env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"
VITE_SUPABASE_PROJECT_ID="your-project-id"
\`\`\`

### 3. Database Setup

Execute the SQL schema in your Supabase SQL editor:

\`\`\`sql
-- Run the contents of database/schema.sql in Supabase SQL Editor
\`\`\`

### 4. Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Visit \`http://localhost:8080\`

## 🗄️ Database Schema

### Core Tables

#### users
- **id**: UUID (Primary key, references auth.users)
- **username**: TEXT (Unique username)
- **email**: TEXT (User email)
- **role**: user_role ENUM (admin, moderator, user)
- **country_code**: TEXT (Optional country code)
- **avatar_url**: TEXT (Profile image URL)
- **status**: user_status ENUM (online, offline, away)
- **is_banned**: BOOLEAN (Ban status)
- **is_muted**: BOOLEAN (Mute status)
- **created_at**: TIMESTAMP
- **last_seen**: TIMESTAMP

#### rooms
- **id**: UUID (Primary key)
- **name**: TEXT (Room name)
- **description**: TEXT (Optional description)
- **is_private**: BOOLEAN (Private/public status)
- **password**: TEXT (Optional password for private rooms)
- **created_by**: UUID (Creator user ID)
- **member_limit**: INTEGER (Max members, default 100)
- **created_at**: TIMESTAMP

#### messages
- **id**: UUID (Primary key)
- **user_id**: UUID (Foreign key to users)
- **room_id**: UUID (Foreign key to rooms)
- **content**: TEXT (Message content)
- **message_type**: message_type ENUM (text, file, voice, system)
- **file_url**: TEXT (Optional file attachment URL)
- **reply_to_message_id**: UUID (Optional reply reference)
- **is_edited**: BOOLEAN (Edit status)
- **is_deleted**: BOOLEAN (Soft delete status)
- **created_at**: TIMESTAMP
- **edited_at**: TIMESTAMP

#### message_reactions
- **id**: UUID (Primary key)
- **message_id**: UUID (Foreign key to messages)
- **user_id**: UUID (Foreign key to users)
- **emoji**: TEXT (Emoji character)
- **created_at**: TIMESTAMP

#### room_members
- **id**: UUID (Primary key)
- **room_id**: UUID (Foreign key to rooms)
- **user_id**: UUID (Foreign key to users)
- **role**: room_member_role ENUM (admin, moderator, member)
- **joined_at**: TIMESTAMP

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-specific data policies** for privacy
- **Input sanitization** to prevent XSS attacks
- **Rate limiting** for message sending and auth attempts
- **File validation** with size and type restrictions

## 🔧 Configuration

### Authentication Settings

In Supabase Dashboard → Authentication → Settings:
- Enable email confirmation (recommended for production)
- Set up custom SMTP (optional)
- Configure redirect URLs for your domain

### Storage Configuration

For file uploads, configure Supabase Storage:
- Create buckets for avatars, files, etc.
- Set up RLS policies for secure file access
- Configure file size limits and allowed types

### Real-time Configuration

Real-time updates are automatically enabled for:
- New messages and reactions
- User status changes
- Room updates

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Netlify

1. Connect repository to Netlify
2. Set build command: \`npm run build\`
3. Set publish directory: \`dist\`
4. Configure environment variables

### Manual Deployment

\`\`\`bash
npm run build
# Upload dist/ folder to your web server
\`\`\`

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Considerations

### Production Checklist

- [ ] Enable email confirmation in Supabase
- [ ] Set up custom domain with HTTPS
- [ ] Configure CORS policies
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Review RLS policies
- [ ] Enable 2FA for admin accounts

### Input Validation

All user inputs are sanitized and validated:
- HTML tags stripped
- Script injection prevented
- Character limits enforced
- Special character ratio limits

## 📊 Performance Optimizations

- **Lazy loading** for components and images
- **Efficient queries** with proper indexing
- **Real-time subscriptions** only for active rooms
- **Image compression** for uploads
- **Memoization** for expensive calculations
- **Pagination** for large message lists

## 🎨 Customization

### Theming

Modify \`src/index.css\` for custom colors and styles:
- CSS custom properties for easy theming
- Dark/light mode support
- Consistent design system

### Components

Extend or modify components in \`src/components/\`:
- Shadcn/UI base components
- Custom chat components
- Reusable UI elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔄 Updates

Keep your dependencies updated:
\`\`\`bash
npm update
\`\`\`

Stay updated with Supabase changes and security patches.