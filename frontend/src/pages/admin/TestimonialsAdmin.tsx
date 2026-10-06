import { useState } from 'react';
import { useData, Testimonial } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, ActionButtons } from '../../components/admin/AdminUI';

export default function TestimonialsAdmin() {
  const { testimonials, saveTestimonials } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({});

  const handleAdd = () => {
    setEditingTestimonial(null);
    setFormData({
      id: `testimonial-${Date.now()}`,
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
      displayOrder: testimonials.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ ...testimonial });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveTestimonials(testimonials.filter(t => t.id !== id));
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) return;
    
    if (editingTestimonial) {
      saveTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? { ...t, ...formData } as Testimonial : t));
    } else {
      saveTestimonials([...testimonials, formData as Testimonial]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'rating', label: 'Rating' },
    { key: 'isActive', label: 'Active', render: (item: Testimonial) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Testimonials</h1>
      <DataTable
        data={testimonials}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveTestimonials}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name">
            <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </FormField>
          <FormField label="Role">
            <Input value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Company">
          <Input value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
        </FormField>
        <FormField label="Content">
          <Textarea value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} />
        </FormField>
        <FormField label="Rating (1-5)">
          <Input type="number" min="1" max="5" value={formData.rating || 5} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
        </FormField>
        <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
