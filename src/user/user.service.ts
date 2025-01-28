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

  async getUsersByJob(primaryJob?: string, secondaryJob?: string) {
    try {
      const usersCollection = firestore.collection('users');
      
      let queryPrimaryJob;
      let querySecondaryJob;
      if (primaryJob) {
        queryPrimaryJob = usersCollection.where('primaryJob', '==', primaryJob);
      }
      if (secondaryJob) {
        querySecondaryJob = usersCollection.where('secondaryJob', '==', secondaryJob);
      }
      
      let snapshot;
      let users = [];

      // Fetch users matching primaryJob, if provided
      if (queryPrimaryJob) {
        snapshot = await queryPrimaryJob.get();
        users = users.concat(snapshot.docs.map((doc) => doc.data()));
      }

      // Fetch users matching secondaryJob, if provided
      if (querySecondaryJob) {
        snapshot = await querySecondaryJob.get();
        users = users.concat(snapshot.docs.map((doc) => doc.data()));
      }

      // Remove duplicates (if the same user appears in both queries)
      users = Array.from(new Set(users.map((user) => user.email)))
        .map((email) => users.find((user) => user.email === email));

      return { status: 'OK', users };
    } catch (error) {
      console.error('Error fetching users by job:', error.message);
      throw new Error('Error fetching users');
    }
  }
}

