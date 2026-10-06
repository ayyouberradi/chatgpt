import { useState } from 'react';
import { useData, Retainer } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, TagInput, ActionButtons } from '../../components/admin/AdminUI';

export default function RetainersAdmin() {
  const { retainers, saveRetainers } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRetainer, setEditingRetainer] = useState<Retainer | null>(null);
  const [formData, setFormData] = useState<Partial<Retainer>>({});

  const handleAdd = () => {
    setEditingRetainer(null);
    setFormData({
      id: `retainer-${Date.now()}`,
      name: '',
      price: '',
      currency: 'MAD',
      period: 'month',
      description: '',
      features: [],
      isHighlighted: false,
      cta: 'Get Started',
      displayOrder: retainers.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (retainer: Retainer) => {
    setEditingRetainer(retainer);
    setFormData({ ...retainer });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveRetainers(retainers.filter(r => r.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;
    
    // Ensure features is always an array
    const safeFormData = {
      ...formData,
      features: Array.isArray(formData.features) ? formData.features : [],
    };
    
    if (editingRetainer) {
      saveRetainers(retainers.map(r => r.id === editingRetainer.id ? { ...r, ...safeFormData } as Retainer : r));
    } else {
      saveRetainers([...retainers, safeFormData as Retainer]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price', render: (item: Retainer) => `${item.price} ${item.currency}/${item.period}` },
    { key: 'isHighlighted', label: 'Featured', render: (item: Retainer) => item.isHighlighted ? 'Yes' : 'No' },
    { key: 'isActive', label: 'Active', render: (item: Retainer) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Retainers</h1>
      <DataTable
        data={retainers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveRetainers}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRetainer ? 'Edit Retainer' : 'Add Retainer'}>
        <FormField label="Name">
          <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Price">
            <Input value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </FormField>
          <FormField label="Currency">
            <Input value={formData.currency || 'MAD'} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
          </FormField>
          <FormField label="Period">
            <Input value={formData.period || 'month'} onChange={(e) => setFormData({ ...formData, period: e.target.value })} />
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
          <Switch checked={formData.isHighlighted || false} onChange={(v) => setFormData({ ...formData, isHighlighted: v })} label="Highlighted" />
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
