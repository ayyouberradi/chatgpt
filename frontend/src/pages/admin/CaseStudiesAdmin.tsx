import { useState } from 'react';
import { useData, CaseStudy } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Input, Textarea, Switch, TagInput, ActionButtons } from '../../components/admin/AdminUI';

export default function CaseStudiesAdmin() {
  const { caseStudies, saveCaseStudies } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [formData, setFormData] = useState<Partial<CaseStudy>>({});

  const handleAdd = () => {
    setEditingCase(null);
    setFormData({
      id: `case-${Date.now()}`,
      slug: `new-case-${Date.now()}`,
      title: '',
      client: '',
      industry: '',
      location: '',
      year: new Date().getFullYear().toString(),
      seoTitle: '',
      seoDescription: '',
      heroImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      overview: '',
      challenge: '',
      strategy: '',
      solution: '',
      execution: [],
      technologies: [],
      results: [],
      gallery: [],
      testimonial: {
        text: '',
        author: '',
        role: ''
      },
      displayOrder: caseStudies.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cs: CaseStudy) => {
    setEditingCase(cs);
    setFormData({ ...cs });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveCaseStudies(caseStudies.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (!formData.title || !formData.slug) return;
    
    if (editingCase) {
      saveCaseStudies(caseStudies.map(c => c.id === editingCase.id ? { ...c, ...formData } as CaseStudy : c));
    } else {
      saveCaseStudies([...caseStudies, formData as CaseStudy]);
    }
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'client', label: 'Client' },
    { key: 'industry', label: 'Industry' },
    { key: 'isActive', label: 'Active', render: (item: CaseStudy) => item.isActive ? 'Yes' : 'No' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Case Studies</h1>
      <DataTable
        data={caseStudies}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveCaseStudies}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCase ? 'Edit Case Study' : 'Add Case Study'}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title">
            <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </FormField>
          <FormField label="Slug">
            <Input value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
          </FormField>
          <FormField label="Client">
            <Input value={formData.client || ''} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
          </FormField>
          <FormField label="Industry">
            <Input value={formData.industry || ''} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
          </FormField>
          <FormField label="Location">
            <Input value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          </FormField>
          <FormField label="Year">
            <Input value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
          </FormField>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4">SEO & Images</h3>
        <FormField label="SEO Title">
          <Input value={formData.seoTitle || ''} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} />
        </FormField>
        <FormField label="SEO Description">
          <Textarea value={formData.seoDescription || ''} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} rows={2} />
        </FormField>
        <FormField label="Hero Image URL">
          <Input value={formData.heroImage || ''} onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })} />
        </FormField>
        <TagInput tags={formData.gallery || []} onChange={(gallery) => setFormData({ ...formData, gallery })} label="Gallery Image URLs" />

        <h3 className="text-lg font-semibold mt-6 mb-4">Content</h3>
        <FormField label="Overview">
          <Textarea value={formData.overview || ''} onChange={(e) => setFormData({ ...formData, overview: e.target.value })} rows={3} />
        </FormField>
        <FormField label="The Challenge">
          <Textarea value={formData.challenge || ''} onChange={(e) => setFormData({ ...formData, challenge: e.target.value })} rows={4} />
        </FormField>
        <FormField label="The Strategy">
          <Textarea value={formData.strategy || ''} onChange={(e) => setFormData({ ...formData, strategy: e.target.value })} rows={3} />
        </FormField>
        <FormField label="The Solution">
          <Textarea value={formData.solution || ''} onChange={(e) => setFormData({ ...formData, solution: e.target.value })} rows={4} />
        </FormField>
        
        <TagInput tags={formData.execution || []} onChange={(execution) => setFormData({ ...formData, execution })} label="Execution Steps" />
        <TagInput tags={formData.technologies || []} onChange={(technologies) => setFormData({ ...formData, technologies })} label="Technologies Used" />

        <h3 className="text-lg font-semibold mt-6 mb-4">Testimonial</h3>
        <FormField label="Testimonial Text">
          <Textarea value={formData.testimonial?.text || ''} onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, text: e.target.value } })} rows={3} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Author">
            <Input value={formData.testimonial?.author || ''} onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, author: e.target.value } })} />
          </FormField>
          <FormField label="Role">
            <Input value={formData.testimonial?.role || ''} onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, role: e.target.value } })} />
          </FormField>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4">Results</h3>
        <div className="space-y-4 mb-4">
          {(formData.results || []).map((result, idx) => (
            <div key={idx} className="flex gap-4">
              <Input value={result.metric} onChange={(e) => {
                const newResults = [...(formData.results || [])];
                newResults[idx].metric = e.target.value;
                setFormData({ ...formData, results: newResults });
              }} placeholder="Metric (e.g. +120%)" />
              <Input value={result.label} onChange={(e) => {
                const newResults = [...(formData.results || [])];
                newResults[idx].label = e.target.value;
                setFormData({ ...formData, results: newResults });
              }} placeholder="Label (e.g. Traffic Increase)" />
              <button onClick={() => {
                const newResults = (formData.results || []).filter((_, i) => i !== idx);
                setFormData({ ...formData, results: newResults });
              }} className="text-red-500 hover:text-red-400">Remove</button>
            </div>
          ))}
          <button onClick={() => setFormData({ ...formData, results: [...(formData.results || []), { metric: '', label: '' }] })} className="text-sm text-accent hover:text-primary">
            + Add Result
          </button>
        </div>

        <div className="flex gap-6 mt-6">
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}