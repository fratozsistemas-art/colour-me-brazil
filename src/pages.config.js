import ArtGallery from './pages/ArtGallery';
import AudioGenerator from './pages/AudioGenerator';
import BrandGuidelines from './pages/BrandGuidelines';
import CollaborativeStories from './pages/CollaborativeStories';
import ContentModeration from './pages/ContentModeration';
import CuratorDashboard from './pages/CuratorDashboard';
import Events from './pages/Events';
import Forum from './pages/Forum';
import GenerateCovers from './pages/GenerateCovers';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import LearningPaths from './pages/LearningPaths';
import Library from './pages/Library';
import ManageBooks from './pages/ManageBooks';
import ManageUsers from './pages/ManageUsers';
import ManifestBookReader from './pages/ManifestBookReader';
import ManifestLibrary from './pages/ManifestLibrary';
import ParentPortal from './pages/ParentPortal';
import Profile from './pages/Profile';
import ReadingPaths from './pages/ReadingPaths';
import RewardsShop from './pages/RewardsShop';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Showcase from './pages/Showcase';
import SubmitContent from './pages/SubmitContent';
import ReadingSettings from './pages/ReadingSettings';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


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