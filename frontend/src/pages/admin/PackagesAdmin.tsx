import { useState } from 'react';
import { useData, ComboPackage } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, TagInput, ActionButtons } from '../../components/admin/AdminUI';

export default function PackagesAdmin() {
  const { comboPackages, saveComboPackages } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ComboPackage | null>(null);
  const [formData, setFormData] = useState<Partial<ComboPackage>>({});

  const handleAdd = () => {
    setEditingPackage(null);
    setFormData({
      id: `package-${Date.now()}`,
      name: '',
      price: '',
      currency: 'MAD',
      description: '',
      features: [],
      isPopular: false,
      cta: 'Get Started',
      displayOrder: comboPackages.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: ComboPackage) => {
    setEditingPackage(pkg);
    setFormData({ ...pkg });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveComboPackages(comboPackages.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;
    
    if (editingPackage) {
      saveComboPackages(comboPackages.map(p => p.id === editingPackage.id ? { ...p, ...formData } as ComboPackage : p));
    } else {
      saveComboPackages([...comboPackages, formData as ComboPackage]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', render: (item: ComboPackage) => `${item.price} ${item.currency}` },
    { key: 'isPopular', label: 'Popular', render: (item: ComboPackage) => item.isPopular ? 'Yes' : 'No' },
    { key: 'isActive', label: 'Active', render: (item: ComboPackage) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Packages</h1>
      <DataTable
        data={comboPackages}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveComboPackages}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPackage ? 'Edit Package' : 'Add Package'}>
        <FormField label="Name">
          <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price">
            <Input value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </FormField>
          <FormField label="Currency">
            <Input value={formData.currency || 'MAD'} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
        </FormField>
        <TagInput tags={formData.features || []} onChange={(features) => setFormData({ ...formData, features })} label="Features" />
        <FormField label="CTA Text">
          <Input value={formData.cta || ''} onChange={(e) => setFormData({ ...formData, cta: e.target.value })} />
        </FormField>
        <div className="flex gap-6">
          <Switch checked={formData.isPopular || false} onChange={(v) => setFormData({ ...formData, isPopular: v })} label="Popular" />
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
