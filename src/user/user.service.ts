import { 
  Injectable, 
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
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
 
  async getUsersByJobAndFilters(
    primaryJob?: string, 
    secondaryJob?: string,
    routedSearchQuery?: string,
    filterData?: any 
  ) {
    try {
      const usersCollection = firestore.collection('users');
      let queryPrimaryJob;
      let querySecondaryJob;
      let queryRoutedSearchQuery;
      let queryLocation;
      let users: any[] = [];
      
      console.log({
        primaryJob,
        secondaryJob,
        routedSearchQuery,
        filterData,
      });

      // Construct query for primaryJob if provided
      if (primaryJob) {
        queryPrimaryJob = usersCollection.where('primaryJob', '==', primaryJob);
      }

      // Construct query for secondaryJob if provided
      if (secondaryJob) {
        querySecondaryJob = usersCollection.where('secondaryJob', '==', secondaryJob);
      }

      // Construct query for routedSearchQuery if provided
      if (routedSearchQuery) {
        queryRoutedSearchQuery = usersCollection
          .where('primaryJob', '>=', routedSearchQuery)
          .where('primaryJob', '<=', routedSearchQuery + '\uf8ff');
      }

      // Construct query for location filter if provided
      if (filterData?.location) {
        queryLocation = usersCollection.where('location', '>=', filterData.location.toLowerCase())
                                      .where('location', '<=', filterData.location.toLowerCase() + '\uf8ff');
      }

      // Apply price filters if provided
      if (filterData) {
        if (filterData.priceType && filterData.priceType !== "") {
          queryPrimaryJob = queryPrimaryJob?.where('servicePricingType', '==', filterData.priceType);
          querySecondaryJob = querySecondaryJob?.where('servicePricingType', '==', filterData.priceType);
          queryRoutedSearchQuery = queryRoutedSearchQuery?.where('servicePricingType', '==', filterData.priceType);
        }
      }

      // Fetch results for each individual query
      if (queryPrimaryJob) {
        const snapshot = await queryPrimaryJob.get();
        snapshot.docs.forEach((doc) => users.push(doc.data()));
      }

      if (querySecondaryJob) {
        const snapshot = await querySecondaryJob.get();
        snapshot.docs.forEach((doc) => users.push(doc.data()));
      }

      if (queryRoutedSearchQuery) {
        const snapshot = await queryRoutedSearchQuery.get();
        snapshot.docs.forEach((doc) => users.push(doc.data()));
      }

      if (queryLocation) {
        const snapshot = await queryLocation.get();
        snapshot.docs.forEach((doc) => users.push(doc.data()));
      }

      // Remove duplicates based on email if needed
      users = users.filter((value, index, self) =>
        index === self.findIndex((t) => t.email === value.email)
      );
      console.log(users);
      return { status: 'OK', users };
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw new Error('Error fetching users');
    }
  }
  
 
  async updateUserInfo(email: string, updateData: Record<string, any>) {
    const usersCollection = firestore.collection('users');
    const snapshot = await usersCollection.where('email', '==', email).get();

    if (snapshot.empty) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update(updateData);
    return { success: true, message: 'User updated successfully' };
  }

  async addReviewByEmail(
    userEmail: string, 
    reviewerEmail: string,
    rating: number, 
    reviewText: string, 
    imageUrls: string[]) {

    // Find user by email
    const userQuery = await firestore.collection('users').where('email', '==', userEmail).limit(1).get();
    
    if (userQuery.empty) {
      throw new NotFoundException('User not found');
    }

    // Get the first matching document
    const userDoc = userQuery.docs[0];
    const userRef = userDoc.ref;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ForbiddenException('Rating must be between 1 and 5');
    }

    // Create review object
    const newReview = {
      rating,
      reviewText,
      imageUrls,
      reviewerEmail,
      createdAt: new Date().toISOString(),
    };

    // Update Firestore document (add review to array)
    await userRef.update({
      reviews: admin.firestore.FieldValue.arrayUnion(newReview),
    });

    return { message: 'Review added successfully!', review: newReview };
  }

  async getUserRatingByEmail(userEmail: string) {
    // Find user by email
    const userQuery = await firestore.collection('users').where('email', '==', userEmail).limit(1).get();

    if (userQuery.empty) {
      throw new NotFoundException('User not found');
    }

    // Get the first matching document
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check if the user has reviews
    if (!userData.reviews || !Array.isArray(userData.reviews) || userData.reviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    // Calculate average rating
    const totalReviews = userData.reviews.length;
    const sumRatings = userData.reviews.reduce((sum, review) => sum + parseInt(review.rating), 0);
    const averageRating = sumRatings / totalReviews;

    await userDoc.ref.update({
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
    });

    return {
      averageRating: parseFloat(averageRating.toFixed(2)), // Round to 2 decimals
      reviewCount: totalReviews,
    };
  }
}

