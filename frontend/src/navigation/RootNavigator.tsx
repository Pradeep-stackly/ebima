import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import BottomTabs from './BottomTabs';

export default function RootNavigator() {
  const { status } = useAuth();

  if (status === 'restoring') {
    return <LoadingState message="Checking your session..." />;
  }
  return status === 'signedIn' ? <BottomTabs /> : <LoginScreen />;
}
