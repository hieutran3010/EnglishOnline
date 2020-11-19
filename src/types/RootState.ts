import { LoginState } from 'app/containers/Auth/Login/types';
import { UserProfileState } from 'app/containers/Auth/UserProfile/types';
import { HomepageState } from 'app/containers/HomePage/types';
import { PostState } from 'app/containers/Post/types';
import { CoursesState } from 'app/containers/Courses/types';
// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  homepage?: HomepageState;
  login?: LoginState;
  userProfile?: UserProfileState;
  post?: PostState;
  courses?: CoursesState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
