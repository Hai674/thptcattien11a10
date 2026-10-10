import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Kiểm tra xem cấu hình Firebase có đầy đủ không
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.authDomain
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ [Firebase Config] Chưa cấu hình thông tin Firebase hoặc file .env chưa có khóa hợp lệ.\n' +
    'Vui lòng sao chép .env.example thành .env và điền các khóa VITE_FIREBASE_*.'
  );
}

try {
  // Khởi tạo app nếu chưa có, hoặc tái sử dụng instance đã tồn tại
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig.apiKey ? firebaseConfig : {
    // Giá trị dự phòng tạm thời giúp tránh crash khi chưa có env thực tế
    apiKey: "AIzaSyMockKeyForInitializationOnly_11A10",
    authDomain: "mock-11a10.firebaseapp.com",
    projectId: "mock-11a10",
    storageBucket: "mock-11a10.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  });

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('❌ [Firebase Error] Lỗi khi khởi tạo Firebase instance:', error);
  throw error;
}

export { app, auth, db, storage };
export default app;
