import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { ListingCardGrid } from '@/components/ListingCard';
import { EmptyState, Modal, StatusBadge } from '@/components/ui';
import { listings, conversations } from '@/data/mockData';
import {
  Heart, GitCompare, X, Search, Send, Image as ImageIcon, Flag, Ban,
  Check, ArrowLeft, ArrowRight, Shield, Clock, Star, MessageSquare,
} from 'lucide-react';

export function FavoritesPage() {
  const { t } = useI18n();
  const { favorites } = useApp();
  const favListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="py-4">
      <h1 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-error-500" />{t('favorites')}
      </h1>
      {favListings.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-10 h-10" />}
          title={t('noFavorites')}
          description={t('noResultsDesc')}
          action={<Link to="/search" className="btn-primary text-sm">{t('browseListings')}</Link>}
        />
      ) : (
        <ListingCardGrid listings={favListings} />
      )}
    </div>
  );
}

export function ComparePage() {
  const { t, lang, formatPrice } = useI18n();
  const { compareList, toggleCompare, clearCompare, showToast } = useApp();
  const compareListings = listings.filter((l) => compareList.includes(l.id));

  if (compareListings.length === 0) {
    return (
      <div className="py-4">
        <h1 className="text-xl font-bold text-primary-800 mb-4 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary-500" />{t('compareListings')}
        </h1>
        <EmptyState
          icon={<GitCompare className="w-10 h-10" />}
          title={t('compareEmpty')}
          description={t('compareEmptyDesc')}
          action={<Link to="/search" className="btn-primary text-sm">{t('browseListings')}</Link>}
        />
      </div>
    );
  }

  // Get all unique spec keys
  const allSpecs = new Set<string>();
  compareListings.forEach((l) => l.specs.forEach((s) => allSpecs.add(s.key)));

  const getSpecValue = (listing: typeof listings[0], key: string) => {
    const spec = listing.specs.find((s) => s.key === key);
    return spec ? (lang === 'ar' ? spec.valueAr : spec.value) : '—';
  };

  // Find differences
  const isDifferent = (key: string) => {
    const values = compareListings.map((l) => getSpecValue(l, key));
    return new Set(values).size > 1;
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary-800 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary-500" />{t('compareListings')}
        </h1>
        <button onClick={clearCompare} className="btn-secondary text-sm"><X className="w-4 h-4" />{t('reset')}</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-start text-sm font-medium text-primary-400 p-3 sticky start-0 bg-sand-50 z-10 min-w-[100px]"></th>
              {compareListings.map((l) => (
                <th key={l.id} className="text-start p-3 min-w-[200px]">
                  <div className="card overflow-hidden">
                    <div className="aspect-[4/3] bg-sand-100">
                      {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    </div>
                    <div className="p-2">
                      <Link to={`/listing/${l.id}`} className="text-sm font-bold text-primary-700 line-clamp-1 hover:text-primary-500">{lang === 'ar' ? l.titleAr : l.title}</Link>
                      <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(l.price, l.perMonth)}</p>
                      <button onClick={() => toggleCompare(l.id)} className="text-xs text-error-500 hover:text-error-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />{t('removeFromCompare')}
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-sm font-medium text-primary-500 p-3 sticky start-0 bg-sand-50">{t('price')}</td>
              {compareListings.map((l) => (
                <td key={l.id} className="p-3 text-sm font-bold text-primary-700">{formatPrice(l.price, l.perMonth)}</td>
              ))}
            </tr>
            <tr>
              <td className="text-sm font-medium text-primary-500 p-3 sticky start-0 bg-sand-50">{t('location')}</td>
              {compareListings.map((l) => (
                <td key={l.id} className="p-3 text-sm text-primary-600">{lang === 'ar' ? l.cityAr : l.city}</td>
              ))}
            </tr>
            <tr>
              <td className="text-sm font-medium text-primary-500 p-3 sticky start-0 bg-sand-50">{t('condition')}</td>
              {compareListings.map((l) => (
                <td key={l.id} className="p-3 text-sm text-primary-600">{l.condition ? t(l.condition) : '—'}</td>
              ))}
            </tr>
            {[...allSpecs].map((key) => (
              <tr key={key}>
                <td className={`text-sm font-medium p-3 sticky start-0 bg-sand-50 ${isDifferent(key) ? 'text-primary-700' : 'text-primary-400'}`}>{key}</td>
                {compareListings.map((l) => (
                  <td key={l.id} className={`p-3 text-sm ${isDifferent(key) ? 'font-bold text-primary-700 bg-primary-50/50' : 'text-primary-500'}`}>
                    {getSpecValue(l, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MessagesPage() {
  const { t, lang, formatDate, formatPrice } = useI18n();
  const { navigate } = useRouter();
  const { showToast } = useApp();
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [convs, setConvs] = useState(conversations);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConvs = convs.filter((c) => {
    const name = lang === 'ar' ? c.participantNameAr : c.participantName;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const active = convs.find((c) => c.id === activeConv);

  const sendMessage = () => {
    if (!message.trim() || !active) return;
    setConvs(convs.map((c) => c.id === active.id ? {
      ...c,
      messages: [...c.messages, { id: Date.now().toString(), sender: 'me', text: message, textAr: message, time: new Date().toISOString(), status: 'sent' }],
      lastMessage: message,
      lastMessageAr: message,
      timestamp: new Date().toISOString(),
    } : c));
    setMessage('');
  };

  const sendOffer = () => {
    if (!active || !offerAmount) return;
    setShowOffer(false);
    setOfferAmount('');
    showToast(t('offerSent'), 'success');
  };

  if (active) {
    return (
      <div className="py-4 max-w-4xl mx-auto">
        <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-sand-100">
            <button onClick={() => setActiveConv(null)} className="p-1.5 rounded-lg hover:bg-sand-50">
              {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-sand-100 overflow-hidden">
              <img src={active.participantAvatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-primary-700 text-sm">{lang === 'ar' ? active.participantNameAr : active.participantName}</h3>
              <p className="text-xs text-primary-400 line-clamp-1">{lang === 'ar' ? active.listingTitleAr : active.listingTitle}</p>
            </div>
            <button onClick={() => showToast(lang === 'ar' ? 'تم الإبلاغ' : 'Reported', 'info')} className="p-2 rounded-lg hover:bg-sand-50 text-primary-400">
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={() => showToast(lang === 'ar' ? 'تم الحظر' : 'Blocked', 'info')} className="p-2 rounded-lg hover:bg-sand-50 text-primary-400">
              <Ban className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-sand-50/30">
            {active.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender === 'me' ? 'bg-primary-600 text-white' : 'bg-white border border-sand-100 text-primary-700'}`}>
                  <p className="text-sm">{lang === 'ar' ? msg.textAr : msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-primary-200' : 'text-primary-300'}`}>
                    {new Date(msg.time).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    {msg.status === 'sent' && ' ✓'}
                    {msg.status === 'delivered' && ' ✓✓'}
                    {msg.status === 'read' && ' ✓✓'}
                  </p>
                </div>
              </div>
            ))}
            {active.offer && (
              <div className="flex justify-center">
                <div className="bg-accent-50 border border-accent-100 rounded-xl p-3 text-center max-w-[80%]">
                  <p className="text-xs text-accent-600 mb-1">{t('sendOffer')}</p>
                  <p className="text-lg font-bold text-accent-700">{formatPrice(active.offer.amount)}</p>
                  {active.offer.status === 'pending' && (
                    <div className="flex gap-2 mt-2 justify-center">
                      <button onClick={() => { setConvs(convs.map((c) => c.id === active.id ? { ...c, offer: { ...c.offer!, status: 'accepted' } } : c)); showToast(t('offerAccepted'), 'success'); }} className="btn-primary text-xs px-3 py-1.5">
                        <Check className="w-3.5 h-3.5" />{t('accept')}
                      </button>
                      <button onClick={() => { setConvs(convs.map((c) => c.id === active.id ? { ...c, offer: { ...c.offer!, status: 'rejected' } } : c)); showToast(t('offerRejected'), 'error'); }} className="btn-danger text-xs px-3 py-1.5">
                        <X className="w-3.5 h-3.5" />{t('rejectBtn')}
                      </button>
                      <button onClick={() => { setShowOffer(true); }} className="btn-secondary text-xs px-3 py-1.5">
                        {t('counteroffer')}
                      </button>
                    </div>
                  )}
                  {active.offer.status === 'accepted' && <span className="badge bg-success-100 text-success-700 mt-1">{t('accepted')}</span>}
                  {active.offer.status === 'rejected' && <span className="badge bg-error-100 text-error-700 mt-1">{t('rejected')}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-sand-100 p-3">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-sand-50 text-primary-400">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('typeMessage')}
                className="input flex-1 text-sm"
              />
              <button onClick={() => setShowOffer(true)} className="btn-secondary px-3 py-2 text-sm whitespace-nowrap">
                {t('sendOffer')}
              </button>
              <button onClick={sendMessage} className="btn-primary p-2.5">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Offer modal */}
        <Modal open={showOffer} onClose={() => setShowOffer(false)} title={t('sendOffer')} size="sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('price')} (SDG)</label>
              <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} className="input" placeholder="0" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-sand-50 rounded-xl text-xs text-primary-400">
              <Clock className="w-4 h-4" />
              {lang === 'ar' ? 'العرض ينتهي خلال 24 ساعة' : 'Offer expires in 24 hours'}
            </div>
            <button onClick={sendOffer} className="btn-primary w-full">{t('sendOffer')}</button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-primary-800 mb-4">{t('messages')}</h1>
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search')} className="input ps-10" />
      </div>
      {filteredConvs.length === 0 ? (
        <EmptyState icon={<MessageSquare className="w-10 h-10" />} title={t('noConversations')} description={t('noMessages')} />
      ) : (
        <div className="space-y-2">
          {filteredConvs.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className="card p-3 flex items-center gap-3 hover:shadow-md transition-all w-full text-start"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-sand-100 overflow-hidden">
                  <img src={conv.participantAvatar} alt="" className="w-full h-full object-cover" />
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -end-1 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-primary-700 text-sm">{lang === 'ar' ? conv.participantNameAr : conv.participantName}</h4>
                  <span className="text-xs text-primary-300 shrink-0">{formatDate(conv.timestamp)}</span>
                </div>
                <p className="text-xs text-primary-400 line-clamp-1">{lang === 'ar' ? conv.lastMessageAr : conv.lastMessage}</p>
                <p className="text-xs text-primary-300 line-clamp-1 mt-0.5">{lang === 'ar' ? conv.listingTitleAr : conv.listingTitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
