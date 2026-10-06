import { useState } from 'react';
import { useData, Project } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, TagInput, ActionButtons } from '../../components/admin/AdminUI';

export default function ProjectsAdmin() {
  const { projects, saveProjects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      id: `project-${Date.now()}`,
      slug: `new-project-${Date.now()}`,
      title: '',
      category: '',
      industry: '',
      description: '',
      image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: [],
      services: [],
      link: '',
      displayOrder: projects.length,
      isFeatured: false,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  const handleSave = () => {
    if (!formData.title) return;
    
    if (editingProject) {
      saveProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...formData } as Project : p));
    } else {
      saveProjects([...projects, formData as Project]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'isFeatured', label: 'Featured', render: (item: Project) => item.isFeatured ? 'Yes' : 'No' },
    { key: 'isActive', label: 'Active', render: (item: Project) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <DataTable
        data={projects}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveProjects}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'}>
        <FormField label="Title">
          <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </FormField>
        <FormField label="Slug">
          <Input value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category">
            <Input value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          </FormField>
          <FormField label="Industry">
            <Input value={formData.industry || ''} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
        </FormField>
        <FormField label="Image URL">
          <Input value={formData.image || ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
        </FormField>
        <TagInput tags={formData.tags || []} onChange={(tags) => setFormData({ ...formData, tags })} label="Tags" />
        <TagInput tags={formData.services || []} onChange={(services) => setFormData({ ...formData, services })} label="Services" />
        <FormField label="Link">
          <Input value={formData.link || ''} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
        </FormField>
        <div className="flex gap-6">
          <Switch checked={formData.isFeatured || false} onChange={(v) => setFormData({ ...formData, isFeatured: v })} label="Featured" />
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
