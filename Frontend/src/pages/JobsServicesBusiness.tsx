import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useRouter, Link } from '@/router/Router';
import { EmptyState, Modal, RatingStars, StatusBadge, TrustBadge } from '@/components/ui';
import { jobs, businesses, listings, sampleReviews } from '@/data/mockData';
import {
  MapPin, Briefcase, Clock, Star, Phone, MessageSquare, Share2,
  Flag, Check, Send, Heart, ChevronLeft, ChevronRight, Wrench,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

export function JobsPage() {
  const { t, lang, formatDate } = useI18n();
  const { navigate } = useRouter();
  const { savedJobs, toggleSavedJob, applyToJob, appliedJobs, showToast } = useApp();
  const [filter, setFilter] = useState('all');
  const [showApply, setShowApply] = useState<string | null>(null);

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.type === filter);

  return (
    <div className="py-4">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2"><Briefcase className="w-6 h-6" />{t('jobs')}</h1>
        <p className="text-sm text-primary-100">{lang === 'ar' ? 'فرص عمل في السودان' : 'Job opportunities in Sudan'}</p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {['all', 'government', 'private', 'freelance', 'remote'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'chip-active' : 'chip-default'}>
            {f === 'all' ? t('all') : t(f as TranslationKey)}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((job) => {
          const title = lang === 'ar' ? job.titleAr : job.title;
          const company = lang === 'ar' ? job.companyAr : job.company;
          const city = lang === 'ar' ? job.cityAr : job.city;
          const salary = lang === 'ar' ? job.salaryAr : job.salary;
          const isSaved = savedJobs.includes(job.id);
          const isApplied = appliedJobs.some((a) => a.jobId === job.id);

          return (
            <div key={job.id} className="card p-4 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-sand-100 overflow-hidden shrink-0">
                  <img src={job.logo} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(`/jobs/${job.id}`)} className="font-bold text-primary-700 hover:text-primary-500 text-sm line-clamp-1 text-start">{title}</button>
                  <p className="text-xs text-primary-400">{company}</p>
                </div>
                <button onClick={() => toggleSavedJob(job.id)} className="p-1.5 rounded-lg hover:bg-sand-50">
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-error-500 text-error-500' : 'text-primary-300'}`} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-primary-50 text-primary-600">{t(job.type as TranslationKey)}</span>
                {job.verified && <span className="badge bg-success-50 text-success-600">{t('verified')}</span>}
              </div>
              <div className="space-y-1 text-xs text-primary-500">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{city}</p>
                <p className="font-medium text-primary-600">{salary}</p>
                <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{t('deadline')}: {formatDate(job.deadline)}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-sand-50">
                {isApplied ? (
                  <span className="btn bg-success-50 text-success-600 border border-success-200 px-4 py-2 text-sm flex-1 justify-center">
                    <Check className="w-4 h-4" />{t('applicationSent')}
                  </span>
                ) : (
                  <button onClick={() => setShowApply(job.id)} className="btn-primary text-sm flex-1">{t('applyNow')}</button>
                )}
                <button onClick={() => navigate(`/jobs/${job.id}`)} className="btn-secondary text-sm px-3">{t('viewDetails')}</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply modal */}
      <Modal open={!!showApply} onClose={() => setShowApply(null)} title={t('applyNow')} size="sm">
        <ApplyForm job={jobs.find((j) => j.id === showApply)} onApply={() => { if (showApply) { applyToJob(showApply); setShowApply(null); showToast(t('applicationSent'), 'success'); } }} />
      </Modal>
    </div>
  );
}

function ApplyForm({ job, onApply }: { job: typeof jobs[0] | undefined; onApply: () => void }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cover, setCover] = useState('');

  return (
    <div className="space-y-3">
      {job && <p className="text-sm font-medium text-primary-600">{lang === 'ar' ? job.titleAr : job.title}</p>}
      <div>
        <label className="text-sm font-medium text-primary-600 mb-1 block">{t('contactDetails')}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder={lang === 'ar' ? 'الاسم' : 'Name'} />
      </div>
      <div>
        <label className="text-sm font-medium text-primary-600 mb-1 block">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="email@example.com" />
      </div>
      <div>
        <label className="text-sm font-medium text-primary-600 mb-1 block">{t('call')}</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+249..." />
      </div>
      <div>
        <label className="text-sm font-medium text-primary-600 mb-1 block">{t('description')}</label>
        <textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={4} className="input resize-none" placeholder={lang === 'ar' ? 'رسالة تعريفية...' : 'Cover letter...'} />
      </div>
      <button onClick={onApply} className="btn-primary w-full"><Send className="w-4 h-4" />{t('submit')}</button>
    </div>
  );
}

export function JobDetailPage() {
  const { t, lang, formatDate, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { savedJobs, toggleSavedJob, applyToJob, appliedJobs, showToast } = useApp();
  const [showApply, setShowApply] = useState(false);

  const id = path.split('/')[2];
  const job = jobs.find((j) => j.id === id);
  if (!job) return <EmptyState icon={<Briefcase className="w-10 h-10" />} title={t('noResults')} />;

  const title = lang === 'ar' ? job.titleAr : job.title;
  const company = lang === 'ar' ? job.companyAr : job.company;
  const city = lang === 'ar' ? job.cityAr : job.city;
  const salary = lang === 'ar' ? job.salaryAr : job.salary;
  const desc = lang === 'ar' ? job.descriptionAr : job.description;
  const reqs = lang === 'ar' ? job.requirementsAr : job.requirements;
  const isSaved = savedJobs.includes(job.id);
  const isApplied = appliedJobs.some((a) => a.jobId === job.id);

  return (
    <div className="py-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-primary-400 mb-3">
        <button onClick={() => navigate('/jobs')} className="hover:text-primary-600">{t('jobs')}</button>
        <span className="text-sand-300">/</span>
        <span className="text-primary-600 font-medium line-clamp-1">{title}</span>
      </div>

      <div className="card p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-sand-100 overflow-hidden shrink-0">
            <img src={job.logo} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-800 mb-1">{title}</h1>
            <p className="text-sm text-primary-500">{company}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge bg-primary-50 text-primary-600">{t(job.type as TranslationKey)}</span>
              {job.verified && <span className="badge bg-success-50 text-success-600">{t('verified')}</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-sand-50 rounded-xl">
            <p className="text-xs text-primary-400">{t('salary')}</p>
            <p className="font-bold text-primary-700">{salary}</p>
          </div>
          <div className="p-3 bg-sand-50 rounded-xl">
            <p className="text-xs text-primary-400">{t('location')}</p>
            <p className="font-bold text-primary-700">{city}</p>
          </div>
          <div className="p-3 bg-sand-50 rounded-xl">
            <p className="text-xs text-primary-400">{t('deadline')}</p>
            <p className="font-bold text-primary-700">{formatDate(job.deadline)}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {isApplied ? (
            <span className="btn bg-success-50 text-success-600 border border-success-200 px-4 py-2 text-sm flex-1 justify-center">
              <Check className="w-4 h-4" />{t('applicationSent')}
            </span>
          ) : (
            <button onClick={() => setShowApply(true)} className="btn-primary flex-1">{t('applyNow')}</button>
          )}
          <button onClick={() => { toggleSavedJob(job.id); showToast(t('save'), 'success'); }} className={`btn px-4 border ${isSaved ? 'bg-error-50 border-error-200 text-error-600' : 'border-sand-200 text-primary-600'}`}>
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-error-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="font-bold text-primary-800 mb-3">{t('description')}</h2>
        <p className="text-sm text-primary-600 leading-relaxed">{desc}</p>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="font-bold text-primary-800 mb-3">{t('requirements')}</h2>
        <ul className="space-y-2">
          {reqs.map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-primary-600">
              <Check className="w-4 h-4 text-primary-500 shrink-0" />{r}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-4 text-sm text-primary-400">
        <span>{formatNumber(job.views)} {t('views')}</span>
        <span>{formatDate(job.postedAt)}</span>
      </div>

      <Modal open={showApply} onClose={() => setShowApply(false)} title={t('applyNow')} size="sm">
        <ApplyForm job={job} onApply={() => { applyToJob(job.id); setShowApply(false); showToast(t('applicationSent'), 'success'); }} />
      </Modal>
    </div>
  );
}

export function BusinessProfilePage() {
  const { t, lang, formatDate, formatPrice, formatNumber } = useI18n();
  const { path, navigate } = useRouter();
  const { showToast } = useApp();
  const [tab, setTab] = useState('listings');
  const [showReview, setShowReview] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [reviews, setReviews] = useState(sampleReviews);

  const id = path.split('/')[2];
  const biz = businesses.find((b) => b.id === id);
  if (!biz) return <EmptyState icon={<Briefcase className="w-10 h-10" />} title={t('noResults')} />;

  const name = lang === 'ar' ? biz.nameAr : biz.name;
  const city = lang === 'ar' ? biz.cityAr : biz.city;
  const area = lang === 'ar' ? biz.areaAr : biz.area;
  const desc = lang === 'ar' ? biz.descriptionAr : biz.description;
  const bizListings = listings.filter((l) => l.businessId === biz.id && l.status === 'published');

  return (
    <div className="py-4 pb-20 md:pb-8">
      {/* Cover */}
      <div className="relative h-32 sm:h-48 rounded-2xl overflow-hidden bg-sand-100 mb-16">
        <img src={biz.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute -bottom-12 start-4">
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden">
            <img src={biz.logo} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-800">{name}</h1>
              {biz.verified && <TrustBadge type="verified" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-400 mt-1">
              <MapPin className="w-4 h-4" />{city} - {area}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <RatingStars rating={biz.rating} size="md" />
              <span className="text-sm font-medium text-primary-600">{biz.rating}</span>
              <span className="text-sm text-primary-400">({biz.reviewCount} {t('ratingCount')})</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowContact(true)} className="btn-primary text-sm"><Phone className="w-4 h-4" />{t('call')}</button>
            <a href={`https://wa.me/${biz.whatsapp?.replace(/\s+/g, '').replace(/^\+/, '') || biz.phone.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your services`)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2z"/></svg>{t('whatsapp')}</a>
            <button onClick={() => showToast(t('share'), 'success')} className="btn-secondary text-sm"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => showToast(t('reportSubmitted'), 'success')} className="btn-secondary text-sm"><Flag className="w-4 h-4" /></button>
          </div>
        </div>

        <p className="text-sm text-primary-600 mb-4 max-w-2xl">{desc}</p>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-primary-700">{biz.listingsCount}</p>
            <p className="text-xs text-primary-400">{t('listingsCount')}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-primary-700">{biz.followers}</p>
            <p className="text-xs text-primary-400">{t('followers')}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-lg font-bold text-primary-700">{biz.rating}</p>
            <p className="text-xs text-primary-400">{t('rating')}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-sm font-bold text-primary-700">{formatDate(biz.memberSince)}</p>
            <p className="text-xs text-primary-400">{t('memberSince')}</p>
          </div>
        </div>

        {/* Hours */}
        <div className="card p-4 mb-4">
          <h3 className="font-bold text-primary-700 mb-2">{t('hours')}</h3>
          {biz.hours.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1">
              <span className="text-primary-600">{lang === 'ar' ? h.dayAr : h.day}</span>
              <span className={h.closed ? 'text-error-500' : 'text-primary-500'}>
                {h.closed ? t('closed') : `${h.open} - ${h.close}`}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-sand-100">
          {['listings', 'services', 'reviews', 'staff'].map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${tab === tb ? 'border-primary-600 text-primary-700' : 'border-transparent text-primary-400 hover:text-primary-600'}`}>
              {tb === 'listings' ? t('myListings') : tb === 'services' ? t('services') : tb === 'reviews' ? t('reviews') : t('staff')}
            </button>
          ))}
        </div>

        {tab === 'listings' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {bizListings.map((l) => (
              <Link key={l.id} to={`/listing/${l.id}`} className="card overflow-hidden hover:shadow-md transition-all group">
                <div className="aspect-[4/3] bg-sand-100">
                  {l.images[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-primary-700 line-clamp-1">{lang === 'ar' ? l.titleAr : l.title}</p>
                  <p className="text-sm font-bold text-primary-600">{formatPrice(l.price, l.perMonth)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'services' && biz.services && (
          <div className="flex flex-wrap gap-2">
            {biz.services.map((s, i) => (
              <span key={i} className="chip-default"><Wrench className="w-3.5 h-3.5" />{s}</span>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-primary-700">{biz.rating}</div>
                <div>
                  <RatingStars rating={biz.rating} size="md" />
                  <p className="text-xs text-primary-400">{biz.reviewCount} {t('ratingCount')}</p>
                </div>
              </div>
              <button onClick={() => setShowReview(true)} className="btn-primary text-sm">{t('writeReview')}</button>
            </div>
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-sand-100 overflow-hidden shrink-0">
                      {rev.avatar && <img src={rev.avatar} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-primary-700 text-sm">{lang === 'ar' ? rev.authorAr : rev.author}</span>
                        <RatingStars rating={rev.rating} />
                        <span className="text-xs text-primary-300">{rev.date}</span>
                      </div>
                      <p className="text-sm text-primary-600">{lang === 'ar' ? rev.textAr : rev.text}</p>
                      {rev.reply && (
                        <div className="mt-2 ps-3 border-s-2 border-sand-100">
                          <p className="text-xs font-medium text-primary-500 mb-1">{t('businessReply')}</p>
                          <p className="text-sm text-primary-500">{lang === 'ar' ? rev.replyAr : rev.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'staff' && biz.staff && (
          <div className="grid sm:grid-cols-2 gap-3">
            {biz.staff.map((s, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sand-100 overflow-hidden">
                  <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-primary-700 text-sm">{lang === 'ar' ? s.nameAr : s.name}</p>
                  <p className="text-xs text-primary-400">{lang === 'ar' ? s.roleAr : s.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title={t('contactPreview')} size="sm">
        <div className="space-y-3">
          <div className="bg-sand-50 rounded-xl p-4 text-center">
            <p className="text-xs text-primary-400 mb-1">{t('sellerInfo')}</p>
            <p className="text-lg font-bold text-primary-700">{biz.phone}</p>
          </div>
          <a href={`tel:${biz.phone.replace(/\s+/g, '')}`} className="btn-primary w-full justify-center">
            <Phone className="w-4 h-4" />{t('call')}
          </a>
          <button onClick={() => { setShowContact(false); navigate('/account/messages'); }} className="btn-secondary w-full">
            <MessageSquare className="w-4 h-4" />{t('message')}
          </button>
        </div>
      </Modal>

      {/* Review modal */}
      <Modal open={showReview} onClose={() => setShowReview(false)} title={t('writeReview')} size="sm">
        <ReviewForm onSubmit={() => { setShowReview(false); showToast(t('successState'), 'success'); }} />
      </Modal>
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: () => void }) {
  const { t, lang } = useI18n();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-primary-600 mb-2 block">{t('rating')}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className={`w-8 h-8 ${s <= rating ? 'fill-accent-400 text-accent-400' : 'text-sand-200'}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-primary-600 mb-2 block">{t('description')}</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="input resize-none" placeholder={lang === 'ar' ? 'اكتب تقييمك...' : 'Write your review...'} />
      </div>
      <button onClick={onSubmit} className="btn-primary w-full">{t('submit')}</button>
    </div>
  );
}
