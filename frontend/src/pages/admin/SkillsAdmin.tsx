import { useState } from 'react';
import { useData, Skill } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Switch, ActionButtons } from '../../components/admin/AdminUI';

export default function SkillsAdmin() {
  const { skills, saveSkills } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<Partial<Skill>>({});

  const handleAdd = () => {
    setEditingSkill(null);
    setFormData({
      id: `skill-${Date.now()}`,
      name: '',
      level: 50,
      displayOrder: skills.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({ ...skill });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveSkills(skills.filter(s => s.id !== id));
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingSkill) {
      saveSkills(skills.map(s => s.id === editingSkill.id ? { ...s, ...formData } as Skill : s));
    } else {
      saveSkills([...skills, formData as Skill]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'level', label: 'Level (%)' },
    { key: 'isActive', label: 'Active', render: (item: Skill) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Skills</h1>
      <DataTable
        data={skills}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveSkills}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSkill ? 'Edit Skill' : 'Add Skill'}>
        <FormField label="Name">
          <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </FormField>
        <FormField label="Level (%)">
          <Input 
            type="number" 
            min="0" 
            max="100" 
            value={formData.level || 50} 
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 50 })} 
          />
        </FormField>
        <div className="flex gap-6">
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
