import { lazy } from 'solid-js';
import { Route, Routes } from '@solidjs/router';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

// Lazy load routes for code splitting
const OnboardingForm = lazy(() => import('./components/OnboardingForm'));
const RequestDetail = lazy(() => import('./components/RequestDetail'));

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" component={Dashboard} />
        <Route path="/new" component={OnboardingForm} />
        <Route path="/request/:id" component={RequestDetail} />
      </Routes>
    </Layout>
  );
}

