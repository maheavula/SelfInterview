// Security utilities for API key protection
export class ApiKeySecurity {
  
  // Mask API key for safe logging/display
  static maskApiKey(key: string): string {
    if (!key || key.length < 12) return '***';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  // Validate API key format
  static validateApiKeyFormat(key: string): boolean {
    // Gemini API keys typically start with "AIza" and are 39 characters long
    return /^AIza[0-9A-Za-z-_]{35}$/.test(key);
  }

  // Check if user is on a potentially insecure network (disabled)
  static checkNetworkSecurity(): void {
    // Check for HTTPS only (removed public WiFi warning)
    if (location.protocol !== 'https:') {
      this.showWarning('⚠️ Security Warning: This site should use HTTPS. Please check the URL.');
    }

    // Public WiFi warning removed
    // const connection = (navigator as any).connection;
    // if (connection?.effectiveType === 'slow-2g' || 
    //     connection?.effectiveType === '2g') {
    //   this.showWarning('⚠️ Public WiFi Warning: Avoid entering API keys on public WiFi networks. Use your mobile hotspot or trusted network instead.');
    // }
  }

  // Add corporate network warning
  static addCorporateNetworkWarning(): void {
    const warning = `
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
        <p><strong>🔒 Corporate Network Notice:</strong> 
        If you're on a corporate network, consider using your personal device or mobile hotspot for entering API keys.</p>
      </div>
    `;
    this.insertWarning(warning);
  }

  // Add privacy protection for API key input
  static protectApiKeyInput(): void {
    const apiKeyInput = document.getElementById('gemini-api-key') as HTMLInputElement;
    if (!apiKeyInput) return;

    // Add visual warning on focus (disabled)
    // apiKeyInput.addEventListener('focus', () => {
    //   const warning = `
    //     <div class="text-yellow-400 text-sm mt-1 flex items-center gap-1">
    //       <span>⚠️</span>
    //       <span>Hide this input when screen sharing</span>
    //   </div>
    //   `;
    //   if (!apiKeyInput.parentNode?.querySelector('.text-yellow-400')) {
    //     (apiKeyInput.parentNode as Element)?.insertAdjacentHTML('beforeend', warning);
    //   }
    // });

    // Remove warning on blur (disabled)
    // apiKeyInput.addEventListener('blur', () => {
    //   const warning = apiKeyInput.parentNode?.querySelector('.text-yellow-400');
    //   if (warning) warning.remove();
    // });

    // Add clipboard security warning (disabled)
    // apiKeyInput.addEventListener('paste', () => {
    //   setTimeout(() => {
    //     this.showWarning('📋 Clipboard Security: Clear your clipboard after pasting API keys to prevent accidental exposure.');
    //   }, 1000);
    // });
  }

  // Add comprehensive security warnings
  static addSecurityWarnings(): void {
    const warnings = [
      '🔒 Only enter API keys on trusted devices',
      '🚫 Avoid public computers and shared devices',
      '🛡️ Use updated antivirus software',
      '🔍 Check browser extensions for suspicious ones',
      '📱 Consider using mobile hotspot on public WiFi',
      '👁️ Ensure no one can see your screen when entering keys'
    ];

    const warningHtml = `
      <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
        <h4 class="font-bold mb-2">🔐 Security Best Practices:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm">
          ${warnings.map(warning => `<li>${warning}</li>`).join('')}
        </ul>
      </div>
    `;
    this.insertWarning(warningHtml);
  }

  // Clear sensitive data on page unload
  static setupDataCleanup(): void {
    window.addEventListener('beforeunload', () => {
      // Clear sessionStorage
      sessionStorage.removeItem('geminiApiKey');
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('api') || name.includes('gemini')) {
              caches.delete(name);
            }
          });
        });
      }
    });
  }

  // Monitor for suspicious browser extensions
  static checkExtensions(): void {
    // This is a basic check - modern browsers limit extension detection
    const suspiciousPatterns = [
      'adblock',
      'ublock',
      'lastpass',
      '1password',
      'dashlane'
    ];

    // Check if any suspicious extensions might be present
    if ((window as any).chrome?.extension?.getExtension) {
      this.showWarning('🔍 Some browser extensions may have access to network requests. Review your extensions for security.');
    }
  }

  // Add clipboard security
  static setupClipboardSecurity(): void {
    // Warn about clipboard security
    const clipboardWarning = `
      <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 rounded">
        <p><strong>📋 Clipboard Security:</strong> 
        Clear your clipboard after copying API keys to prevent accidental exposure in other applications.</p>
      </div>
    `;
    this.insertWarning(clipboardWarning);
  }

  // Add shoulder surfing protection
  static addPrivacyProtection(): void {
    const privacyNotice = `
      <div class="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mb-4 rounded">
        <p><strong>👁️ Privacy Protection:</strong> 
        Ensure no one can see your screen when entering API keys. 
        Consider using a privacy screen filter in public spaces.</p>
      </div>
    `;
    this.insertWarning(privacyNotice);
  }

  // Initialize all security measures
  static initialize(): void {
    // this.checkNetworkSecurity(); // Disabled - removed HTTPS warning
    // this.addCorporateNetworkWarning(); // Disabled
    this.protectApiKeyInput();
    // this.addSecurityWarnings(); // Disabled
    this.setupDataCleanup();
    this.checkExtensions();
    // this.setupClipboardSecurity(); // Disabled
    // this.addPrivacyProtection(); // Disabled
  }

  // Helper method to show warnings
  private static showWarning(message: string): void {
    const warning = `
      <div class="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-sm">
        <p class="text-sm">${message}</p>
        <button onclick="this.parentElement.remove()" class="mt-2 text-red-500 hover:text-red-700 text-xs">
          Dismiss
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', warning);
  }

  // Helper method to insert warnings
  private static insertWarning(html: string): void {
    // Find a good place to insert the warning (usually near the API key input)
    const apiKeySection = document.querySelector('[id*="api-key"], [class*="api"], [class*="gemini"]');
    if (apiKeySection) {
      apiKeySection.insertAdjacentHTML('beforebegin', html);
    } else {
      // Fallback to body
      document.body.insertAdjacentHTML('afterbegin', html);
    }
  }

  // Validate API key before use
  static validateApiKey(key: string): { isValid: boolean; error?: string } {
    if (!key) {
      return { isValid: false, error: 'API key is required' };
    }

    if (!this.validateApiKeyFormat(key)) {
      return { isValid: false, error: 'Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.' };
    }

    return { isValid: true };
  }

  // Secure API key storage
  static storeApiKey(key: string): void {
    if (this.validateApiKey(key).isValid) {
      sessionStorage.setItem('geminiApiKey', key);
      console.log('API key stored securely');
    } else {
      throw new Error('Invalid API key format');
    }
  }

  // Secure API key retrieval
  static getApiKey(): string | null {
    return sessionStorage.getItem('geminiApiKey');
  }

  // Clear API key
  static clearApiKey(): void {
    sessionStorage.removeItem('geminiApiKey');
    console.log('API key cleared from storage');
  }
}

// Export for use in components
export default ApiKeySecurity; 