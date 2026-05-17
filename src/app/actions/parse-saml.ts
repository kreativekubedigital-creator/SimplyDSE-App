'use server';

export async function parseSAMLMetadata(input: string, type: 'url' | 'xml') {
  try {
    let xmlContent = '';

    if (type === 'url') {
      const response = await fetch(input);
      if (!response.ok) throw new Error(`Failed to fetch metadata from URL: ${response.statusText}`);
      xmlContent = await response.text();
    } else {
      xmlContent = input;
    }

    // Basic Regex Parsing for SAML Metadata (avoiding heavy XML libraries)
    // 1. Entity ID
    const entityIdMatch = xmlContent.match(/entityID="([^"]+)"/);
    const entityId = entityIdMatch ? entityIdMatch[1] : '';

    // 2. SSO URL (Preferring HTTP-Redirect binding)
    const ssoUrlMatch = xmlContent.match(/SingleSignOnService[^>]+Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"[^>]+Location="([^"]+)"/) 
                     || xmlContent.match(/SingleSignOnService[^>]+Location="([^"]+)"/);
    const ssoUrl = ssoUrlMatch ? ssoUrlMatch[1] : '';

    // 3. X.509 Certificate
    const certMatch = xmlContent.match(/<X509Certificate>([\s\S]*?)<\/X509Certificate>/);
    let certificate = certMatch ? certMatch[1].replace(/\s+/g, '') : '';
    
    // Format certificate if it exists (add headers/footers if missing)
    if (certificate && !certificate.includes('BEGIN CERTIFICATE')) {
      certificate = `-----BEGIN CERTIFICATE-----\n${certificate.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;
    }

    // 4. Provider Name Hint
    let providerName = 'Enterprise SAML Provider';
    if (xmlContent.includes('microsoftonline.com')) providerName = 'Microsoft Entra ID';
    else if (xmlContent.includes('okta.com')) providerName = 'Okta';
    else if (xmlContent.includes('google.com')) providerName = 'Google Workspace';

    if (!entityId || !ssoUrl) {
      throw new Error('Invalid SAML Metadata: Could not find EntityID or SSO Location.');
    }

    return {
      success: true,
      data: {
        entityId,
        ssoUrl,
        certificate,
        providerName,
        metadataUrl: type === 'url' ? input : null
      }
    };

  } catch (error: any) {
    console.error('SAML Parsing Error:', error);
    return { success: false, error: error.message };
  }
}
