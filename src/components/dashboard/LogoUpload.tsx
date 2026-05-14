'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  organizationId: string;
  initialLogoUrl?: string | null;
  onUploadComplete?: (newUrl: string) => void;
}

export function LogoUpload({ organizationId, initialLogoUrl, onUploadComplete }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLogoUrl(initialLogoUrl || null);
  }, [initialLogoUrl]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError, data } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // 3. Update Organization Record
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', organizationId);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      if (onUploadComplete) onUploadComplete(publicUrl);

    } catch (err: any) {
      setError(err.message);
      console.error('Error uploading logo:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    try {
      setUploading(true);
      
      // Update Organization Record to null
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', organizationId);

      if (updateError) throw updateError;

      setLogoUrl(null);
      if (onUploadComplete) onUploadComplete('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-1">Organisation Logo</label>
      
      <div className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="relative w-20 h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm group">
          {logoUrl ? (
            <>
              <img src={logoUrl} alt="Org Logo" className="w-full h-full object-contain p-2" />
              <button 
                onClick={removeLogo}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <ImageIcon className="w-8 h-8" />
              <span className="text-[8px] font-bold uppercase tracking-tighter">No Logo</span>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-[13px] font-bold text-slate-900">Upload your brand logo</p>
          <p className="text-[11px] text-slate-500 font-medium">PNG, JPG or SVG. Max 2MB. Recommended: 512x512px.</p>
          
          <div className="flex items-center gap-3 pt-1">
            <label className={cn(
              "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-all shadow-sm active:scale-95",
              uploading && "opacity-50 pointer-events-none"
            )}>
              <Upload className="w-3.5 h-3.5" />
              {logoUrl ? 'Change Logo' : 'Choose File'}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            
            {logoUrl && !uploading && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>
          
          {error && (
            <p className="text-[11px] text-rose-500 font-bold mt-2 flex items-center gap-1">
              <X className="w-3 h-3" /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
