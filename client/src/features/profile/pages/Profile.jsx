import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { Link as LinkIcon, Mail, User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <img 
            src={user?.avatar} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-full border border-border object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <div className="flex flex-col gap-2 mt-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
              {user?.githubUsername && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <LinkIcon className="w-4 h-4" />
                  github.com/{user?.githubUsername}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-2">Bio</h3>
          <p className="text-muted-foreground text-sm">
            {user?.bio || "No bio provided. Update your bio in settings."}
          </p>
        </div>
      </div>
    </div>
  );
}
