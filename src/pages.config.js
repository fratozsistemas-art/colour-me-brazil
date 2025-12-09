import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ManageBooks from './pages/ManageBooks';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Library": Library,
    "Profile": Profile,
    "Settings": Settings,
    "ManageBooks": ManageBooks,
}

export const pagesConfig = {
    mainPage: "Library",
    Pages: PAGES,
    Layout: __Layout,
};