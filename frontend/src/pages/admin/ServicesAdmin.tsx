import { useState } from 'react';
import { useData, Service } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, TagInput, ActionButtons } from '../../components/admin/AdminUI';

export default function ServicesAdmin() {
  const { services, saveServices } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({});

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      id: `service-${Date.now()}`,
      title: '',
      description: '',
      icon: 'code',
      startingPrice: '',
      priceOptions: [],
      features: [],
      cta: 'Learn More',
      displayOrder: services.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ ...service });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveServices(services.filter(s => s.id !== id));
  };

  const handleSave = () => {
    if (!formData.title) return;
    
    if (editingService) {
      saveServices(services.map(s => s.id === editingService.id ? { ...s, ...formData } as Service : s));
    } else {
      saveServices([...services, formData as Service]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'startingPrice', label: 'Starting Price' },
    { key: 'isActive', label: 'Active', render: (item: Service) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Services</h1>
      <DataTable
        data={services}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveServices}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
        <FormField label="Title">
          <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </FormField>
        <FormField label="Description">
          <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Icon">
            <Input value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
          </FormField>
          <FormField label="Starting Price">
            <Input value={formData.startingPrice || ''} onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })} />
          </FormField>
        </div>
        <TagInput tags={formData.features || []} onChange={(features) => setFormData({ ...formData, features })} label="Features" />
        <FormField label="CTA Text">
          <Input value={formData.cta || ''} onChange={(e) => setFormData({ ...formData, cta: e.target.value })} />
        </FormField>
        <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
