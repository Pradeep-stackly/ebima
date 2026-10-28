import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Dashboard: undefined;
  Analytics: undefined;
  Alerts: undefined;
  Profile: undefined;
  Users: undefined;
};

export type TabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;
