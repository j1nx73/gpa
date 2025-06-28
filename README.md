# GPA Tracker 📊

A modern, full-stack web application for tracking and calculating academic performance across semesters. Built with Next.js, Supabase, and TypeScript.

## ✨ Features

### 🎯 Core Functionality
- **GPA Calculation** - Calculate semester GPA with preset course structures
- **Performance Tracking** - Monitor GPA progression over time with interactive charts
- **Academic Rankings** - View your position among peers
- **Grade Management** - Easy grade selection with visual feedback
- **Semester History** - Review and edit past semester records

### 🎨 User Experience
- **Preset Courses** - Pre-configured course lists for Freshman and Sophomore years
- **Interactive Charts** - Visual performance graphs using Recharts
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode Support** - Beautiful dark and light themes
- **Real-time Updates** - Instant feedback and data synchronization

### 🔐 Authentication & Security
- **Supabase Auth** - Secure user authentication
- **Row Level Security** - Data protection with RLS policies
- **Profile Management** - User profile customization
- **Session Management** - Persistent login sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gpa-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the contents of `scripts/database-setup.sql`

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Database Schema

### Tables

#### `profiles`
- User profile information
- Full name, student email, department, student ID

#### `semester_records`
- GPA records for each semester
- Year, semester, GPA, course details
- Unique constraint on (user_id, year, semester)

#### `user_settings`
- User preferences and settings
- Language, notification preferences

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring users can only access their own data.

## 🎓 Grade System

The application uses the following grade point scale:
- **A+** = 4.50
- **A** = 4.00
- **B+** = 3.50
- **B** = 3.00
- **C+** = 2.50
- **C** = 2.00
- **D+** = 1.50
- **D** = 1.00
- **F** = 0.00

## 📖 Preset Courses

### Freshman Year
**Fall Semester:**
- Academic English 1 (2 credits)
- Academic English Reading (2 credits)
- Calculus 1 (3 credits)
- Introduction to IT (3 credits)
- Physics 1 (3 credits)
- Physics Experiments 1 (1 credit)
- Object Oriented Programming 1 (3 credits)

**Spring Semester:**
- Academic English 2 (2 credits)
- Academic English Writing (2 credits)
- Calculus 2 (3 credits)
- Creative Engineering Design (3 credits)
- Physics 2 (3 credits)
- Physics Experiments 2 (1 credit)
- Object Oriented Programming 2 (3 credits)

### Sophomore Year
**Fall Semester:**
- Academic English 3 (2 credits)
- Basic Korean 1 (2 credits)
- Linear Algebra (3 credits)
- Engineering Maths (3 credits)
- Application Programming in Java (3 credits)
- Data Structure (3 credits)
- Circuit and Lab (3 credits)

**Spring Semester:**
- Academic English 4 (2 credits)
- Basic Korean 2 (2 credits)
- Discrete Mathematics (3 credits)
- Digital Logic & Circuit (3 credits)
- System Programming (3 credits)
- Computer Architecture (3 credits)
- History 1 (1 credit)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful component library
- **Recharts** - Interactive charts and graphs
- **Lucide React** - Icon library

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security
  - Authentication

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
gpa-tracker/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-form.tsx     # Authentication form
│   ├── home-page.tsx     # Home page component
│   └── app-sidebar.tsx   # Dashboard sidebar
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client configuration
├── scripts/              # Database setup scripts
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 🎯 Usage Guide

### For Students

1. **Sign Up/Login**
   - Create an account or sign in with existing credentials
   - Complete your profile with academic information

2. **Calculate GPA**
   - Navigate to Dashboard
   - Select your academic year and semester
   - Preset courses will load automatically
   - Select grades for each course
   - Click "Calculate GPA" to see your semester GPA
   - Save your results

3. **Track Performance**
   - View your performance graph on the home page
   - Check your academic standings
   - Review saved semesters and grades

4. **Manage Profile**
   - Update personal information
   - Customize app settings
   - View academic history

### For Administrators

1. **Database Management**
   - Monitor user data through Supabase dashboard
   - Review analytics and usage statistics
   - Manage database backups

2. **Course Updates**
   - Modify preset courses in the codebase
   - Update grade point scales if needed
   - Add new academic years/semesters

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Configuration
The application uses Supabase with the following features:
- **Authentication** - Email/password and social login
- **Database** - PostgreSQL with real-time capabilities
- **Storage** - File storage for user uploads
- **Edge Functions** - Serverless functions (if needed)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Supabase** for the excellent backend-as-a-service platform
- **Next.js** team for the amazing React framework
- **Recharts** for the interactive charting library

---

**Made with ❤️ for students and educators** 
