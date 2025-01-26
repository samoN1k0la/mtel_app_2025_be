import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firebaseAuth, clientAuth, firestore } from '../firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';

@Injectable()
export class AuthService { 
  // Login with email and password
  async loginWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      console.log("User logged in:", userCredential.user);
      return { status: 'OK', message: "Login successful", user: userCredential.user };
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw new Error("Invalid email or password");
    }
  }

  // Guest Login
  async guestLogin() {
    try { 
      return { status: 'OK', message: 'Guest login successful' };
    } catch (error) {
      throw new UnauthorizedException('Guest login failed');
    }
  }

  // Register new user
  async register(
    name: string,
    email: string,
    password: string,
    location: string,
    accountType: string
  ) {
    try {
      // Create a new user in Firebase Authentication
      const userRecord = await firebaseAuth.createUser({
        email,
        password,
      });

      // Save user details in Firestore
      const userDocRef = firestore.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        name,
        email,
        location,
        accountType,
        createdAt: new Date().toISOString(),
        primaryJob: "",
        secondaryJob: "",
        description: "",
        portfolio: "",
        images: "",
        servicePricingType: "",
        servicePrice: "",
      });

      return { status: 'OK', uid: userRecord.uid, email: userRecord.email, message: 'Registration successful' };
    } catch (error) {
      console.error("Registration error:", error.message);
      throw new UnauthorizedException('Error during registration');
    }
  }
}

