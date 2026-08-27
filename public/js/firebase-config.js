export const firebaseConfig = {
  projectId: 'rede-protege-maues',
  authDomain: 'rede-protege-maues.firebaseapp.com',
  appId: '1:883336596335:web:1e213dc38134a7f0c4369a',
  messagingSenderId: '883336596335',
  measurementId: 'G-N4VKXVTB8G',
  apiKey: 'AIzaSyAj0x-VM3Hk1tMDfp3iyJp52oAuMMBrUo4'
};

export const firebaseSparkModel = {
  runtime: 'hosting-auth-firestore-rules-appcheck',
  removed: ['Realtime Database as primary store', 'Cloud Storage uploads', 'Cloud Functions triggers', 'SMS dependency'],
  note: 'API key fica vazia no modulo operacional. Preencha apenas em ambiente autorizado.'
};

const SDK_VERSION = '10.12.5';
let firebaseContextPromise = null;

export async function getFirebaseContext(options = {}) {
  if (typeof window === 'undefined' || !firebaseConfig?.apiKey) return null;
  if (!firebaseContextPromise) {
    firebaseContextPromise = (async () => {
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`)
      ]);
      const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
      const auth = authSdk.getAuth(app);
      const db = firestoreSdk.getFirestore(app);
      return { app, auth, db, appSdk, authSdk, firestoreSdk };
    })().catch((error) => {
      console.warn('[firebase] Inicializacao indisponivel, usando modo local.', error);
      return null;
    });
  }
  const context = await firebaseContextPromise;
  if (options.requireAuth && !context?.auth?.currentUser) return null;
  return context;
}
