import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// SVG Icon Components
const DatabaseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const CommitIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);

const MergeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <path d="M6 8v8" />
    <path d="M18 8c0 4-3 6-6 6" />
    <path d="M12 14l-2 2 2 2" />
  </svg>
);

const IssueIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const Navbar = React.memo(() => (
  <nav className="border-b border-gray-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-50">
    <div className="flex items-center gap-4 sm:gap-8">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <GitHubIcon />
        </div>
        <span className="font-bold text-white text-sm sm:text-base">VersionVault</span>
      </div>
      <div className="hidden md:flex items-center gap-6">
        {['Product', 'Pricing', 'Docs'].map((item) => (
          <span
            key={item}
            className="text-gray-400 hover:text-white text-sm cursor-pointer transition"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        to={ROUTES.LOGIN}
        className="text-gray-300 hover:text-white text-xs sm:text-sm transition px-2 sm:px-3 py-1.5"
      >
        Sign in
      </Link>
      <Link
        to={ROUTES.REGISTER}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-lg transition"
      >
        Sign up
      </Link>
    </div>
  </nav>
));

const Hero = React.memo(() => (
  <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 text-center">
    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-blue-400 text-xs">With VersionVault there's a better way</span>
    </div>

    <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
      VersionVault — Where developers
      <br className="hidden sm:block" /> build together.
    </h1>

    <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
      The next-generation code hosting platform built for speed, security, and seamless
      collaboration. Deploy faster than ever.
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
      <Link
        to={ROUTES.REGISTER}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm text-center"
      >
        Start Getting More
      </Link>
      <Link
        to={ROUTES.LOGIN}
        className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm text-center"
      >
        View Enterprise Demo
      </Link>
    </div>

    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden text-left shadow-2xl max-w-2xl mx-auto">
      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-gray-500 text-xs">main / repo</span>
      </div>
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-1.5 overflow-x-auto">
        <p>
          <span className="text-gray-500">$</span>{' '}
          <span className="text-green-400">git init version-vault</span>
        </p>
        <p className="text-gray-500">Downloading objects: 12 done.</p>
        <p className="text-gray-500">Resolving deltas: 850k OBs done.</p>
        <p className="text-gray-500">Delta compression using up to 8 threads.</p>
        <p>
          <span className="text-yellow-400">warning</span>{' '}
          <span className="text-gray-400">Checking connectivity... done</span>
        </p>
        <p>
          <span className="text-blue-400">commit</span>{' '}
          <span className="text-gray-400">3f9a2c1</span>{' '}
          <span className="text-gray-500">— feat: add dark mode support</span>
        </p>
        <p>
          <span className="text-green-400">success</span>{' '}
          <span className="text-gray-400">Repository initialized successfully ✓</span>
        </p>
      </div>
    </div>

    <div className="mt-8 flex flex-col items-center gap-2">
      <div className="flex -space-x-2">
        {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'].map(
          (color, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${color} border-2 border-gray-950 flex items-center justify-center text-xs font-bold`}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ),
        )}
      </div>
      <p className="text-gray-500 text-xs">Trusted by developers worldwide</p>
    </div>
  </section>
));

const features = [
  {
    icon: <DatabaseIcon />,
    iconBg: 'bg-blue-500/20 text-blue-400',
    label: 'database',
    title: 'Repositories',
    desc: 'Full access and control over all your private and public repos.',
  },
  {
    icon: <CommitIcon />,
    iconBg: 'bg-purple-500/20 text-purple-400',
    label: 'commit',
    title: 'Commits',
    desc: 'Blazing fast history tracking with rich metadata for every change.',
  },
  {
    icon: <MergeIcon />,
    iconBg: 'bg-green-500/20 text-green-400',
    label: 'merge',
    title: 'Pull Requests',
    desc: 'Streamlined PR workflows with comments, reviews, and CI gates.',
  },
  {
    icon: <IssueIcon />,
    iconBg: 'bg-orange-500/20 text-orange-400',
    label: 'disk',
    title: 'Issues',
    desc: 'Integrated issue management for your entire development team.',
  },
];

const Features = React.memo(() => (
  <section className="border-t border-gray-800 py-12 sm:py-20 px-4 sm:px-6">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Powerful features for modern teams
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Everything from small startups to tech giants trust VersionVault to keep things moving.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition group"
          >
            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-2 ${f.iconBg} rounded-lg px-2.5 py-1.5 mb-1`}
              >
                {f.icon}
                <span className="text-xs font-medium opacity-80">{f.label}</span>
              </div>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

const Security = React.memo(() => (
  <section className="border-t border-gray-800 py-12 sm:py-20 px-4 sm:px-6 bg-gray-900/20">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div className="md:w-1/2 w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          World-class security is
          <br />
          baked in by default.
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Protect your code at every step. VersionVault automatically scans for errors and alerts
          you to vulnerabilities in your dependencies before they become problems.
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-white text-sm font-medium">Secret Scanning</p>
            <p className="text-gray-500 text-xs">
              Automatically detects API keys & tokens across all protocols.
            </p>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Dependency Graph</p>
            <p className="text-gray-500 text-xs">
              Understand your dependency tree and security vulnerabilities.
            </p>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 w-full space-y-3">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-xs font-medium flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
              </svg>
              warning
            </span>
            <span className="text-gray-500 text-xs">2 Security Alerts Found</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-gray-300 text-xs">AWS Secret key exposed</span>
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">
                critical
              </span>
            </div>
            <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-gray-300 text-xs">lodash version vulnerable</span>
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">
                fix it
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-3">
            <span className="text-gray-400 text-xs">Security Score</span>
            <span className="text-green-400 font-bold text-sm">90/100</span>
          </div>
        </div>
      </div>
    </div>
  </section>
));

const CTABanner = React.memo(() => (
  <section className="py-12 sm:py-20 px-4 sm:px-6">
    <div className="max-w-4xl mx-auto bg-blue-600 rounded-2xl px-6 sm:px-10 py-10 sm:py-14 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
        Build the future of software, together.
      </h2>
      <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto">
        Join over 90 million developers who are already using VersionVault to build amazing things
        every single day.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Link
          to={ROUTES.REGISTER}
          className="w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-600 font-semibold px-6 py-2.5 rounded-lg transition text-sm text-center"
        >
          Create Free Account
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className="w-full sm:w-auto border border-white/40 hover:border-white text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm text-center"
        >
          Talk to Sales
        </Link>
      </div>
    </div>
  </section>
));

const Footer = React.memo(() => (
  <footer className="border-t border-gray-800 py-10 px-4 sm:px-8">
    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
          <span className="text-white font-bold text-sm">VersionVault</span>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed mb-3">
          Building the infrastructure for the next generation of developers.
        </p>
        <div className="flex flex-col gap-1">
          <span className="text-gray-600 text-xs cursor-pointer hover:text-gray-400">
            Public Group
          </span>
          <span className="text-gray-600 text-xs cursor-pointer hover:text-gray-400">Terminal</span>
        </div>
      </div>
      {[
        { title: 'Product', links: ['Actions', 'Packages', 'Security', 'Pricing'] },
        { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
        { title: 'Legal', links: ['Privacy', 'Terms', 'Cookie', 'Security'] },
      ].map((col) => (
        <div key={col.title}>
          <h4 className="text-white text-xs font-semibold mb-3">{col.title}</h4>
          <div className="flex flex-col gap-2">
            {col.links.map((link) => (
              <span
                key={link}
                className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition"
              >
                {link}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div>
        <h4 className="text-white text-xs font-semibold mb-3">Admin</h4>
        <Link
          to={ROUTES.ADMIN_LOGIN}
          className="text-gray-500 text-xs hover:text-gray-300 transition"
        >
          Admin Portal
        </Link>
      </div>
    </div>
    <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span className="text-gray-600 text-xs">© 2026 VersionVault, Inc.</span>
      <span className="text-gray-600 text-xs">All rights reserved.</span>
    </div>
  </footer>
));

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Security />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default LandingPage;
