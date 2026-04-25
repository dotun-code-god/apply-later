import React from 'react';
import { Text, Button, Section } from '@react-email/components';
import { BaseLayout, BRAND } from './base-layout.js';

interface WelcomeEmailProps {
  name?: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const safeName = name?.trim() || 'there';

  return (
    <BaseLayout preview={`Welcome to ApplyLater, ${safeName}!`}>
      <Text
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: BRAND.text,
          margin: '0 0 8px',
          letterSpacing: '-0.3px',
        }}
      >
        Welcome aboard, {safeName} 👋
      </Text>

      <Text
        style={{
          fontSize: '15px',
          color: BRAND.muted,
          margin: '0 0 24px',
          lineHeight: '1.6',
        }}
      >
        Your ApplyLater account is ready. Start tracking job applications, setting
        reminders, and never miss a deadline again.
      </Text>

      <Section style={{ margin: '0 0 24px' }}>
        <Text
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: BRAND.text,
            margin: '0 0 12px',
          }}
        >
          Here's what you can do:
        </Text>
        {[
          '📌 Save job listings to apply later',
          '🔔 Set deadline reminders',
          '📊 Track application status at a glance',
        ].map((item) => (
          <Text
            key={item}
            style={{
              fontSize: '14px',
              color: BRAND.muted,
              margin: '0 0 6px',
              lineHeight: '1.5',
            }}
          >
            {item}
          </Text>
        ))}
      </Section>

      <Button
        href={process.env['FRONTEND_URL'] ?? 'https://applylater.dev'}
        style={{
          backgroundColor: BRAND.primary,
          color: '#ffffff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        Go to Dashboard
      </Button>
    </BaseLayout>
  );
}
