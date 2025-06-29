import React, { useState } from 'react';
import { useFormSettings } from '../../hooks/useFormSettings';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../ui/Icon';
import { FormSettings, FormGroup } from '../../types';

interface FormGroupEditorProps {
  formSettings: FormSettings;
}

export const FormGroupEditor: React.FC<FormGroupEditorProps> = ({ formSettings }) => {
  const { user } = useAppContext();
  const { addGroup, updateGroup, deleteGroup } = useFormSettings(user?.uid);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FormGroup | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: '',
    label: '',
    collapsible: true,
    defaultExpanded: true
  });

  const handleAddGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.label.trim()) return;

    const group: FormGroup = {
      id: newGroup.name.toLowerCase().replace(/\s+/g, '_'),
      name: newGroup.name.toLowerCase().replace(/\s+/g, '_'),
      label: newGroup.label,
      order: formSettings.groups.length + 1,
      collapsible: newGroup.collapsible,
      defaultExpanded: newGroup.defaultExpanded
    };

    await addGroup(group);
    setNewGroup({ name: '', label: '', collapsible: true, defaultExpanded: true });
    setShowAddGroup(false);
  };

  const handleUpdateGroup = async (groupId: string, updates: Partial<FormGroup>) => {
    await updateGroup(groupId, updates);
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع الحقول التابعة لها أيضاً.')) {
      await deleteGroup(groupId);
    }
  };

  const moveGroup = async (groupId: string, direction: 'up' | 'down') => {
    const group = formSettings.groups.find(g => g.id === groupId);
    if (!group) return;

    const newOrder = direction === 'up' ? group.order - 1 : group.order + 1;
    const otherGroup = formSettings.groups.find(g => g.order === newOrder);

    if (otherGroup) {
      await updateGroup(group.id, { order: newOrder });
      await updateGroup(otherGroup.id, { order: group.order });
    }
  };

  const sortedGroups = [...formSettings.groups].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold flex items-center gap-2">
          <Icon name="settings" className="w-5 h-5 text-blue-500" />
          مجموعات الحقول
        </h4>
        <button
          onClick={() => setShowAddGroup(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          <Icon name="add" className="w-4 h-4" />
          إضافة مجموعة
        </button>
      </div>

      {/* Add Group Form */}
      {showAddGroup && (
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
          <h5 className="font-semibold mb-3">إضافة مجموعة جديدة</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المجموعة (بالإنجليزية)</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="personal_info"
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">عنوان المجموعة</label>
              <input
                type="text"
                value={newGroup.label}
                onChange={(e) => setNewGroup(prev => ({ ...prev, label: e.target.value }))}
                placeholder="المعلومات الشخصية"
                className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.collapsible}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, collapsible: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">قابلة للطي</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.defaultExpanded}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, defaultExpanded: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">مفتوحة افتراضياً</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddGroup}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddGroup(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-3">
        {sortedGroups.map(group => (
          <div key={group.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border">
            {editingGroup?.id === group.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">عنوان المجموعة</label>
                  <input
                    type="text"
                    value={editingGroup.label}
                    onChange={(e) => setEditingGroup(prev => prev ? { ...prev, label: e.target.value } : null)}
                    className="w-full p-2 border rounded text-sm dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingGroup.collapsible}
                      onChange={(e) => setEditingGroup(prev => prev ? { ...prev, collapsible: e.target.checked } : null)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">قابلة للطي</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingGroup.defaultExpanded}
                      onChange={(e) => setEditingGroup(prev => prev ? { ...prev, defaultExpanded: e.target.checked } : null)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">مفتوحة افتراضياً</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateGroup(group.id, editingGroup)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingGroup(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-semibold">{group.label}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {group.name} • الترتيب: {group.order} • 
                    {group.collapsible ? ' قابلة للطي' : ' ثابتة'} • 
                    {group.defaultExpanded ? ' مفتوحة افتراضياً' : ' مغلقة افتراضياً'}
                  </p>
                  <p className="text-xs text-gray-500">
                    الحقول: {formSettings.fields.filter(f => f.group === group.name).length}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveGroup(group.id, 'up')}
                    disabled={group.order === 1}
                    className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="تحريك لأعلى"
                  >
                    <Icon name="arrowLeft" className="w-4 h-4 transform rotate-90" />
                  </button>
                  <button
                    onClick={() => moveGroup(group.id, 'down')}
                    disabled={group.order === formSettings.groups.length}
                    className="p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="تحريك لأسفل"
                  >
                    <Icon name="arrowLeft" className="w-4 h-4 transform -rotate-90" />
                  </button>
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    title="تعديل"
                  >
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="حذف"
                  >
                    <Icon name="delete" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedGroups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Icon name="settings" className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>لا توجد مجموعات. ابدأ بإضافة مجموعة جديدة.</p>
        </div>
      )}
    </div>
  );
};