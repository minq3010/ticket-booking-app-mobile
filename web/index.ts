// Layouts
export { default as WebLayout } from './layouts/WebLayout';
export { default as WebHeader } from './layouts/WebHeader';
export { default as WebSidebar } from './layouts/WebSidebar';
export { LoginLayout } from './layouts/LoginLayout';

// Pages
export { default as WebEventsPage } from './pages/events/EventsPage';
export { default as WebTicketsPage } from './pages/tickets/TicketsPage';

// Components
export { WebCard, WebStatsCard, WebEmptyState } from './components/WebComponents';

// Styles
export { webStyles, getResponsiveValue, isLargeScreen, isMobileWeb } from './styles/webStyles';
