import { Subscription } from 'expo-modules-core';
import { Notification } from 'expo-notifications';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface INotificationsContext {
  expoPushToken: string;
  notification: Notification | undefined;
}

const NotificationsContext = createContext({
  expoPushToken: '',
  notification: undefined,
} as INotificationsContext);

export function useNotifications(): INotificationsContext {
  return useContext(NotificationsContext);
}

const useNotificationsContextManager = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notification>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token as string));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current as Subscription);
      Notifications.removeNotificationSubscription(responseListener.current as Subscription);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};

export function NotificationsContextProvider({ children }: { children: ReactNode }): ReactElement {
  const value = useNotificationsContextManager();
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.log('NOTE: Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
