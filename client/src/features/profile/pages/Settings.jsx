import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-8">
        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Account</h3>
          <form className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Update Name</label>
              <input type="text" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Update Bio</label>
              <textarea className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm h-24" placeholder="Tell us about yourself"></textarea>
            </div>
            <button type="button" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90">
              Save Changes
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4 text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button type="button" className="px-4 py-2 border border-destructive text-destructive text-sm font-medium rounded-md hover:bg-destructive/10">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
