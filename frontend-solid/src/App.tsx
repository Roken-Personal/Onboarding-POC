import { Route, Routes } from '@solidjs/router';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OnboardingForm from './components/OnboardingForm';
import RequestDetail from './components/RequestDetail';

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

