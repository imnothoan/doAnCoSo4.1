# Hangout Swipe-to-Profile Fix - Testing Guide

## Problem Fixed

When swiping right on a user card in the Hangout screen, the navigation to the user's profile wasn't working correctly. The issue was that the card index was being incremented immediately after navigation, causing confusion and potential navigation to the wrong profile.

## Solution Implemented

Modified the `onSwipeComplete` function in `app/(tabs)/hangout.tsx` to:
- **Swipe RIGHT**: Navigate to profile but keep the same card index (so users can return to the same card)
- **Swipe LEFT**: Skip to the next card (increment index)

## How to Test

### Prerequisites
1. Server must be running and accessible
2. At least 2 user accounts with hangout visibility enabled
3. Client app connected to the server

### Test Scenario 1: Swipe Right to View Profile

**Steps:**
1. Login as User A
2. Go to the Hangout tab
3. Ensure visibility is ON (toggle button should show "Visible")
4. Wait for user cards to load
5. **Swipe RIGHT** on a user card
6. **Expected Result:**
   - Navigation should occur immediately to the profile screen
   - Profile should show the correct user information
   - Profile screen should load properly with all details
7. Press back button to return to Hangout
8. **Expected Result:**
   - You should see the SAME card that you just viewed
   - The card should not have advanced to the next user

### Test Scenario 2: Swipe Left to Skip

**Steps:**
1. In the Hangout tab with cards loaded
2. Note the current user on the card (e.g., "John Doe")
3. **Swipe LEFT** on the card
4. **Expected Result:**
   - Card should animate away to the left
   - Next card should appear immediately
   - You should now see a different user (e.g., "Jane Smith")
   - No navigation should occur

### Test Scenario 3: Alternating Swipes

**Steps:**
1. In Hangout tab with at least 3 user cards
2. **Swipe RIGHT** on Card 1 (User A)
   - Profile of User A should open
3. Press back
   - Should return to Card 1 (User A)
4. **Swipe LEFT** on Card 1 (User A)
   - Should advance to Card 2 (User B)
5. **Swipe RIGHT** on Card 2 (User B)
   - Profile of User B should open
6. Press back
   - Should return to Card 2 (User B)
7. **Swipe LEFT** on Card 2 (User B)
   - Should advance to Card 3 (User C)

### Test Scenario 4: Profile Loading

**Steps:**
1. Swipe RIGHT on a card
2. **Check Profile Screen:**
   - [ ] User's avatar/background image loads
   - [ ] User's name displays correctly
   - [ ] User's bio displays
   - [ ] User's interests display
   - [ ] User's location displays
   - [ ] Follow button works
   - [ ] Message button works
3. Press back
4. Swipe RIGHT on the SAME card again
5. Profile should open again with the same information

### Test Scenario 5: End of Cards

**Steps:**
1. Swipe LEFT through all available cards
2. **Expected Result:**
   - When no more cards are available, should see:
   - "No more users available" message
   - Reload button
   - Turn On Visibility button (if visibility is off)

### Test Scenario 6: Console Logs

**Steps:**
1. Open React Native debugger or check Expo logs
2. Perform swipes
3. **Expected Logs:**
   - When swiping RIGHT: `📱 Navigating to profile: <username>`
   - When swiping LEFT: `⏭️ Skipping to next card`
   - No error messages should appear

## Debug Checklist

If the profile doesn't open when swiping right:

- [ ] Check if `currentUserProfile.username` exists and is not empty
- [ ] Check console for `⚠️ Cannot navigate to profile: username is missing`
- [ ] Verify the profile route is registered in `app/_layout.tsx`
- [ ] Check if API returned valid user data with username field
- [ ] Verify network connectivity to server
- [ ] Check if router is properly initialized

If the card advances when it shouldn't:

- [ ] Check the swipe direction detection (threshold: 120px)
- [ ] Verify `onSwipeComplete` is only incrementing index for left swipes
- [ ] Check if position is being reset correctly

## Technical Details

### Code Changes

**File:** `app/(tabs)/hangout.tsx`

**Function:** `onSwipeComplete`

**Before:**
```typescript
const onSwipeComplete = (direction: 'left' | 'right') => {
  const currentUserProfile = users[currentIndex];
  
  if (direction === 'right' && currentUserProfile?.username) {
    router.push(`/account/profile?username=${currentUserProfile.username}`);
  }
  
  // This was the problem - always incremented index
  position.setValue({ x: 0, y: 0 });
  setCurrentIndex(prevIndex => prevIndex + 1);
};
```

**After:**
```typescript
const onSwipeComplete = (direction: 'left' | 'right') => {
  const currentUserProfile = users[currentIndex];

  if (direction === 'right') {
    // Swipe right: Navigate to profile
    if (currentUserProfile?.username) {
      console.log('📱 Navigating to profile:', currentUserProfile.username);
      router.push(`/account/profile?username=${currentUserProfile.username}`);
    } else {
      console.warn('⚠️ Cannot navigate to profile: username is missing');
    }
    // Reset position but DON'T increment index
    position.setValue({ x: 0, y: 0 });
  } else {
    // Swipe left: Skip to next card
    console.log('⏭️ Skipping to next card');
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prevIndex => prevIndex + 1);
  }
};
```

### Key Changes
1. Separated logic for left and right swipes
2. Only increment index on left swipe (skip)
3. Keep index same on right swipe (view profile)
4. Added logging for debugging
5. Added proper error handling for missing username

## Server Requirements

The server must have the following endpoints working:

1. `GET /hangouts` - Get list of available users
2. `GET /users/username/:username` - Get user profile by username
3. `PUT /hangouts/status` - Update user's hangout visibility status
4. `GET /hangouts/status/:username` - Get user's hangout status

## Common Issues and Solutions

### Issue: Profile screen is blank
**Solution:** Check if the API endpoint `/users/username/:username` is returning valid data

### Issue: Navigation doesn't happen
**Solution:** 
- Check if router is properly imported from `expo-router`
- Verify the profile route exists in `app/_layout.tsx`
- Check console for navigation errors

### Issue: Wrong profile opens
**Solution:** This should now be fixed with the index management changes

### Issue: Cards don't advance when swiping left
**Solution:** Check if `setCurrentIndex` is being called in the left swipe handler

## Success Criteria

The fix is successful if:
- ✅ Swipe right opens the correct user's profile
- ✅ After viewing profile and returning, the same card is shown
- ✅ Swipe left advances to the next card
- ✅ No console errors during swipes
- ✅ Profile data loads correctly
- ✅ Navigation is smooth and responsive

## Notes

- The swipe threshold is 120px (defined as `SWIPE_THRESHOLD`)
- Cards animate for 250ms during swipe (defined in `forceSwipe` function)
- The profile screen supports both `id` and `username` parameters
- Current implementation uses `username` for navigation

## Related Files

- `app/(tabs)/hangout.tsx` - Main hangout screen with swipe logic
- `app/account/profile.tsx` - Profile screen that displays user information
- `app/_layout.tsx` - Root layout with navigation routes
- `src/services/api.ts` - API service with hangout endpoints
