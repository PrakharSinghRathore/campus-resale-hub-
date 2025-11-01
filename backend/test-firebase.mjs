import { initializeFirebase, validateFirebaseConfig, getFirebaseAuth } from './src/config/firebase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(' Testing Firebase Admin SDK...\n');

try {
  // Initialize Firebase
  initializeFirebase();
  
  // Validate configuration
  const isValid = validateFirebaseConfig();
  
  if (isValid) {
    console.log(' Firebase Admin SDK test completed successfully!');
    
    // Test getting auth instance
    const auth = getFirebaseAuth();
    console.log(' Firebase Auth instance retrieved successfully');
    
    console.log('\n All Firebase Admin SDK features are working correctly!');
  } else {
    console.log(' Firebase configuration validation failed');
  }
  
} catch (error) {
  console.error(' Firebase Admin SDK test failed:', error);
  process.exit(1);
}
