export interface UserState {
  user: any | null; // Stores user details upon successful login/register
  error: string | null; // Error message if any API call fails
  isLoading: boolean; // Indicates loading status
}
