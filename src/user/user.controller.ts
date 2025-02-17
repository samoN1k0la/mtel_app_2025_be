import { Controller, Get, Query, Post, Body, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { firebaseAuth } from '../firebase.config';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get user info by email
  @Get('info')
  async getUserInfo(@Query('email') email: string) {
    if (!email) {
      return { status: 'Error', message: 'Email is required' };
    }

    try {
      const userInfo = await this.userService.getUserInfoByEmail(email);
      return userInfo;
    } catch (error) {
      return { status: 'Error', message: error.message };
    }
  }

  // Get users by profession
  @Get('list')
  async getUsersByJob(
    @Query('primaryJob') primaryJob?: string,
    @Query('secondaryJob') secondaryJob?: string,
    @Query('routedSearchQuery') routedSearchQuery?: string,
    @Query('filterData') filterData?: string
  ) {
    let filterParsed;
    if (filterData) {
      if (typeof filterData === 'string') {
        try {
          filterParsed = JSON.parse(filterData);
        } catch (error) {
          throw new Error('Invalid filter data format');
        }
      } else {
        throw new Error('filterData must be a stringified JSON object');
      }
    }

    console.log({
      primaryJob, 
      secondaryJob, 
      routedSearchQuery, 
      filterParsed
    });

    return this.userService.getUsersByJobAndFilters(
      primaryJob, 
      secondaryJob,
      routedSearchQuery,
      filterParsed
    );
  }

  @Post('review')
  async leaveReviewByEmail(
    @Body() body: { 
      userEmail: string; 
      reviewerEmail: string; 
      rating: number; 
      reviewText: string; 
      imageUrls: string[] },
  ) {

    return this.userService.addReviewByEmail(
      body.userEmail, 
      body.reviewerEmail, 
      body.rating, 
      body.reviewText, 
      body.imageUrls
    );
  }

  @Get('rating')
  async getUserRating(@Query('email') email: string) {
    return this.userService.getUserRatingByEmail(email);
  }
}

