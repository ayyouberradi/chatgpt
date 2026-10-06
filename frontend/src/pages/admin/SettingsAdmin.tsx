import { useState } from 'react';
import { useData } from '../../lib/dataContext';
import { FormField, Input, Textarea, ActionButtons } from '../../components/admin/AdminUI';

export default function SettingsAdmin() {
  const { seo, saveSEO, about, availability, saveAvailability, clients, stats, industries, benefits, helpOptions, projects, services, testimonials, retainers, comboPackages } = useData();
  const [formData, setFormData] = useState(seo);
  const [availabilityData, setAvailabilityData] = useState(availability);

  const handleSaveSEO = () => {
    saveSEO(formData);

  };

  const handleSaveAvailability = () => {
    saveAvailability({
      ...availabilityData,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">SEO & Settings</h1>

      <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>
        <FormField label="Site Title">
          <Input value={formData.siteTitle} onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })} />
        </FormField>
        <FormField label="Site Description">
          <Textarea value={formData.siteDescription} onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })} rows={4} />
        </FormField>
        <FormField label="Site Keywords">
          <Input value={formData.siteKeywords} onChange={(e) => setFormData({ ...formData, siteKeywords: e.target.value })} />
        </FormField>
        <FormField label="OG Image URL">
          <Input value={formData.ogImage} onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })} />
        </FormField>
        <ActionButtons onSave={handleSaveSEO} onCancel={() => {}} saveLabel="Save SEO" />
      </div>

      <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-6">Availability Settings</h2>
        <FormField label="Current Status">
          <select
            value={availabilityData.status}
            onChange={(e) => setAvailabilityData({ ...availabilityData, status: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-accent"
          >
            <option value="available">🟢 Currently Accepting New Projects</option>
            <option value="limited">🟡 Limited Availability</option>
            <option value="booking-next-month">🔴 Booking For Next Month</option>
          </select>
        </FormField>
        <div className="flex items-center gap-2 mt-4 mb-6">
          <input
            type="checkbox"
            id="showWaitingList"
            checked={availabilityData.showWaitingList}
            onChange={(e) => setAvailabilityData({ ...availabilityData, showWaitingList: e.target.checked })}
            className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent"
          />
          <label htmlFor="showWaitingList" className="text-sm text-gray-300">
            Show Waiting List button (only appears when status is not "available")
          </label>
        </div>
        <ActionButtons onSave={handleSaveAvailability} onCancel={() => {}} saveLabel="Save Availability" />
      </div>

      <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-6">Data Management</h2>
        <p className="text-muted-foreground mb-4">Your changes are stored in the Laravel database. Save failures appear as a notification.</p>
        <div className="space-y-4">
          <button
            onClick={() => {
              const data = {
                projects, services, testimonials, retainers, comboPackages, stats, clients, industries, benefits, helpOptions, seo, about
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'website-data.json';
              a.click();
            }}
            className="btn-secondary"
          >
            Export All Data
          </button>
        </div>
      </div>
    </div>
  );
}
