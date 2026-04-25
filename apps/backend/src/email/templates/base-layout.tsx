import React from 'react';
import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Img,
  Section,
  Text,
  Hr,
} from '@react-email/components';

const BRAND = {
  primary: '#2563eb',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  font: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: BRAND.bg,
          margin: 0,
          padding: 0,
          fontFamily: BRAND.font,
        }}
      >
        {/* Header */}
        <Section
          style={{
            backgroundColor: BRAND.card,
            borderBottom: `1px solid ${BRAND.border}`,
            padding: '20px 0',
            textAlign: 'center' as const,
          }}
        >
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>
            <Text
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: BRAND.primary,
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              ApplyLater
            </Text>
          </Container>
        </Section>

        {/* Card */}
        <Container style={{ maxWidth: '560px', margin: '32px auto', padding: '0 24px' }}>
          <Section
            style={{
              backgroundColor: BRAND.card,
              borderRadius: '12px',
              border: `1px solid ${BRAND.border}`,
              padding: '40px',
            }}
          >
            {children}
          </Section>
        </Container>

        {/* Footer */}
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px 40px' }}>
          <Hr style={{ borderColor: BRAND.border, margin: '0 0 16px' }} />
          <Text
            style={{
              fontSize: '12px',
              color: BRAND.muted,
              textAlign: 'center' as const,
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            You received this email because you have an account with ApplyLater.
            <br />
            If you did not expect this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export { BRAND };
