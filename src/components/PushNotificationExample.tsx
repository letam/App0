import { Button } from 'react-native';
import * as Device from 'expo-device';

import { useNotifications } from '../contexts/notifications';
import { Text, View } from './Themed';

export default function PushNotificationExample() {
  const { expoPushToken, notification } = useNotifications();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Push Notification Example
      </Text>
      {!Device.isDevice && (
        <Text style={{ color: 'lightcoral', marginBottom: 4 }}>
          NOTE: Must use physical device for Push Notifications
        </Text>
      )}
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
