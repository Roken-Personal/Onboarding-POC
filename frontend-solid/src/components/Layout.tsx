import { A } from '@solidjs/router';
import { JSX } from 'solid-js';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  // Prefetch components on hover for faster navigation
  const prefetchOnboardingForm = () => {
    import('../components/OnboardingForm');
  };

  return (
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <A href="/" class="text-xl font-bold text-blue-600">
                  Onboarding System
                </A>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <A
                  href="/"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  activeClass="border-blue-500 text-gray-900"
                >
                  Dashboard
                </A>
                <A
                  href="/new"
                  onMouseEnter={prefetchOnboardingForm}
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  activeClass="border-blue-500 text-gray-900"
                >
                  New Request
                </A>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {props.children}
      </main>
    </div>
  );
}

