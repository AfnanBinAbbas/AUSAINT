
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Check for environment variables and provide fallbacks to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a supabase client only if we have the required values
let supabase: ReturnType<typeof createClient<Database>>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
} else {
  // Create a mock client or show a warning
  console.warn('Supabase URL or Anon Key is missing. Authentication and database features will not work.');
  
  // Create a dummy client that will show meaningful errors when used
  supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get: (target, prop) => {
      if (prop === 'auth' || prop === 'from' || prop === 'functions') {
        return new Proxy({}, {
          get: () => () => ({
            error: { message: 'Supabase is not properly configured. Check your environment variables.' },
            data: null
          })
        });
      }
      return () => ({
        error: { message: 'Supabase is not properly configured. Check your environment variables.' },
        data: null
      });
    }
  });
}

export { supabase };

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (data.user && !error) {
      // Create a profile record
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
      });
    }
    
    return { data, error };
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: async () => {
    return await supabase.auth.getUser();
  }
};

// API functions for different OSINT tools
export const api = {
  // Social Media Intelligence
  socialMedia: {
    search: async (username: string) => {
      return await supabase.functions.invoke('social_media_intelligence', {
        body: {
          action: 'search',
          username,
        },
      });
    },
    
    analyze: async (username: string, platform: string) => {
      return await supabase.functions.invoke('social_media_intelligence', {
        body: {
          action: 'analyze',
          username,
          platform,
        },
      });
    },
    
    saveInvestigation: async (target: string, platform: string, findings: any) => {
      return await supabase.from('social_media_investigations').insert({
        target,
        platform,
        findings,
        status: 'completed'
      });
    },
    
    getInvestigations: async () => {
      return await supabase
        .from('social_media_investigations')
        .select('*')
        .order('created_at', { ascending: false });
    }
  },
  
  // IP & Domain Intelligence
  ipDomain: {
    lookup: async (target: string, targetType: 'ip' | 'domain') => {
      return await supabase.functions.invoke('ip_domain_intelligence', {
        body: {
          target,
          targetType,
        },
      });
    },
    
    saveInvestigation: async (target: string, targetType: 'ip' | 'domain', findings: any) => {
      return await supabase.from('ip_domain_investigations').insert({
        target,
        target_type: targetType,
        findings,
        status: 'completed'
      });
    },
    
    getInvestigations: async () => {
      return await supabase
        .from('ip_domain_investigations')
        .select('*')
        .order('created_at', { ascending: false });
    }
  },
  
  // Email & Phone Intelligence
  emailPhone: {
    lookup: async (target: string, targetType: 'email' | 'phone') => {
      return await supabase.functions.invoke('email_phone_intelligence', {
        body: {
          target,
          targetType,
        },
      });
    },
    
    saveInvestigation: async (target: string, targetType: 'email' | 'phone', findings: any) => {
      return await supabase.from('email_phone_investigations').insert({
        target,
        target_type: targetType,
        findings,
        status: 'completed'
      });
    },
    
    getInvestigations: async () => {
      return await supabase
        .from('email_phone_investigations')
        .select('*')
        .order('created_at', { ascending: false });
    }
  },
  
  // Web Scraping
  webScraping: {
    scrape: async (url: string) => {
      return await supabase.functions.invoke('web_scraping', {
        body: {
          action: 'scrape',
          target: url,
        },
      });
    },
    
    findSubdomains: async (domain: string) => {
      return await supabase.functions.invoke('web_scraping', {
        body: {
          action: 'subdomains',
          target: domain,
        },
      });
    },
    
    saveInvestigation: async (url: string, parameters: any, findings: any) => {
      return await supabase.from('web_scraping_investigations').insert({
        url,
        parameters,
        findings,
        status: 'completed'
      });
    },
    
    getInvestigations: async () => {
      return await supabase
        .from('web_scraping_investigations')
        .select('*')
        .order('created_at', { ascending: false });
    }
  },
  
  // Secure Reporting
  reports: {
    generate: async (title: string, description: string | null, content: any) => {
      return await supabase.functions.invoke('secure_reporting', {
        body: {
          action: 'generate',
          reportData: {
            title,
            description,
            content,
          }
        },
      });
    },
    
    generateEncrypted: async (title: string, description: string | null, content: any) => {
      return await supabase.functions.invoke('secure_reporting', {
        body: {
          action: 'encrypt',
          reportData: {
            title,
            description,
            content,
          }
        },
      });
    },
    
    saveReport: async (title: string, description: string | null, content: any, isEncrypted: boolean) => {
      return await supabase.from('reports').insert({
        title,
        description,
        content,
        is_encrypted: isEncrypted
      });
    },
    
    getReports: async () => {
      return await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
    }
  }
};
