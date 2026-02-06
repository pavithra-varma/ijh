import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TabType = 'classes' | 'events' | 'departments' | 'faqs';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(activeTab)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData(getEmptyForm());
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    }
  };

  const handleSave = async () => {
    try {
      if (isAdding) {
        const { error } = await supabase.from(activeTab).insert([formData]);
        if (error) throw error;
      } else if (editingId) {
        const { error } = await supabase
          .from(activeTab)
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({});
      await loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save item');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const getEmptyForm = () => {
    switch (activeTab) {
      case 'classes':
        return {
          subject_name: '',
          subject_code: '',
          instructor: '',
          day_of_week: 'Monday',
          start_time: '09:00',
          end_time: '10:00',
          room_number: '',
          department: '',
          semester: 'Spring 2026',
        };
      case 'events':
        return {
          title: '',
          description: '',
          event_date: new Date().toISOString().split('T')[0],
          start_time: '10:00',
          end_time: '12:00',
          location: '',
          category: 'general',
          organizer: '',
        };
      case 'departments':
        return {
          name: '',
          head: '',
          location: '',
          contact_email: '',
          contact_phone: '',
          description: '',
        };
      case 'faqs':
        return {
          question: '',
          answer: '',
          category: 'general',
          keywords: [],
        };
    }
  };

  const renderForm = () => {
    if (!isAdding && !editingId) return null;

    switch (activeTab) {
      case 'classes':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {isAdding ? 'Add New Class' : 'Edit Class'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={formData.subject_name || ''}
                onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Subject Code"
                value={formData.subject_code || ''}
                onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Instructor"
                value={formData.instructor || ''}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={formData.day_of_week || 'Monday'}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                placeholder="Start Time"
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="time"
                placeholder="End Time"
                value={formData.end_time || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Room Number"
                value={formData.room_number || ''}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {isAdding ? 'Add New Event' : 'Edit Event'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2"
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2 h-24"
              />
              <input
                type="date"
                value={formData.event_date || ''}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="time"
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="time"
                value={formData.end_time || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Organizer"
                value={formData.organizer || ''}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        );

      case 'departments':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {isAdding ? 'Add New Department' : 'Edit Department'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Department Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Department Head"
                value={formData.head || ''}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent col-span-2 h-24"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        );

      case 'faqs':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">
              {isAdding ? 'Add New FAQ' : 'Edit FAQ'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Question"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Answer"
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Keywords (comma separated)"
                value={(formData.keywords || []).join(', ')}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map(k => k.trim()) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-blue-100 mt-1">Manage campus data and information</p>
          </div>

          <div className="border-b border-slate-200">
            <nav className="flex">
              {(['classes', 'events', 'departments', 'faqs'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className={`px-6 py-4 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 capitalize">{activeTab}</h2>
              <button
                onClick={handleAdd}
                disabled={isAdding || editingId !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>

            {renderForm()}

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {activeTab === 'classes' && (
                          <>
                            <h3 className="font-semibold text-slate-900">
                              {item.subject_name} ({item.subject_code})
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {item.instructor} • {item.day_of_week} {item.start_time} - {item.end_time} • Room {item.room_number}
                            </p>
                          </>
                        )}
                        {activeTab === 'events' && (
                          <>
                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {new Date(item.event_date).toLocaleDateString()} • {item.location}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                          </>
                        )}
                        {activeTab === 'departments' && (
                          <>
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              Head: {item.head} • Location: {item.location}
                            </p>
                            {item.contact_email && (
                              <p className="text-sm text-slate-500 mt-1">{item.contact_email}</p>
                            )}
                          </>
                        )}
                        {activeTab === 'faqs' && (
                          <>
                            <h3 className="font-semibold text-slate-900">{item.question}</h3>
                            <p className="text-sm text-slate-600 mt-1">{item.answer}</p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
