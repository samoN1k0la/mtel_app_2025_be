import { 
  Controller, 
  Get, 
  Query, 
  Post, 
  Body, 
  Headers, 
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
    return this.userService.getUsersByJobAndFilters(
      primaryJob, 
      secondaryJob,
      routedSearchQuery,
      filterData
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

  @Patch('update')
  async updateUser(@Body() body: any) {
    const { email, field, value } = body;

    if (!email || !field) {
      throw new HttpException('Missing required parameters', HttpStatus.BAD_REQUEST);
    }

    // Prepare the data to update. If 'field' is an array, update all fields with the same value.
    const updateData = {};
    if (Array.isArray(field)) {
      if (!Array.isArray(value)) {
        throw new HttpException(
          'Expected value to be an array when field is an array',
          HttpStatus.BAD_REQUEST
        );
      }
      if (field.length !== value.length) {
        throw new HttpException(
          'Field and value arrays must have the same length',
          HttpStatus.BAD_REQUEST
        );
      }
      field.forEach((f: string, index: number) => {
        updateData[f] = value[index];
      });
    } else {
      updateData[field] = value;
    }

    try {
      const result = await this.userService.updateUserInfo(email, updateData);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

