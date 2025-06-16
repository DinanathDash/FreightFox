import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserById } from '../../Firebase/development/authUserData';
import { updateUserProfile } from '../../Firebase/shared/services';
import { updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Input } from '../../Components/ui/input';
import { Label } from '../../Components/ui/label';
import { Button } from '../../Components/ui/button';

function ProfileSettings() {
  const { currentUser, updateProfilePicture } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        if (currentUser) {
          const userDetails = await getUserById(currentUser.uid);
          setUserData(userDetails);
          setProfileData({
            name: userDetails?.name || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: userDetails?.phone || '',
            address: userDetails?.address || '',
          });
          setProfilePicture(currentUser.photoURL || userDetails?.profilePhoto || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Image is too large. Please select an image under 2MB");
      return;
    }
    
    // Preview the image and store it for later upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicture(event.target.result);
    };
    reader.readAsDataURL(file);
    setProfilePictureFile(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // First update the Firebase Auth profile (name and photo)
      const updates = {
        displayName: profileData.name,
      };

      // Update profile picture if changed
      if (profilePictureFile && profilePicture) {
        await updateProfilePicture(profilePicture);
      }

      // Update Auth profile
      await updateProfile(currentUser, updates);

      // Update Firestore document with all profile data
      await updateUserProfile(currentUser.uid, {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        profilePhoto: currentUser.photoURL || profilePicture,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Card className="shadow-sm border border-gray-200 bg-white/80 backdrop-blur-sm">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <label htmlFor="profilePicture" className="cursor-pointer relative group">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-blue-50 shadow-sm transition-all duration-300 hover:shadow-md">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-black/50 bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <Input
                  id="profilePicture"
                  type="file"
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Click to change profile picture (max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                value={profileData.email}
                readOnly
                disabled
                className="bg-gray-50 w-full"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Your phone number"
                className="w-full"
              />
            </div>
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Your address"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 16L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProfileSettings;
