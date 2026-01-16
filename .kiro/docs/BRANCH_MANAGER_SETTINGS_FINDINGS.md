# Branch Manager Settings Implementation Findings

## Services
- **Profile Fetching**: `profileService.getProfile()` uses `GET /auth/profile`.
- **Profile Update**: `SettingsService.updateProfile` uses `PATCH /users/me`.
- **Avatar Upload**: `SettingsService.uploadAvatar` uses `PATCH /users/me/profile-picture`.

## Files
- `app/dashboard/bm/setting/page.tsx`: Uses `profileService.getProfile()`.
- `app/services/profileService.ts`: `apiServer.get('${apiBaseUrl}/auth/profile')`.
- `app/services/settingsService.ts`:
    - `updateProfile`: `apiClient.patch('${apiBaseUrl}/users/me', data)`
    - `uploadAvatar`: `apiClient.patch('${apiBaseUrl}/users/me/profile-picture', formData)`

## Key Observations
- The Branch Manager (BM) branch attempts to use specific services for settings.
- We need to confirm if these endpoints work for System Admin or if System Admin requires different endpoints.
