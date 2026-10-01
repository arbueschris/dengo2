import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Como o app se comporta quando chega um aviso com ele aberto: mostra o banner normalmente.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pede permissão e devolve o "token" deste celular (ExponentPushToken[...]).
 * Devolve null se não der (Expo Go, emulador, permissão negada, sem projectId...).
 * O app continua funcionando normalmente sem o token, só não recebe avisos com ele fechado.
 */
export async function registerForPush() {
  try {
    if (!Device.isDevice) return null;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('dengo', {
        name: 'Dengo',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DE7150',
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return null;
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) return null;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (e) {
    return null;
  }
}

/** Envia um aviso para o celular do par usando o serviço gratuito de push da Expo. */
export async function sendPush(to, title, body, data = {}) {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, title, body, data, sound: 'default', channelId: 'dengo', priority: 'high' }),
    });
  } catch (e) {
    /* sem internet: o dado já foi salvo, o aviso é só um extra */
  }
}
