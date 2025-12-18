import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ManageBooks from './pages/ManageBooks';
import BrandGuidelines from './pages/BrandGuidelines';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import SubmitContent from './pages/SubmitContent';
import ContentModeration from './pages/ContentModeration';
import Showcase from './pages/Showcase';
import Forum from './pages/Forum';
import Events from './pages/Events';
import ReadingPaths from './pages/ReadingPaths';
import CollaborativeStories from './pages/CollaborativeStories';
import Home from './pages/Home';
import RewardsShop from './pages/RewardsShop';
import ParentPortal from './pages/ParentPortal';
import ManageUsers from './pages/ManageUsers';
import AudioGenerator from './pages/AudioGenerator';
import ArtGallery from './pages/ArtGallery';
import ManifestLibrary from './pages/ManifestLibrary';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Library": Library,
    "Profile": Profile,
    "Settings": Settings,
    "ManageBooks": ManageBooks,
    "BrandGuidelines": BrandGuidelines,
    "Shop": Shop,
    "Leaderboard": Leaderboard,
    "SubmitContent": SubmitContent,
    "ContentModeration": ContentModeration,
    "Showcase": Showcase,
    "Forum": Forum,
    "Events": Events,
    "ReadingPaths": ReadingPaths,
    "CollaborativeStories": CollaborativeStories,
    "Home": Home,
    "RewardsShop": RewardsShop,
    "ParentPortal": ParentPortal,
    "ManageUsers": ManageUsers,
    "AudioGenerator": AudioGenerator,
    "ArtGallery": ArtGallery,
    "ManifestLibrary": ManifestLibrary,
}

export const pagesConfig = {
    mainPage: "Library",
    Pages: PAGES,
    Layout: __Layout,
};