import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Home,
  Loader2,
} from 'lucide-react';
import {
  selectCurrentInvitation,
  selectInvitationLoading,
  selectInvitationError,
  selectInvitationSuccess,
} from '../../features/collaborator/invitationSelectors';
import {
  getInvitationByTokenThunk,
  acceptInvitationThunk,
  declineInvitationThunk,
} from '../../features/collaborator/invitationThunk';
import { resetInvitationState } from '../../features/collaborator/invitationSlice';
import PageLoader from '../../components/PageLoader';
import { ROUTES } from '../../constants/routes';

const AcceptInvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const invitation = useAppSelector(selectCurrentInvitation);
  const isLoading = useAppSelector(selectInvitationLoading);
  const error = useAppSelector(selectInvitationError);
  const successMessage = useAppSelector(selectInvitationSuccess);

  useEffect(() => {
    if (token) {
      dispatch(getInvitationByTokenThunk(token));
    }
    return () => {
      dispatch(resetInvitationState());
    };
  }, [token, dispatch]);

  const handleAccept = useCallback(() => {
    if (token) {
      dispatch(acceptInvitationThunk(token));
    }
  }, [token, dispatch]);

  const handleDecline = useCallback(() => {
    if (token) {
      dispatch(declineInvitationThunk(token));
    }
  }, [token, dispatch]);

  const handleGoHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  if (isLoading && !invitation) return <PageLoader />;

  // Invitation already resolved (accepted/declined/expired)
  if (invitation && invitation.status !== 'pending') {
    const statusConfig = {
      accepted: {
        icon: <CheckCircle className="w-10 h-10 text-green-400" />,
        bgColor: 'bg-green-500/10',
        label: 'Accepted',
      },
      declined: {
        icon: <XCircle className="w-10 h-10 text-red-400" />,
        bgColor: 'bg-red-500/10',
        label: 'Declined',
      },
      expired: {
        icon: <Clock className="w-10 h-10 text-yellow-400" />,
        bgColor: 'bg-yellow-500/10',
        label: 'Expired',
      },
    };
    const config = statusConfig[invitation.status as keyof typeof statusConfig];

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...styles.iconCircle, ...(config ? {} : {}) }}>
            <div
              className={`w-16 h-16 rounded-full ${config?.bgColor || 'bg-gray-500/10'} flex items-center justify-center`}
            >
              {config?.icon || <Clock className="w-10 h-10 text-gray-400" />}
            </div>
          </div>
          <h1 style={styles.title}>Invitation {config?.label || invitation.status}</h1>
          <p style={styles.subtitle}>This invitation has already been {invitation.status}.</p>
          <button style={styles.primaryBtn} onClick={handleGoHome} className="group">
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <Home className="w-4 h-4" />
              Go to Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Error - invalid or not found
  if (error && !invitation) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h1 style={styles.title}>Invalid Invitation</h1>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.primaryBtn} onClick={handleGoHome}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <Home className="w-4 h-4" />
              Go to Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (successMessage) {
    const isAccepted = successMessage.includes('accepted');
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>
            <div
              className={`w-16 h-16 rounded-full ${isAccepted ? 'bg-green-500/10' : 'bg-gray-500/10'} flex items-center justify-center`}
            >
              {isAccepted ? (
                <Sparkles className="w-10 h-10 text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-gray-400" />
              )}
            </div>
          </div>
          <h1 style={styles.title}>{isAccepted ? 'Welcome!' : 'Declined'}</h1>
          <p style={styles.subtitle}>{successMessage}</p>
          {isAccepted && invitation && (
            <button
              style={styles.primaryBtn}
              onClick={() => navigate(`/${invitation.ownerUsername}/${invitation.repositoryName}`)}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                }}
              >
                Go to Repository
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          )}
          <button style={{ ...styles.secondaryBtn, marginTop: '8px' }} onClick={handleGoHome}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <Home className="w-4 h-4" />
              Go to Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  // Main invitation view
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        <h1 style={styles.title}>Repository Invitation</h1>
        <p style={styles.subtitle}>
          <strong>{invitation.ownerUsername}</strong> has invited you to collaborate on
        </p>
        <div style={styles.repoName}>{invitation.repositoryName}</div>
        <div style={styles.roleBadge}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Role: {invitation.role}
          </span>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button style={styles.primaryBtn} onClick={handleAccept} disabled={isLoading}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isLoading ? 'Processing...' : 'Accept Invitation'}
            </span>
          </button>
          <button style={styles.declineBtn} onClick={handleDecline} disabled={isLoading}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <XCircle className="w-4 h-4" />
              Decline
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    padding: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '460px',
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  iconCircle: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    fontFamily: "'Inter', sans-serif",
  },
  subtitle: {
    fontSize: '15px',
    color: '#a0aec0',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  repoName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#818cf8',
    padding: '12px 20px',
    background: 'rgba(129, 140, 248, 0.1)',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#34d399',
    background: 'rgba(52, 211, 153, 0.1)',
    padding: '6px 16px',
    borderRadius: '20px',
    marginBottom: '24px',
    fontWeight: '500',
    textTransform: 'capitalize' as const,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  primaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryBtn: {
    padding: '12px 24px',
    backgroundColor: '#374151',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  declineBtn: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#f87171',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorText: {
    color: '#f87171',
    fontSize: '14px',
    marginBottom: '16px',
  },
};

export default AcceptInvitationPage;
