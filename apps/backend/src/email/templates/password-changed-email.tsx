import React from 'react';
import { Text, Section } from '@react-email/components';
import { BaseLayout, BRAND } from './base-layout.js';

export function PasswordChangedEmail() {
  return (
    <BaseLayout preview="Your ApplyLater password was changed">
      <Text
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        Password changed
      </Text>

      <Text
        style={{
          fontSize: '15px',
          color: BRAND.muted,
          margin: '0 0 24px',
          lineHeight: '1.6',
        }}
      >
        Your ApplyLater account password was successfully changed. All active
        sessions have been signed out as a security precaution.
      </Text>

      <Section
        style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          margin: '0 0 24px',
        }}
      >
        <Text
          style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: 0,
            lineHeight: '1.6',
          }}
        >
          <strong>Wasn't you?</strong> If you did not make this change, your
          account may be compromised. Please use "Forgot password" immediately
          to regain control.
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
        This is an automated security notification from ApplyLater. No action
        is required if you initiated this change.
      </Text>
    </BaseLayout>
  );
}
