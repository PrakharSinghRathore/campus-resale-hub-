import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
export const initializeFirebase = (): void => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'); // Ensure privateKey is a string and handle escaped newlines

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase Admin SDK environment variables. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY'
      );
    }

    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        projectId,
        clientEmail,
        privateKey,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.log('⚡ Firebase Admin SDK already initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Verify Firebase ID token
export const verifyIdToken = async (idToken: string): Promise<admin.auth.DecodedIdToken> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};

// Get user by UID
export const getFirebaseUser = async (uid: string): Promise<admin.auth.UserRecord> => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error: any) {
    console.error('❌ Failed to get Firebase user:', error.message);
    throw new Error('User not found');
  }
};

// Update user custom claims (for admin roles, etc.)
export const setUserCustomClaims = async (uid: string, claims: object): Promise<void> => {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims updated for user ${uid}:`, claims);
  } catch (error: any) {
    console.error('❌ Failed to set custom claims:', error.message);
    throw new Error('Failed to update user claims');
  }
};

// Delete Firebase user
export const deleteFirebaseUser = async (uid: string): Promise<void> => {
  try {
    await admin.auth().deleteUser(uid);
    console.log(`✅ Firebase user ${uid} deleted successfully`);
  } catch (error: any) {
    console.error('❌ Failed to delete Firebase user:', error.message);
    throw new Error('Failed to delete user');
  }
};

// List users with pagination
export const listFirebaseUsers = async (
  maxResults: number = 1000,
  pageToken?: string
): Promise<{
  users: admin.auth.UserRecord[];
  pageToken?: string;
}> => {
  try {
    const listUsersResult = await admin.auth().listUsers(maxResults, pageToken);
    return {
      users: listUsersResult.users,
      pageToken: listUsersResult.pageToken,
    };
  } catch (error: any) {
    console.error('❌ Failed to list Firebase users:', error.message);
    throw new Error('Failed to fetch users');
  }
};

// Create custom token (for testing or server-side auth)
export const createCustomToken = async (uid: string, additionalClaims?: object): Promise<string> => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error: any) {
    console.error('❌ Failed to create custom token:', error.message);
    throw new Error('Failed to create custom token');
  }
};

// Validate Firebase project configuration
export const validateFirebaseConfig = (): boolean => {
  try {
    const app = admin.app();
    const projectId = app.options.projectId;
    
    if (!projectId) {
      throw new Error('Firebase project ID not found');
    }
    
    console.log(`✅ Firebase project validated: ${projectId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Firebase configuration validation failed:', error.message);
    return false;
  }
};

export default admin;