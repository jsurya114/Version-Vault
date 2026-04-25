import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { ROUTES } from '../../../constants/routes';
import {
  createCheckoutThunk,
  cancelSubscriptionThunk,
  getSubscriptionStatusThunk,
} from '../../../features/subscription/subscriptionThunks';
import { getMeThunk } from '../../../features/auth/authThunks';
import {
  selectIsPro,
  selectSubscriptionLoading,
  selectSubscriptionError,
} from '../../../features/subscription/subscriptionSelector';
import {
  Sparkles,
  Zap,
  Check,
  X,
  Crown,
  Bot,
  AlertCircle,
  XCircle,
  CheckCircle,
} from 'lucide-react';

const FREE_FEATURES = [
  { text: 'Unlimited public repositories', included: true },
  { text: 'Basic Git operations', included: true },
  { text: 'Collaboration & PRs', included: true },
  { text: 'Issue tracking', included: true },
  { text: 'AI Agent repo scaffolding', included: false },
  { text: 'Priority support', included: false },
];

const PRO_FEATURES = [
  { text: 'Everything in Free', included: true },
  { text: 'AI Agent repo scaffolding', included: true },
  { text: 'Unlimited private repositories', included: true },
  { text: 'Priority support', included: true },
  { text: 'Early access to new features', included: true },
];

const SubscriptionPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const isPro = useAppSelector(selectIsPro);
  const isLoading = useAppSelector(selectSubscriptionLoading);
  const error = useAppSelector(selectSubscriptionError);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const queryStatus = searchParams.get('status');

  useEffect(() => {
    if (queryStatus === 'success') {
      setShowSuccessModal(true);
      window.history.replaceState({}, '', '/subscription');

      // Webhooks take a few seconds to sync. We poll the backend briefly to ensure the local state updates.
      setTimeout(() => {
        dispatch(getSubscriptionStatusThunk());
        dispatch(getMeThunk());
      }, 1500);

      setTimeout(() => {
        dispatch(getSubscriptionStatusThunk());
        dispatch(getMeThunk());
      }, 4000);
    } else if (queryStatus === 'cancelled') {
      setShowCancelModal(true);
      window.history.replaceState({}, '', '/subscription');
    }

    dispatch(getSubscriptionStatusThunk());
  }, [dispatch, queryStatus]);

  const handleUpgrade = () => {
    dispatch(createCheckoutThunk());
  };

  const handleCancelSubscription = async () => {
    await dispatch(cancelSubscriptionThunk());
    setShowCancelConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 pt-20">
      <div className="max-w-5xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-2">
              <Crown className="w-3 h-3" /> CHOOSE YOUR WORKFLOW
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Scale your <span className="text-indigo-500">Development</span> with Pro.
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Upgrade for AI-powered repository creation, private storage, and priority access to our
            architect tools.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* FREE CARD */}
          <div
            className={`p-8 rounded-3xl bg-gray-900 border transition-all ${!isPro ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-800'}`}
          >
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">₹0</span>
              <span className="text-gray-500 text-sm"> / forever</span>
            </div>
            <ul className="space-y-4 mb-10">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {f.included ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-gray-700" />
                  )}
                  <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.text}</span>
                </li>
              ))}
            </ul>
            {!isPro && (
              <div className="w-full py-3 text-center bg-gray-800 text-gray-400 rounded-xl font-bold text-sm">
                Current Plan
              </div>
            )}
          </div>

          {/* PRO CARD */}
          <div
            className={`p-8 rounded-3xl bg-gray-900 border transition-all relative overflow-hidden ${isPro ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-800 hover:border-indigo-500/50'}`}
          >
            <div className="absolute top-0 right-0 py-1.5 px-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-xl flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Recommended
            </div>
            <h3 className="text-xl font-bold mb-2">Professional</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">₹299</span>
              <span className="text-gray-500 text-sm"> / month</span>
            </div>
            <ul className="space-y-4 mb-10">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-indigo-500" />
                  <span className="text-gray-300">{f.text}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="space-y-3">
                <div className="w-full py-3 text-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 fill-current" /> Pro Active
                </div>
                {!showCancelConfirm ? (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full text-gray-600 text-xs hover:text-red-400 transition font-medium"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <p className="text-[10px] text-red-400 mb-2 text-center font-medium">
                      Verify cancellation?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelSubscription}
                        className="flex-1 py-2 bg-red-500/10 text-red-400 text-xs rounded-lg font-bold border border-red-500/20 hover:bg-red-500/20 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1 py-2 bg-gray-800 text-gray-400 text-xs rounded-lg font-bold"
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-indigo-500/20"
              >
                {isLoading ? 'Processing...' : 'UPGRADE TO PRO'}
              </button>
            )}
          </div>
        </div>

        {/* Pro Quick Action */}
        {isPro && (
          <div className="max-w-4xl mx-auto mb-16">
            <Link
              to={ROUTES.REPO_CREATE}
              className="w-full py-5 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/25 group"
            >
              <Bot className="w-6 h-6 group-hover:animate-bounce" />
              Launch AI Repository Architect
              <Sparkles className="w-5 h-5 opacity-50" />
            </Link>
          </div>
        )}

        {/* Feature Spotlight */}
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">AI Agent Access</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pro users gain exclusive access to the AI Repository Architect. Describe your tech
              stack and architecture in the creator tool, and let the agent scaffold the entire
              project in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            {/* Confetti Effects using CSS Animations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50 flex items-center justify-center overflow-hidden">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping absolute top-10 left-10 delay-100"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping absolute bottom-20 right-10 delay-300"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping absolute top-20 right-20 delay-500"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute bottom-10 left-20 delay-700"></div>
            </div>

            <div className="mx-auto w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-500"></div>
              <CheckCircle className="w-12 h-12 text-indigo-400 z-10" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">Payment Successful!</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Your PRO subscription is now active! You have unlocked AI-powered agents and private
              repositories.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all"
            >
              Start Building Let's Go
            </button>
          </div>
        </div>
      )}

      {/* Cancelled/Failed Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-red-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl shadow-red-500/10">
            <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-white">Payment Cancelled</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              The checkout process was cancelled or failed. No charges were made.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  handleUpgrade();
                }}
                disabled={isLoading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-red-500/20"
              >
                {isLoading ? 'Loading...' : 'Retry Payment'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all border border-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
