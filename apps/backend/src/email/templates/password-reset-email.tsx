import React from 'react';
import { Text, Button, Section } from '@react-email/components';
import { BaseLayout, BRAND } from './base-layout.js';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your ApplyLater password">
      <Text
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        Reset your password
      </Text>

      <Text
        style={{
          fontSize: '15px',
          color: BRAND.muted,
          margin: '0 0 24px',
          lineHeight: '1.6',
        }}
      >
        We received a request to reset the password for your ApplyLater account.
        Click the button below — this link expires in{' '}
        <strong style={{ color: BRAND.text }}>30 minutes</strong>.
      </Text>

      <Section style={{ margin: '0 0 28px' }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Reset Password
        </Button>
      </Section>

      <Text
        style={{
          fontSize: '13px',
          color: BRAND.muted,
          margin: '0 0 8px',
          lineHeight: '1.6',
        }}
      >
        If the button doesn't work, copy and paste this URL into your browser:
        <br />
        <span style={{ color: BRAND.primary, wordBreak: 'break-all' }}>
          {resetUrl}
        </span>
      </Text>

      <Text
        style={{
          fontSize: '13px',
          color: BRAND.muted,
          margin: 0,
          lineHeight: '1.6',
        }}
      >
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not change.
      </Text>
    </BaseLayout>
  );
}
