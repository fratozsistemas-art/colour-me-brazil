import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ManageBooks from './pages/ManageBooks';
import BrandGuidelines from './pages/BrandGuidelines';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import SubmitContent from './pages/SubmitContent';
import ContentModeration from './pages/ContentModeration';
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
}

export const pagesConfig = {
    mainPage: "Library",
    Pages: PAGES,
    Layout: __Layout,
};