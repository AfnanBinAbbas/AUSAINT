
import { supabase } from './client';

/**
 * Log an action to the audit system
 * 
 * @param action The action being performed
 * @param entity The entity type being acted upon
 * @param entityId Optional ID of the specific entity
 * @param details Additional details about the action
 */
export const logAuditAction = async (
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("Cannot log audit action: No authenticated user");
      return;
    }
    
    // Get client IP and user agent
    let ipAddress = null;
    let userAgent = null;
    
    if (typeof window !== 'undefined') {
      // In browser context
      userAgent = navigator.userAgent;
      // Note: getting IP in frontend is not reliable, would need server-side detection
    }
    
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      entity,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent
    });
    
  } catch (error) {
    // Fail silently in production, but log to console
    console.error("Failed to log audit action:", error);
  }
};

/**
 * Security utils for input validation
 */
export const security = {
  /**
   * Sanitize a string for safe display/storage
   */
  sanitizeInput: (input: string): string => {
    // Basic sanitization - in a real app use a proper library
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  /**
   * Validate an email address format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validate a URL format
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Validate an IP address format
   */
  isValidIpAddress: (ip: string): boolean => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split(".");
    return parts.every(part => parseInt(part) <= 255);
  },
  
  /**
   * Validate domain name format
   */
  isValidDomain: (domain: string): boolean => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }
};
