import { useState } from 'react';
import { useData, Client } from '../../lib/dataContext';
import { DataTable, Modal, FormField, Switch, ActionButtons } from '../../components/admin/AdminUI';

export default function ClientsAdmin() {
  const { clients, saveClients } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      id: `client-${Date.now()}`,
      name: '',
      displayOrder: clients.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string | number) => {
    saveClients(clients.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingClient) {
      saveClients(clients.map(c => c.id === editingClient.id ? { ...c, ...formData } as Client : c));
    } else {
      saveClients([...clients, formData as Client]);
    }
    setIsModalOpen(false);
  };

  const columns = [
      { key: 'name', label: 'Name', render: (client: Client) => (
        <div className="flex items-center gap-4">
          {client.logo ? (
            <img src={client.logo} alt={client.name} className="w-20 h-10 object-contain brightness-0 dark:invert" />
          ) : (
            <div className="w-12 h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">No<br/>Logo</span>
            </div>
          )}
          <span className="font-medium">{client.name}</span>
        </div>
      )},
      { key: 'isActive', label: 'Active', render: (item: Client) => item.isActive ? 'Yes' : 'No' },
    ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Clients</h1>
      <DataTable
        data={clients}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onReorder={saveClients}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Edit Client' : 'Add Client'}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name">
              <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
            </FormField>
            <FormField label="Logo URL">
              <input 
                type="text"
                value={formData.logo || ''} 
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })} 
                placeholder="e.g. /logos/client.png or https://..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </FormField>
          </div>
          <div className="flex gap-6 mt-4">
          <Switch checked={formData.isActive ?? true} onChange={(v) => setFormData({ ...formData, isActive: v })} label="Active" />
        </div>
        <ActionButtons onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}