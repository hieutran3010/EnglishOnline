import { VendorCreationState } from 'app/containers/Vendor/VendorCreation/types';
import { VendorQuotationState } from 'app/containers/Vendor/VendorQuotation/types';
import { VendorQuotationDetailState } from 'app/containers/Vendor/VendorQuotationDetail/types';
import { VendorDetailState } from 'app/containers/Vendor/VendorDetail/types';
import { CustomerCreateOrUpdatePageState } from 'app/containers/Customer/CustomerCreateOrUpdatePage/types';
import { WorkspaceState } from 'app/containers/BillAndWorkspace/Workspace/types';
import { BillAdvanceSearchState } from 'app/containers/BillAndWorkspace/BillAdvanceSearch/types';
import { UserListState } from 'app/containers/Auth/UserList/types';
import { UserCreateOrUpdatePageState } from 'app/containers/Auth/UserCreateOrUpdatePage/types';
import { LoginState } from 'app/containers/Auth/Login/types';
import { BillsInMonthState } from 'app/containers/BillAndWorkspace/BillsInMonth/types';
import { BillReportState } from 'app/containers/BillAndWorkspace/BillReport/types';
import { UserProfileState } from 'app/containers/Auth/UserProfile/types';
import { CustomerListState } from 'app/containers/Customer/CustomerList/types';
import { SettingState } from 'app/containers/Setting/types';
import { HomepageState } from 'app/containers/HomePage/types';
import { BillCreateOrUpdateState } from 'app/containers/BillAndWorkspace/BillCreateOrUpdate/types';
import { BillUpdatingState } from 'app/containers/BillAndWorkspace/BillUpdating/types';
import { BillDeliveryHistoryState } from 'app/containers/BillAndWorkspace/BillDeliveryHistory/types';
// [IMPORT NEW CONTAINERSTATE ABOVE] < Needed for generating containers seamlessly

/* 
  Because the redux-injectors injects your reducers asynchronously somewhere in your code
  You have to declare them here manually
*/
export interface RootState {
  homepage?: HomepageState;
  vendorCreation?: VendorCreationState;
  vendorQuotation?: VendorQuotationState;
  vendorQuotationDetail?: VendorQuotationDetailState;
  vendorDetail?: VendorDetailState;
  customerCreateOrUpdatePage?: CustomerCreateOrUpdatePageState;
  workspace?: WorkspaceState;
  billAdvanceSearch?: BillAdvanceSearchState;
  userList?: UserListState;
  userCreateOrUpdatePage?: UserCreateOrUpdatePageState;
  login?: LoginState;
  billsInMonth?: BillsInMonthState;
  billReport?: BillReportState;
  userProfile?: UserProfileState;
  customerList?: CustomerListState;
  setting?: SettingState;
  billCreateOrUpdate?: BillCreateOrUpdateState;
  billUpdating?: BillUpdatingState;
  billDeliveryHistory?: BillDeliveryHistoryState;
  // [INSERT NEW REDUCER KEY ABOVE] < Needed for generating containers seamlessly
}
