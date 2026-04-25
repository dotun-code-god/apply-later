import React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { BaseLayout, BRAND } from './base-layout.js';

interface VerificationEmailProps {
  otp: string;
}

export function VerificationEmail({ otp }: VerificationEmailProps) {
  const digits = otp.split('');

  return (
    <BaseLayout preview={`Your ApplyLater verification code: ${otp}`}>
      <Text
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        Verify your email
      </Text>

      <Text
        style={{
          fontSize: '15px',
          color: BRAND.muted,
          margin: '0 0 28px',
          lineHeight: '1.6',
        }}
      >
        Enter the 6-digit code below in the verification screen to confirm your
        email address. This code expires in{' '}
        <strong style={{ color: BRAND.text }}>10 minutes</strong>.
      </Text>

      {/* OTP digit boxes */}
      <Section
        style={{
          backgroundColor: '#f8fafc',
          border: `1px solid ${BRAND.border}`,
          borderRadius: '12px',
          padding: '28px 20px',
          margin: '0 0 28px',
          textAlign: 'center' as const,
        }}
      >
        <Row>
          {digits.map((digit, i) => (
            <Column key={i} style={{ padding: '0 4px', textAlign: 'center' as const }}>
              <Text
                style={{
                  display: 'inline-block',
                  width: '44px',
                  height: '52px',
                  lineHeight: '52px',
                  backgroundColor: BRAND.card,
                  border: `2px solid ${BRAND.primary}`,
                  borderRadius: '8px',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: BRAND.primary,
                  textAlign: 'center' as const,
                  margin: 0,
                  fontFamily: 'monospace',
                  letterSpacing: 0,
                }}
              >
                {digit}
              </Text>
            </Column>
          ))}
        </Row>

        <Text
          style={{
            fontSize: '13px',
            color: BRAND.muted,
            margin: '16px 0 0',
            letterSpacing: '0.1em',
            fontFamily: 'monospace',
          }}
        >
          {otp}
        </Text>
      </Section>

      <Text
        style={{
          fontSize: '13px',
          color: BRAND.muted,
          margin: 0,
          lineHeight: '1.6',
        }}
      >
        If you did not create an ApplyLater account, you can safely ignore this
        email. Do not share this code with anyone.
      </Text>
    </BaseLayout>
  );
}
