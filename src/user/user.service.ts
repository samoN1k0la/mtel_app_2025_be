import { Injectable } from '@nestjs/common';
import { firestore } from '../firebase.config';

@Injectable()
export class UserService {
  // Get user info by email
  async getUserInfoByEmail(email: string) {
    try {
      // Query Firestore to find the user's document by email
      const usersCollection = firestore.collection('users');
      const querySnapshot = await usersCollection.where('email', '==', email).get();

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      // Assuming email is unique, we take the first document
      const userDoc = querySnapshot.docs[0].data();

      return {
        status: 'OK',
        message: 'User found',
        data: userDoc,
      };
    } catch (error) {
      console.error('Error fetching user info:', error.message);
      throw new Error('Unable to fetch user info');
    }
  }
}

