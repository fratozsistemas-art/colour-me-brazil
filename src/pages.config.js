import { lazy } from 'react';
import __Layout from './Layout.jsx';

const ArtGallery = lazy(() => import('./pages/ArtGallery'));
const AudioGenerator = lazy(() => import('./pages/AudioGenerator'));
const BrandGuidelines = lazy(() => import('./pages/BrandGuidelines'));
const CollaborativeStories = lazy(() => import('./pages/CollaborativeStories'));
const ContentModeration = lazy(() => import('./pages/ContentModeration'));
const CuratorDashboard = lazy(() => import('./pages/CuratorDashboard'));
const Events = lazy(() => import('./pages/Events'));
const Forum = lazy(() => import('./pages/Forum'));
const GenerateCovers = lazy(() => import('./pages/GenerateCovers'));
const Home = lazy(() => import('./pages/Home'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const LearningPaths = lazy(() => import('./pages/LearningPaths'));
const Library = lazy(() => import('./pages/Library'));
const ManageBooks = lazy(() => import('./pages/ManageBooks'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const ManifestBookReader = lazy(() => import('./pages/ManifestBookReader'));
const ManifestLibrary = lazy(() => import('./pages/ManifestLibrary'));
const ParentPortal = lazy(() => import('./pages/ParentPortal'));
const Profile = lazy(() => import('./pages/Profile'));
const ReadingPaths = lazy(() => import('./pages/ReadingPaths'));
const RewardsShop = lazy(() => import('./pages/RewardsShop'));
const Settings = lazy(() => import('./pages/Settings'));
const Shop = lazy(() => import('./pages/Shop'));
const Showcase = lazy(() => import('./pages/Showcase'));
const SubmitContent = lazy(() => import('./pages/SubmitContent'));
const ReadingSettings = lazy(() => import('./pages/ReadingSettings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
export const PAGES = {
    "ArtGallery": ArtGallery,
    "AudioGenerator": AudioGenerator,
    "BrandGuidelines": BrandGuidelines,
    "CollaborativeStories": CollaborativeStories,
    "ContentModeration": ContentModeration,
    "CuratorDashboard": CuratorDashboard,
    "Events": Events,
    "Forum": Forum,
    "GenerateCovers": GenerateCovers,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "LearningPaths": LearningPaths,
    "Library": Library,
    "ManageBooks": ManageBooks,
    "ManageUsers": ManageUsers,
    "ManifestBookReader": ManifestBookReader,
    "ManifestLibrary": ManifestLibrary,
    "ParentPortal": ParentPortal,
    "Profile": Profile,
    "ReadingPaths": ReadingPaths,
    "RewardsShop": RewardsShop,
    "Settings": Settings,
    "Shop": Shop,
    "Showcase": Showcase,
    "SubmitContent": SubmitContent,
    "ReadingSettings": ReadingSettings,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
