import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ManageBooks from './pages/ManageBooks';
import BrandGuidelines from './pages/BrandGuidelines';
import Shop from './pages/Shop';
import GenerateCovers from './pages/GenerateCovers';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Library": Library,
    "Profile": Profile,
    "Settings": Settings,
    "ManageBooks": ManageBooks,
    "BrandGuidelines": BrandGuidelines,
    "Shop": Shop,
    "GenerateCovers": GenerateCovers,
}

export const pagesConfig = {
    mainPage: "Library",
    Pages: PAGES,
    Layout: __Layout,
};