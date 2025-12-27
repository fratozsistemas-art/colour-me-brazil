# 🎨 Colour Me Brazil - Interactive Learning Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![COPPA Compliant](https://img.shields.io/badge/COPPA-Compliant-green.svg)](public/legal/coppa-compliance.md)
[![GDPR Ready](https://img.shields.io/badge/GDPR-Ready-green.svg)](public/legal/privacy-policy.md)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)](public/manifest.json)

An interactive bilingual (English/Portuguese) coloring and storytelling app for children aged 6-12 to explore Brazilian culture, folklore, and the Amazon rainforest through art and reading.

![Colour Me Brazil](https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69383fc9e0a81f2fec355d14/fb45bdf53_A_beautiful_watercolor_toucan_bird_illustration_in-1765301342087.png)

## ✨ Features

### 📚 Core Features
- **Interactive Stories**: Bilingual storytelling with text-to-speech support
- **Coloring Activities**: Digital coloring pages with multiple brush styles
- **Reading Progress**: Track books completed and reading achievements
- **Gamification**: Points, badges, leaderboards, daily challenges
- **Offline Mode**: Download books for offline reading
- **Parent Portal**: Comprehensive parental controls and progress monitoring

### 🌟 Community Features
- **Forum**: Moderated community discussions
- **Showcase**: Public gallery for colored artwork
- **Collaborative Stories**: Community-created narratives
- **Reading Paths**: Curated learning journeys

### 🎯 Gamification System
- Experience points (XP) and level progression
- Achievement badges and trophies
- Daily challenges and quests
- Streak tracking
- Rewards shop

### 🛡️ Safety & Compliance
- ✅ **COPPA Compliant** (Children's Online Privacy Protection Act)
- ✅ **GDPR Ready** (General Data Protection Regulation)
- ✅ **LGPD Ready** (Lei Geral de Proteção de Dados)
- Verifiable parental consent system
- Age gate verification
- Comprehensive privacy controls
- Content moderation system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/colour-me-brazil.git
cd colour-me-brazil
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

## 📦 Project Structure

```
colour-me-brazil/
├── public/
│   ├── legal/                 # Legal documents (Privacy, Terms, etc.)
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/
│   ├── api/                   # Base44 API integration
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── legal/             # Legal/compliance components
│   │   ├── settings/          # Settings components
│   │   ├── ui/                # shadcn/ui components
│   │   └── ...                # Feature-specific components
│   ├── pages/                 # Page components (26 pages)
│   ├── lib/                   # Utilities and helpers
│   ├── hooks/                 # Custom React hooks
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── functions/                 # Cloud functions (Base44)
├── .env.example               # Environment variables template
├── package.json               # Dependencies
├── vite.config.js             # Vite configuration
└── tailwind.config.js         # Tailwind CSS configuration
```

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite 6 |
| **Routing** | React Router DOM v6 |
| **UI** | Tailwind CSS, shadcn/ui, Radix UI |
| **Animation** | Framer Motion |
| **State** | TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Backend** | Base44 SDK (BaaS) |
| **Storage** | Supabase |
| **Payments** | Stripe |
| **Maps** | Leaflet |
| **Charts** | Recharts |

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # Run TypeScript checks
```

## 🌐 Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_SERVER_URL=https://your-server.base44.com
VITE_BASE44_TOKEN=your_token
VITE_BASE44_FUNCTIONS_VERSION=v1

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

## 📱 Progressive Web App (PWA)

The app is PWA-ready with:
- Offline support via Service Worker
- App installation capability
- Background sync
- Push notifications (optional)

### Installing as PWA
1. Visit the site in a supported browser
2. Look for "Install App" prompt in address bar
3. Click to install to home screen

## 🧪 Testing

### Running Tests
```bash
npm test              # Run all tests
npm test:watch        # Watch mode
npm test:coverage     # Coverage report
```

### Testing Checklist
- [ ] Unit tests for components
- [ ] Integration tests for pages
- [ ] E2E tests for critical flows
- [ ] Accessibility tests

## 🔐 Security

### COPPA Compliance
- Age gate on registration
- Verifiable parental consent
- Minimal data collection
- Parent portal for data management
- No third-party marketing to children

### Data Protection
- Encrypted data transmission (HTTPS)
- Secure authentication (Base44)
- Privacy-first cookie policy
- GDPR/LGPD data rights support
- Regular security audits

## 🌍 Internationalization

Supported Languages:
- 🇺🇸 English (en-US)
- 🇧🇷 Portuguese (pt-BR)

## 📄 Legal Documents

All legal documents are available in `/public/legal/`:
- [Privacy Policy](public/legal/privacy-policy.md)
- [Terms of Service](public/legal/terms-of-service.md)
- [Cookie Policy](public/legal/cookie-policy.md)
- [COPPA Compliance](public/legal/coppa-compliance.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Email**: support@colourmebrazil.com
- **Privacy**: privacy@colourmebrazil.com
- **COPPA**: coppa@colourmebrazil.com
- **Bugs**: bugs@colourmebrazil.com

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Base44 for backend infrastructure
- shadcn/ui for beautiful components
- Supabase for file storage
- All contributors and testers

## 📊 Project Stats

- **26 Pages** - Comprehensive feature set
- **136+ Components** - Modular architecture
- **COPPA/GDPR/LGPD** - Fully compliant
- **PWA Ready** - Installable app
- **Offline First** - Works without internet

---

**Made with ❤️ for children and families exploring Brazilian culture**

🦜 Explore • 🎨 Create • 📚 Learn • 🌿 Discover Brazil
