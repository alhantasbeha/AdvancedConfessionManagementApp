import React, { useState } from 'react';
import { X, Calendar, Clock, User, FileText, Tag, Search, Filter, ChevronDown } from 'lucide-react';

interface ConfessionLog {
  id: string;
  confessorId: string;
  confessorName: string;
  date: string;
  time: string;
  type: 'confession' | 'counseling' | 'spiritual-direction';
  notes: string;
  tags: string[];
  duration: number; // in minutes
  followUpRequired: boolean;
}

interface ConfessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  confessionLogs?: ConfessionLog[];
  onAddLog?: (log: Omit<ConfessionLog, 'id'>) => void;
  onUpdateLog?: (id: string, log: Partial<ConfessionLog>) => void;
  onDeleteLog?: (id: string) => void;
}

export const ConfessionLogModal: React.FC<ConfessionLogModalProps> = ({
  isOpen,
  onClose,
  confessionLogs = [],
  onAddLog,
  onUpdateLog,
  onDeleteLog
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'confession' | 'counseling' | 'spiritual-direction'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state for adding new log
  const [newLog, setNewLog] = useState({
    confessorId: '',
    confessorName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'confession' as const,
    notes: '',
    tags: [] as string[],
    duration: 30,
    followUpRequired: false
  });

  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const filteredLogs = confessionLogs.filter(log => {
    const matchesSearch = log.confessorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newLog.tags.includes(tagInput.trim())) {
        setNewLog(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewLog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddLog) {
      onAddLog(newLog);
      setNewLog({
        confessorId: '',
        confessorName: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        type: 'confession',
        notes: '',
        tags: [],
        duration: 30,
        followUpRequired: false
      });
      setActiveTab('view');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'confession': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'counseling': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'spiritual-direction': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Confession Logs</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-white text-purple-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              View Logs
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-white text-purple-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Add New Log
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'view' ? (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by confessor name or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFilters && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      <label className="text-sm font-medium text-gray-700 mr-4">Type:</label>
                      {['all', 'confession', 'counseling', 'spiritual-direction'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type as any)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            filterType === type
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logs List */}
              <div className="space-y-4">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No confession logs found</h3>
                    <p className="text-gray-500">
                      {searchTerm || filterType !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start by adding your first confession log'
                      }
                    </p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{log.confessorName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{log.time} ({log.duration} min)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(log.type)}`}>
                            {log.type.replace('-', ' ')}
                          </span>
                          {log.followUpRequired && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              Follow-up
                            </span>
                          )}
                        </div>
                      </div>

                      {log.notes && (
                        <div className="mb-4">
                          <p className="text-gray-700 text-sm leading-relaxed">{log.notes}</p>
                        </div>
                      )}

                      {log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Add New Log Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confessor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLog.confessorName}
                    onChange={(e) => setNewLog(prev => ({ ...prev, confessorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter confessor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={newLog.type}
                    onChange={(e) => setNewLog(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="confession">Confession</option>
                    <option value="counseling">Counseling</option>
                    <option value="spiritual-direction">Spiritual Direction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newLog.time}
                    onChange={(e) => setNewLog(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLog.duration}
                    onChange={(e) => setNewLog(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={newLog.followUpRequired}
                    onChange={(e) => setNewLog(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="followUp" className="ml-2 text-sm text-gray-700">
                    Follow-up required
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={newLog.notes}
                  onChange={(e) => setNewLog(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter any relevant notes or observations..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Type a tag and press Enter"
                />
                {newLog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newLog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Log
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};