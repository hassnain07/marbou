import { useState, ReactNode, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter } from '@/router/Router';
import { BusinessSidebar } from '@/components/BusinessSidebar';
import { businesses } from '@/data/mockData';
import {
  MessageSquare, Phone, MessageCircle, Search, Filter, MoreVertical,
  ChevronDown, Check, X, Clock, Eye, Archive, Trash2, Reply, Send,
  Image as ImageIcon, Smile, ArrowLeft,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

// Mock data for messages and leads
const mockLeads = [
  {
    id: 1,
    name: 'Ahmed Mohammed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    lastMessage: 'Is this item still available?',
    timestamp: '2 hours ago',
    unread: true,
    type: 'chat' as const,
    status: 'active' as const,
    listingTitle: 'Used Laptop Dell XPS',
  },
  {
    id: 2,
    name: 'Fatima Ali',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    lastMessage: 'Can you deliver to Khartoum North?',
    timestamp: '5 hours ago',
    unread: false,
    type: 'chat' as const,
    status: 'active' as const,
    listingTitle: 'Furniture Set - Modern',
  },
  {
    id: 3,
    name: '+249 912 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phone',
    lastMessage: 'Call received',
    timestamp: '1 day ago',
    unread: false,
    type: 'call' as const,
    status: 'completed' as const,
    listingTitle: 'Car Battery - New',
  },
  {
    id: 4,
    name: 'Mohammed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
    lastMessage: 'WhatsApp tap received',
    timestamp: '2 days ago',
    unread: false,
    type: 'whatsapp' as const,
    status: 'completed' as const,
    listingTitle: 'Construction Services',
  },
  {
    id: 5,
    name: 'Sara Ibrahim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    lastMessage: 'When is the best time to see it?',
    timestamp: '3 days ago',
    unread: false,
    type: 'chat' as const,
    status: 'archived' as const,
    listingTitle: 'House for Rent - Khartoum',
  },
];

// Mock messages for each conversation
const mockMessages: Record<number, Array<{
  id: number;
  sender: 'user' | 'lead';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}>> = {
  1: [
    { id: 1, sender: 'lead', text: 'Hi, is this laptop still available?', timestamp: '10:30 AM', status: 'read' },
    { id: 2, sender: 'user', text: 'Yes, it\'s still available and in excellent condition.', timestamp: '10:31 AM', status: 'read' },
    { id: 3, sender: 'lead', text: 'What\'s the lowest price you can offer?', timestamp: '10:35 AM', status: 'read' },
    { id: 4, sender: 'user', text: 'The price is 85,000 SDG but I can offer 80,000 if you buy today.', timestamp: '10:36 AM', status: 'read' },
    { id: 5, sender: 'lead', text: 'Is this item still available?', timestamp: '2 hours ago', status: 'delivered' },
  ],
  2: [
    { id: 1, sender: 'lead', text: 'Hello, I\'m interested in this furniture set', timestamp: '9:15 AM', status: 'read' },
    { id: 2, sender: 'user', text: 'Great! It\'s a beautiful set in perfect condition.', timestamp: '9:20 AM', status: 'read' },
    { id: 3, sender: 'lead', text: 'Can you deliver to Khartoum North?', timestamp: '5 hours ago', status: 'delivered' },
  ],
  3: [
    { id: 1, sender: 'lead', text: 'Call received - customer interested in product', timestamp: '1 day ago', status: 'read' },
  ],
  4: [
    { id: 1, sender: 'lead', text: 'WhatsApp tap received', timestamp: '2 days ago', status: 'read' },
  ],
  5: [
    { id: 1, sender: 'lead', text: 'Hi, when can I view the house?', timestamp: '3 days ago', status: 'read' },
    { id: 2, sender: 'user', text: 'You can visit anytime between 9 AM and 6 PM', timestamp: '3 days ago', status: 'read' },
    { id: 3, sender: 'lead', text: 'When is the best time to see it?', timestamp: '3 days ago', status: 'read' },
  ],
};

function LeadCard({ lead, onAction, isSelected, onSelect }: { lead: typeof mockLeads[0]; onAction: (action: string, id: number) => void; isSelected?: boolean; onSelect?: () => void }) {
  const { t, lang } = useI18n();

  const getTypeIcon = () => {
    switch (lead.type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-primary-500" />;
      case 'call':
        return <Phone className="w-4 h-4 text-success-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-accent-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-primary-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (lead.status) {
      case 'active':
        return <span className="w-2 h-2 rounded-full bg-success-500" />;
      case 'completed':
        return <span className="w-2 h-2 rounded-full bg-primary-400" />;
      case 'archived':
        return <span className="w-2 h-2 rounded-full bg-sand-300" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full p-2 rounded-lg transition-all text-start group ${isSelected ? 'bg-primary-50 border border-primary-200' : 'hover:bg-sand-50'}`}
    >
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex-center bg-sand-100">
          <img src={lead.avatar} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1 min-w-0">
              {getTypeIcon()}
              <p className={`text-xs ${lead.unread ? 'font-bold' : 'font-medium'} text-primary-700 truncate`}>
                {lead.name}
              </p>
            </div>
            {lead.unread && <div className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
          </div>
          <p className="text-xs text-primary-500 truncate mb-0.5">{lead.listingTitle}</p>
          <p className="text-xs text-primary-600 line-clamp-1">{lead.lastMessage}</p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {getStatusBadge()}
        </div>
      </div>
    </button>
  );
}

export function BusinessMessagesLeadsPage() {
  const { t, lang } = useI18n();
  const { path } = useRouter();
  const { showToast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'chat' | 'call' | 'whatsapp'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pathParts = path.split('/').filter(Boolean);
  const tabId = pathParts[2] || 'messages';
  const biz = businesses[0];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedLeadId]);

  // Filter leads
  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.listingTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || lead.type === filterType;
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedLead = mockLeads.find((l) => l.id === selectedLeadId);
  const selectedMessages = selectedLeadId ? (mockMessages[selectedLeadId] || []) : [];

  const stats = {
    total: mockLeads.length,
    unread: mockLeads.filter((l) => l.unread).length,
    active: mockLeads.filter((l) => l.status === 'active').length,
    archived: mockLeads.filter((l) => l.status === 'archived').length,
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      showToast(t('messageSent'), 'success');
      setMessageInput('');
    }
  };

  const handleAction = (action: string, leadId: number) => {
    switch (action) {
      case 'reply':
        setSelectedLeadId(leadId);
        break;
      case 'archive':
        showToast(t('archived'), 'success');
        break;
      case 'delete':
        showToast(t('deleted'), 'success');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Shared Sidebar */}
      <BusinessSidebar 
        activeTab={tabId} 
        business={biz}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <MessageSquare className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('messagesLeads')}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Leads List - Left Panel */}
          <div className={`w-full md:w-80 bg-white border-e border-sand-100 flex flex-col overflow-hidden ${selectedLeadId ? 'hidden md:flex' : ''}`}>
            <div className="p-4 border-b border-sand-100 space-y-3">
              <h1 className="text-lg font-bold text-primary-800">{t('messagesLeads')}</h1>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 w-full text-sm"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 rounded-lg bg-sand-50">
                  <p className="text-xs text-primary-400">{t('allStatus')}</p>
                  <p className="text-lg font-bold text-primary-700">{stats.total}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-accent-50">
                  <p className="text-xs text-primary-400">Unread</p>
                  <p className="text-lg font-bold text-accent-600">{stats.unread}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-success-50">
                  <p className="text-xs text-primary-400">Active</p>
                  <p className="text-lg font-bold text-success-600">{stats.active}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-sand-50">
                  <p className="text-xs text-primary-400">Archive</p>
                  <p className="text-lg font-bold text-primary-600">{stats.archived}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <div className="flex-1 relative group">
                  <button className="input w-full text-xs py-1.5 flex items-center justify-between">
                    <span>{filterType === 'all' ? 'Type' : filterType}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-sand-100 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                    {['all', 'chat', 'call', 'whatsapp'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type as any)}
                        className="w-full px-3 py-2 text-xs text-start hover:bg-sand-50 text-primary-700"
                      >
                        {type === 'all' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 relative group">
                  <button className="input w-full text-xs py-1.5 flex items-center justify-between">
                    <span>{filterStatus === 'all' ? 'Status' : filterStatus}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-sand-100 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                    {['all', 'active', 'completed', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className="w-full px-3 py-2 text-xs text-start hover:bg-sand-50 text-primary-700"
                      >
                        {status === 'all' ? 'All Status' : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLeads.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onAction={handleAction} isSelected={selectedLeadId === lead.id} onSelect={() => setSelectedLeadId(lead.id)} />
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-primary-400 text-sm">
                  {lang === 'ar' ? 'لا توجد رسائل' : 'No messages'}
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel - Right */}
          {selectedLead ? (
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-sand-100">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => setSelectedLeadId(null)}
                    className="md:hidden p-2 rounded-lg hover:bg-sand-50"
                  >
                    <ArrowLeft className="w-5 h-5 text-primary-600" />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={selectedLead.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary-700 text-sm">{selectedLead.name}</p>
                    <p className="text-xs text-primary-400 truncate">{selectedLead.listingTitle}</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-sand-50">
                  <MoreVertical className="w-5 h-5 text-primary-500" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sand-50/30">
                {selectedMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-white border border-sand-100 text-primary-700'}`}>
                      <p className="text-sm break-words">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${msg.sender === 'user' ? 'text-primary-100' : 'text-primary-400'}`}>
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'user' && (
                          <>
                            {msg.status === 'read' && <Check className="w-3 h-3" />}
                            {msg.status === 'delivered' && <Check className="w-3 h-3" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-sand-100 bg-white">
                <div className="flex gap-2 mb-2">
                  <button className="p-2 rounded-lg hover:bg-sand-50 text-primary-500">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sand-50 text-primary-500">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="input flex-1 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="btn-primary px-4 text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-sand-50">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-primary-300 mx-auto mb-3" />
                <p className="text-primary-600 font-medium">{lang === 'ar' ? 'اختر محادثة' : 'Select a conversation'}</p>
                <p className="text-sm text-primary-400 mt-1">{lang === 'ar' ? 'اختر رسالة من اليسار لبدء المحادثة' : 'Select a message to start chatting'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
