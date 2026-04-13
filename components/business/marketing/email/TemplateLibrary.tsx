'use client';

import React, { useState } from 'react';
import { Layout, Eye, ArrowRight } from 'lucide-react';

interface TemplateLibraryProps {
  onSelectTemplate: (html: string) => void;
}

const templates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Greet new subscribers and introduce your brand.',
    category: 'Onboarding',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:#10b981;padding:40px 30px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:28px;">Welcome!</h1>
    <p style="color:#d1fae5;margin:10px 0 0;font-size:16px;">We're thrilled to have you on board.</p>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;">
    <p style="color:#374151;font-size:16px;line-height:1.6;">Hi there,</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;">Thank you for joining us! We're excited to help you get started. Here's what you can expect from us:</p>
    <ul style="color:#374151;font-size:16px;line-height:1.8;">
      <li>Helpful tips and resources</li>
      <li>Exclusive updates and offers</li>
      <li>A community that supports you</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#10b981;border-radius:8px;padding:14px 28px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:16px;">Get Started</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 30px;background:#f9fafb;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">You're receiving this because you signed up. <a href="#" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table>`,
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Share updates, articles, and news with your audience.',
    category: 'Content',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:#1e40af;padding:30px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Monthly Newsletter</h1>
    <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Your latest updates for this month</p>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;">
    <h2 style="color:#1e40af;font-size:20px;margin:0 0 12px;">Featured Story</h2>
    <p style="color:#374151;font-size:16px;line-height:1.6;">Share your main story or announcement here. Keep it engaging and to the point.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
    <h2 style="color:#1e40af;font-size:20px;margin:0 0 12px;">Quick Updates</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <h3 style="color:#111827;font-size:16px;margin:0 0 4px;">Update Title 1</h3>
        <p style="color:#6b7280;font-size:14px;margin:0;">Brief description of the update goes here.</p>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <h3 style="color:#111827;font-size:16px;margin:0 0 4px;">Update Title 2</h3>
        <p style="color:#6b7280;font-size:14px;margin:0;">Brief description of the update goes here.</p>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#1e40af;border-radius:8px;padding:14px 28px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:16px;">Read More</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 30px;background:#f9fafb;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">You're receiving this newsletter because you subscribed. <a href="#" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table>`,
  },
  {
    id: 'promotion',
    name: 'Promotion / Sale',
    description: 'Announce a sale, discount, or special offer.',
    category: 'Sales',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:linear-gradient(135deg,#dc2626,#f97316);padding:40px 30px;text-align:center;">
    <p style="color:#fef2f2;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0;">Limited Time Offer</p>
    <h1 style="color:#fff;margin:12px 0;font-size:42px;font-weight:900;">50% OFF</h1>
    <p style="color:#fed7aa;font-size:18px;margin:0;">Don't miss out on this incredible deal!</p>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;text-align:center;">
    <p style="color:#374151;font-size:16px;line-height:1.6;">Use code <strong style="color:#dc2626;font-size:20px;">SAVE50</strong> at checkout to get 50% off your entire order.</p>
    <p style="color:#6b7280;font-size:14px;">Offer valid through [Date]. Terms and conditions apply.</p>
    <table cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr><td style="background:#dc2626;border-radius:8px;padding:16px 36px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:18px;">Shop Now</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 30px;background:#f9fafb;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;"><a href="#" style="color:#6b7280;">Unsubscribe</a> from promotional emails</p>
  </td></tr>
</table>`,
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Share important news or product launches.',
    category: 'News',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:#7c3aed;padding:40px 30px;text-align:center;">
    <p style="color:#ddd6fe;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Announcement</p>
    <h1 style="color:#fff;margin:0;font-size:28px;">Something Big Is Here</h1>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;">
    <p style="color:#374151;font-size:16px;line-height:1.6;">We're excited to share some big news with you!</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;">Describe your announcement here. What's new? Why does it matter? What should the reader do next?</p>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#7c3aed;border-radius:8px;padding:14px 28px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:16px;">Learn More</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 30px;background:#f9fafb;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;"><a href="#" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table>`,
  },
  {
    id: 'event',
    name: 'Event Invitation',
    description: 'Invite your audience to an event, webinar, or meetup.',
    category: 'Events',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:#0891b2;padding:40px 30px;text-align:center;">
    <p style="color:#cffafe;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">You're Invited</p>
    <h1 style="color:#fff;margin:0;font-size:28px;">Event Name</h1>
    <p style="color:#a5f3fc;font-size:16px;margin:12px 0 0;">Date &bull; Time &bull; Location</p>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;">
    <p style="color:#374151;font-size:16px;line-height:1.6;">We'd love for you to join us! Here are the details:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr><td style="padding:8px 0;color:#374151;font-size:14px;"><strong>When:</strong> [Date and Time]</td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:14px;"><strong>Where:</strong> [Location or Virtual Link]</td></tr>
      <tr><td style="padding:8px 0;color:#374151;font-size:14px;"><strong>What:</strong> [Brief description of what to expect]</td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#0891b2;border-radius:8px;padding:14px 28px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:16px;">RSVP Now</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 30px;background:#f9fafb;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;"><a href="#" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table>`,
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    description: 'Win back inactive subscribers with a compelling message.',
    category: 'Retention',
    html: `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
  <tr><td style="background:#f59e0b;padding:40px 30px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:28px;">We Miss You!</h1>
    <p style="color:#fef3c7;margin:10px 0 0;font-size:16px;">It's been a while since we've heard from you.</p>
  </td></tr>
  <tr><td style="padding:30px;background:#fff;text-align:center;">
    <p style="color:#374151;font-size:16px;line-height:1.6;">We noticed you haven't been around lately, and we wanted to check in.</p>
    <p style="color:#374151;font-size:16px;line-height:1.6;">Here's what you've been missing:</p>
    <ul style="color:#374151;font-size:16px;line-height:1.8;text-align:left;display:inline-block;">
      <li>New features and improvements</li>
      <li>Exclusive content just for you</li>
      <li>Special offers and discounts</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr><td style="background:#f59e0b;border-radius:8px;padding:14px 28px;">
      <a href="#" style="color:#fff;text-decoration:none;font-weight:bold;font-size:16px;">Come Back</a>
    </td></tr></table>
    <p style="color:#9ca3af;font-size:13px;margin:16px 0 0;">Not interested anymore? <a href="#" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table>`,
  },
];

const categoryColors: Record<string, string> = {
  Onboarding: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  Content: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  Sales: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  News: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  Events: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  Retention: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

export default function TemplateLibrary({ onSelectTemplate }: TemplateLibraryProps) {
  const [previewTemplate, setPreviewTemplate] = useState<typeof templates[0] | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Email Templates</h2>
        <p className="text-sm text-gray-500">Select a template to start a new campaign</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Template preview thumbnail */}
            <div className="h-40 bg-gray-50 dark:bg-gray-800 overflow-hidden relative">
              <iframe
                srcDoc={template.html}
                className="w-full h-full pointer-events-none"
                style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
                title={template.name}
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[template.category] || ''}`}>
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => onSelectTemplate(template.html)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Use Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500">{previewTemplate.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectTemplate(previewTemplate.html);
                    setPreviewTemplate(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
                >
                  Use Template
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-800">
              <iframe
                srcDoc={previewTemplate.html}
                className="w-full min-h-[500px] bg-white rounded-lg"
                title={previewTemplate.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
