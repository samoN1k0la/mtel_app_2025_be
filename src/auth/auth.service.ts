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
    accountType: string,
    profileImage: string,
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
        reviews: [],
        profileImage: profileImage,
      });

      return { status: 'OK', uid: userRecord.uid, email: userRecord.email, message: 'Registration successful' };
    } catch (error) {
      console.error("Registration error:", error.message);
      throw new UnauthorizedException('Error during registration');
    }
  }

  // Finish your profile (become an expert)
  async becomeExpert(
    email: string, // Email to identify the document in Firestore
    primaryJob: string,
    secondaryJob: string,
    description: string,
    portfolio: string,
    images: string,
    servicePrice: string,
    servicePricingType: string
  ) {
    try {
      // Query Firestore to find the user's document by email
      const usersCollection = firestore.collection('users');
      const querySnapshot = await usersCollection.where('email', '==', email).get();

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      // Assuming email is unique, there should only be one matching document
      const userDocRef = querySnapshot.docs[0].ref;

      // Update the user's document with the expert details
      await userDocRef.update({
        primaryJob,
        secondaryJob,
        description,
        portfolio,
        images,
        servicePrice,
        servicePricingType,
        accountType: "Ekspert",
      });

      return { status: 'OK', message: 'Profile updated to expert successfully' };
    } catch (error) {
      console.error('Error updating profile to expert:', error.message);
      throw new Error('Unable to update profile to expert');
    }
  }
}

