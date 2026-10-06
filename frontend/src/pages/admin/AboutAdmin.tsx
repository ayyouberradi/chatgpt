import React, { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { FormField, Input, Textarea, ActionButtons } from '../../components/admin/AdminUI';

export default function AboutAdmin() {
  const { about, saveAbout } = useData();
  const [formData, setFormData] = useState(about);

  const handleSave = () => {
    saveAbout(formData);
    alert('About page content saved!');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">About Page</h1>

      <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-6">Hero Section</h2>
        <FormField label="Hero Image URL">
          <Input 
            value={formData.heroImage} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, heroImage: e.target.value })} 
            placeholder="e.g., /storage/media/image.jpg"
          />
        </FormField>
        <FormField label="Hero Title">
          <Input value={formData.heroTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, heroTitle: e.target.value })} />
        </FormField>
        <FormField label="Hero Subtitle">
          <Input value={formData.heroSubtitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, heroSubtitle: e.target.value })} />
        </FormField>
        <FormField label="Hero Description">
          <Textarea value={formData.heroDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, heroDescription: e.target.value })} rows={4} />
        </FormField>
      </div>

      <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-6">My Story Section</h2>
        <FormField label="Story Title">
          <Input value={formData.storyTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, storyTitle: e.target.value })} />
        </FormField>
        <FormField label="First Paragraph">
          <Textarea value={formData.storyParagraph1} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, storyParagraph1: e.target.value })} rows={4} />
        </FormField>
        <FormField label="Second Paragraph">
          <Textarea value={formData.storyParagraph2} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, storyParagraph2: e.target.value })} rows={4} />
        </FormField>
        <FormField label="Third Paragraph">
          <Textarea value={formData.storyParagraph3} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, storyParagraph3: e.target.value })} rows={4} />
        </FormField>
        <ActionButtons onSave={handleSave} onCancel={() => {}} saveLabel="Save About Page" />
      </div>
    </div>
  );
}
