import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Modal, EmptyState } from '@/components/ui';
import {
  FolderTree, Plus, Edit2, Trash2, Eye, Save, X, ChevronDown,
  ChevronRight, Archive, Redo, Lock, Zap, Search, Copy,
  AlertCircle, CheckCircle, Clock, Settings
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'multi_select' | 'date' | 'range' | 'file_url';
type DependencyType = 'make-model' | 'region-city' | 'none';

interface ValidationRule {
  type: 'min' | 'max' | 'regex' | 'pattern';
  value: string | number;
}

interface FieldOption {
  id: string;
  labelEn: string;
  labelAr: string;
  dependsOn?: string; // For Make->Model, this would be 'make'
  parentValue?: string; // E.g., 'toyota' for Model options
  sortOrder: number;
}

interface CategoryAttribute {
  id: string;
  keyName: string; // e.g., 'vehicle_make' (immutable after save)
  labelEn: string;
  labelAr: string;
  dataType: FieldType;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isArchived: boolean;
  promoteToIndex: boolean;
  validationRules: ValidationRule[];
  options: FieldOption[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategorySchema {
  id: string;
  categoryId: string;
  categoryNameEn: string;
  categoryNameAr: string;
  description: string;
  parentCategoryId?: string;
  icon: string;
  postingRestricted: boolean;
  restrictionMessage?: string;
  expiryDays: number;
  attributes: CategoryAttribute[];
  schemaVersion: number;
  lastPublishedAt?: string;
  lastPublishedBy?: string;
  status: 'draft' | 'active' | 'archived';
}

// Mock categories tree
const mockCategoryTree: CategorySchema[] = [
  {
    id: 'cat-vehicles',
    categoryId: 'vehicles',
    categoryNameEn: 'Vehicles',
    categoryNameAr: 'المركبات',
    description: 'Cars, trucks, motorcycles and more',
    icon: 'Car',
    postingRestricted: false,
    expiryDays: 30,
    attributes: [
      {
        id: 'attr-1',
        keyName: 'vehicle_make',
        labelEn: 'Make',
        labelAr: 'الماركة',
        dataType: 'select',
        isRequired: true,
        isFilterable: true,
        isSearchable: true,
        isArchived: false,
        promoteToIndex: true,
        validationRules: [],
        options: [
          { id: 'opt-1', labelEn: 'Toyota', labelAr: 'تويوتا', sortOrder: 1 },
          { id: 'opt-2', labelEn: 'BMW', labelAr: 'بي إم دبليو', sortOrder: 2 },
          { id: 'opt-3', labelEn: 'Mercedes', labelAr: 'مرسيدس', sortOrder: 3 },
        ],
        sortOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'attr-2',
        keyName: 'vehicle_model',
        labelEn: 'Model',
        labelAr: 'الموديل',
        dataType: 'select',
        isRequired: true,
        isFilterable: true,
        isSearchable: true,
        isArchived: false,
        promoteToIndex: false,
        validationRules: [],
        options: [
          { id: 'opt-4', labelEn: 'Camry', labelAr: 'كامري', dependsOn: 'vehicle_make', parentValue: 'toyota', sortOrder: 1 },
          { id: 'opt-5', labelEn: 'Corolla', labelAr: 'كورولا', dependsOn: 'vehicle_make', parentValue: 'toyota', sortOrder: 2 },
        ],
        sortOrder: 2,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'attr-3',
        keyName: 'vehicle_year',
        labelEn: 'Year',
        labelAr: 'السنة',
        dataType: 'number',
        isRequired: true,
        isFilterable: true,
        isSearchable: false,
        isArchived: false,
        promoteToIndex: false,
        validationRules: [
          { type: 'min', value: 1990 },
          { type: 'max', value: 2025 },
        ],
        options: [],
        sortOrder: 3,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    schemaVersion: 1,
    status: 'active',
  },
  {
    id: 'cat-realestate',
    categoryId: 'realestate',
    categoryNameEn: 'Real Estate',
    categoryNameAr: 'العقارات',
    description: 'Apartments, houses, land and more',
    icon: 'Home',
    postingRestricted: false,
    expiryDays: 45,
    attributes: [
      {
        id: 'attr-4',
        keyName: 'property_type',
        labelEn: 'Property Type',
        labelAr: 'نوع العقار',
        dataType: 'select',
        isRequired: true,
        isFilterable: true,
        isSearchable: true,
        isArchived: false,
        promoteToIndex: true,
        validationRules: [],
        options: [
          { id: 'opt-6', labelEn: 'Apartment', labelAr: 'شقة', sortOrder: 1 },
          { id: 'opt-7', labelEn: 'House', labelAr: 'منزل', sortOrder: 2 },
          { id: 'opt-8', labelEn: 'Land', labelAr: 'أرض', sortOrder: 3 },
        ],
        sortOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    schemaVersion: 1,
    status: 'active',
  },
];

export function AdminCategoryBuilderPage() {
  const { t } = useI18n();
  const { showToast } = useApp();

  const [categories, setCategories] = useState<CategorySchema[]>(mockCategoryTree);
  const [selectedCategory, setSelectedCategory] = useState<CategorySchema | null>(mockCategoryTree[0]);
  const [selectedAttribute, setSelectedAttribute] = useState<CategoryAttribute | null>(
    mockCategoryTree[0]?.attributes[0] || null
  );
  const [editingAttribute, setEditingAttribute] = useState<CategoryAttribute | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategorySchema | null>(null);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['cat-vehicles', 'cat-realestate']));
  const [searchQuery, setSearchQuery] = useState('');
  const [showValidationRuleModal, setShowValidationRuleModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    categoryNameEn: '',
    categoryNameAr: '',
    description: '',
    icon: 'Folder',
    expiryDays: 30,
  });

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat =>
      cat.categoryNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.categoryNameAr.includes(searchQuery)
    );
  }, [searchQuery, categories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategoryData({
      categoryNameEn: '',
      categoryNameAr: '',
      description: '',
      icon: 'Folder',
      expiryDays: 30,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!newCategoryData.categoryNameEn || !newCategoryData.categoryNameAr) {
      showToast(t('fieldRequired') || 'Please fill all required fields', 'error');
      return;
    }

    const newCategory: CategorySchema = {
      id: `cat-${Date.now()}`,
      categoryId: newCategoryData.categoryNameEn.toLowerCase().replace(/\s+/g, '-'),
      categoryNameEn: newCategoryData.categoryNameEn,
      categoryNameAr: newCategoryData.categoryNameAr,
      description: newCategoryData.description,
      icon: newCategoryData.icon,
      postingRestricted: false,
      expiryDays: newCategoryData.expiryDays,
      attributes: [],
      schemaVersion: 1,
      status: 'active',
    };

    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory);
    setSelectedAttribute(null);
    setShowCategoryModal(false);
    showToast(t('categoryAdded') || 'Category added successfully', 'success');
  };

  const handleDeleteCategory = (category: CategorySchema) => {
    if (categories.length === 1) {
      showToast(t('cannotDeleteLastCategory') || 'Cannot delete the last category', 'error');
      return;
    }
    setCategories(categories.filter(c => c.id !== category.id));
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(categories.find(c => c.id !== category.id) || null);
    }
    showToast(t('categoryDeleted') || 'Category deleted', 'success');
  };

  const handleEditCategory = (category: CategorySchema) => {
    setEditingCategory(category);
    setNewCategoryData({
      categoryNameEn: category.categoryNameEn,
      categoryNameAr: category.categoryNameAr,
      description: category.description,
      icon: category.icon,
      expiryDays: category.expiryDays,
    });
    setShowCategoryModal(true);
  };

  const handleAddAttribute = () => {
    setEditingAttribute(null);
    setShowAttributeModal(true);
  };

  const handleEditAttribute = (attr: CategoryAttribute) => {
    setEditingAttribute(attr);
    setShowAttributeModal(true);
  };

  const handleSaveAttribute = () => {
    if (editingAttribute) {
      showToast(
        editingAttribute.id ? t('attributeUpdated') || 'Attribute updated' : t('attributeAdded') || 'Attribute added',
        'success'
      );
      setShowAttributeModal(false);
    }
  };

  const handleDeleteAttribute = (attr: CategoryAttribute) => {
    showToast(t('attributeDeleted') || 'Attribute deleted', 'success');
  };

  const handleArchiveAttribute = (attr: CategoryAttribute) => {
    showToast(t('attributeArchived') || 'Attribute archived', 'info');
  };

  const handlePublishSchema = () => {
    if (selectedCategory) {
      showToast(t('schemaPublished') || 'Schema published successfully', 'success');
    }
  };

  const handleRestoreAttribute = (attr: CategoryAttribute) => {
    showToast(t('attributeRestored') || 'Attribute restored', 'success');
  };

  return (
    <AdminSidebar activeTab="categories" showRoleSelector={false}>
      <div className="p-4 sm:p-6 space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-800">{t('categoryBuilder') || 'Category Builder'}</h1>
            <p className="text-sm text-primary-500 mt-1">{t('manageCategories') || 'Manage categories, attributes and filters'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Category Tree */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <h2 className="font-bold text-primary-800 mb-3 flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                {t('categories') || 'Categories'}
              </h2>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-primary-400" />
                <input
                  type="text"
                  placeholder={t('search') || 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-sm"
                />
              </div>

              {/* Add Category Button */}
              <button
                onClick={handleAddCategory}
                className="w-full btn-primary text-sm mb-3"
              >
                <Plus className="w-4 h-4" />
                {t('addCategory') || 'Add Category'}
              </button>

              {/* Category Tree */}
              <div className="space-y-1">
                {filteredCategories.map(category => (
                  <div key={category.id}>
                    <div className="flex items-center gap-1 group">
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedAttribute(category.attributes[0] || null);
                          toggleCategory(category.id);
                        }}
                        className={`flex-1 flex items-center gap-2 px-2 py-2 rounded text-sm font-medium transition ${
                          selectedCategory?.id === category.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-primary-600 hover:bg-sand-50'
                        }`}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-4 h-4 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 shrink-0" />
                        )}
                        <span className="truncate">{category.categoryNameEn}</span>
                        <span className="ml-auto text-xs text-primary-400 shrink-0">
                          v{category.schemaVersion}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-primary-400 hover:text-primary-600 p-1.5 rounded hover:bg-sand-50 opacity-0 group-hover:opacity-100 transition"
                        title="Edit category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-primary-400 hover:text-error-600 p-1.5 rounded hover:bg-sand-50 opacity-0 group-hover:opacity-100 transition"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Attributes list under expanded category */}
                    {expandedCategories.has(category.id) && (
                      <div className="ml-6 space-y-1">
                        {category.attributes.map(attr => (
                          <button
                            key={attr.id}
                            onClick={() => setSelectedAttribute(attr)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium transition ${
                              selectedAttribute?.id === attr.id
                                ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-600'
                                : 'text-primary-500 hover:bg-sand-50'
                            }`}
                          >
                            <div className="truncate">{attr.labelEn}</div>
                            <div className="text-xs text-primary-400">{attr.dataType}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle & Right: Attribute Editor & Preview */}
          <div className="lg:col-span-3 space-y-4">
            {selectedCategory ? (
              <>
                {/* Category Info Card */}
                <div className="card p-4 bg-gradient-to-br from-primary-50 to-sand-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-primary-800">{selectedCategory.categoryNameEn}</h3>
                      <p className="text-sm text-primary-600 mt-1">{selectedCategory.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-primary-600">
                        <span className="badge bg-primary-100 text-primary-700">v{selectedCategory.schemaVersion}</span>
                        <span>Attrs: {selectedCategory.attributes.length}</span>
                        <span>Status: {selectedCategory.status}</span>
                        {selectedCategory.lastPublishedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(selectedCategory.lastPublishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="btn-secondary text-sm"
                        title="Preview form"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handlePublishSchema}
                        className="btn-primary text-sm"
                        title="Publish schema"
                      >
                        <Save className="w-4 h-4" />
                        {t('publish') || 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs: Attributes | Settings */}
                <div className="card">
                  <div className="flex items-center gap-4 border-b border-sand-100 px-4 pt-4">
                    <button
                      onClick={() => setShowPreview(false)}
                      className={`pb-3 px-2 font-medium text-sm border-b-2 transition ${
                        !showPreview
                          ? 'border-primary-600 text-primary-700'
                          : 'border-transparent text-primary-400 hover:text-primary-600'
                      }`}
                    >
                      {t('attributes') || 'Attributes'}
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={`pb-3 px-2 font-medium text-sm border-b-2 transition ${
                        showPreview
                          ? 'border-primary-600 text-primary-700'
                          : 'border-transparent text-primary-400 hover:text-primary-600'
                      }`}
                    >
                      {t('previewForm') || 'Preview Form'}
                    </button>
                  </div>

                  {!showPreview ? (
                    // Attributes List
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-primary-800">{t('schemaAttributes') || 'Schema Attributes'}</h3>
                        <button
                          onClick={handleAddAttribute}
                          className="btn-primary text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addAttribute') || 'Add Attribute'}
                        </button>
                      </div>

                      {selectedCategory.attributes.length === 0 ? (
                        <EmptyState
                          icon={<AlertCircle className="w-12 h-12 text-primary-300" />}
                          title={t('noAttributes') || 'No attributes'}
                          description={t('addAttributeToStart') || 'Add your first attribute to start'}
                        />
                      ) : (
                        <div className="space-y-2">
                          {selectedCategory.attributes.map((attr, idx) => (
                            <div
                              key={attr.id}
                              className={`border rounded-lg p-3 transition ${
                                selectedAttribute?.id === attr.id
                                  ? 'border-primary-300 bg-primary-50'
                                  : 'border-sand-100 hover:border-sand-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  onClick={() => setSelectedAttribute(attr)}
                                  className="flex-1 cursor-pointer min-w-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary-400">#{idx + 1}</span>
                                    <p className="font-medium text-primary-800 truncate">{attr.labelEn}</p>
                                    {attr.isRequired && (
                                      <span className="text-xs text-error-600 font-bold">*</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-primary-500 mt-1">
                                    <span className="badge bg-sand-100 text-primary-600 text-xs">
                                      {attr.dataType}
                                    </span>
                                    {attr.isFilterable && (
                                      <span className="badge bg-success-100 text-success-700 text-xs ml-1">
                                        Filterable
                                      </span>
                                    )}
                                    {attr.promoteToIndex && (
                                      <span className="badge bg-primary-100 text-primary-700 text-xs ml-1">
                                        <Zap className="w-3 h-3 inline mr-1" />
                                        Indexed
                                      </span>
                                    )}
                                    {attr.isArchived && (
                                      <span className="badge bg-warning-100 text-warning-700 text-xs ml-1">
                                        Archived
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => handleEditAttribute(attr)}
                                    className="text-primary-500 hover:text-primary-700 p-1 rounded hover:bg-sand-50"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {!attr.isArchived ? (
                                    <button
                                      onClick={() => handleArchiveAttribute(attr)}
                                      className="text-primary-400 hover:text-warning-600 p-1 rounded hover:bg-sand-50"
                                      title="Archive"
                                    >
                                      <Archive className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRestoreAttribute(attr)}
                                      className="text-primary-400 hover:text-success-600 p-1 rounded hover:bg-sand-50"
                                      title="Restore"
                                    >
                                      <Redo className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteAttribute(attr)}
                                    className="text-primary-400 hover:text-error-600 p-1 rounded hover:bg-sand-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Attribute Details (when selected) */}
                              {selectedAttribute?.id === attr.id && (
                                <div className="mt-3 pt-3 border-t border-primary-100 space-y-2 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-primary-500 font-medium">Key Name</p>
                                      <p className="text-primary-700 font-mono flex items-center gap-1">
                                        {attr.keyName}
                                        <Lock className="w-3 h-3 text-primary-400" />
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-primary-500 font-medium">Arabic</p>
                                      <p className="text-primary-700 text-right" dir="rtl">{attr.labelAr}</p>
                                    </div>
                                  </div>
                                  {attr.validationRules.length > 0 && (
                                    <div>
                                      <p className="text-primary-500 font-medium">Validation Rules</p>
                                      <div className="flex gap-1 flex-wrap mt-1">
                                        {attr.validationRules.map((rule, i) => (
                                          <span key={i} className="badge bg-sand-100 text-primary-600">
                                            {rule.type}: {rule.value}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {attr.options.length > 0 && (
                                    <div>
                                      <p className="text-primary-500 font-medium">Options ({attr.options.length})</p>
                                      <div className="space-y-1 mt-1">
                                        {attr.options.slice(0, 3).map(opt => (
                                          <div key={opt.id} className="badge bg-sand-100 text-primary-600">
                                            {opt.labelEn}
                                          </div>
                                        ))}
                                        {attr.options.length > 3 && (
                                          <div className="text-primary-400 text-xs">
                                            +{attr.options.length - 3} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Preview Form
                    <div className="p-4 space-y-4">
                      <div className="bg-sand-50 p-4 rounded-lg border border-sand-100">
                        <p className="text-sm font-bold text-primary-800 mb-3">{t('previewForm') || 'Form Preview'}</p>
                        <p className="text-xs text-primary-500 mb-3">
                          {t('previewInfo') || 'This is how the form will appear to sellers posting in this category:'}
                        </p>
                        <div className="space-y-3">
                          {selectedCategory.attributes
                            .filter(a => !a.isArchived)
                            .map(attr => (
                              <div key={attr.id}>
                                <label className="block text-sm font-medium text-primary-700 mb-1">
                                  {attr.labelEn}
                                  {attr.isRequired && <span className="text-error-600"> *</span>}
                                </label>
                                {attr.dataType === 'text' && (
                                  <input
                                    type="text"
                                    placeholder={`Enter ${attr.labelEn}`}
                                    className="input text-sm"
                                    disabled
                                  />
                                )}
                                {attr.dataType === 'number' && (
                                  <input
                                    type="number"
                                    placeholder={`Enter ${attr.labelEn}`}
                                    className="input text-sm"
                                    disabled
                                  />
                                )}
                                {attr.dataType === 'select' && (
                                  <select className="input text-sm" disabled>
                                    <option>Select {attr.labelEn}</option>
                                    {attr.options.slice(0, 3).map(opt => (
                                      <option key={opt.id}>{opt.labelEn}</option>
                                    ))}
                                  </select>
                                )}
                                {attr.dataType === 'checkbox' && (
                                  <label className="flex items-center gap-2">
                                    <input type="checkbox" className="accent-primary-600" disabled />
                                    <span className="text-sm text-primary-600">{attr.labelEn}</span>
                                  </label>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FolderTree className="w-12 h-12 text-primary-300" />}
                title={t('noCategory') || 'No category selected'}
                description={t('selectCategory') || 'Select a category from the left panel to get started'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Attribute Modal */}
      <Modal
        isOpen={showAttributeModal}
        title={editingAttribute ? t('editAttribute') || 'Edit Attribute' : t('addAttribute') || 'Add Attribute'}
        onClose={() => setShowAttributeModal(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('labelEn') || 'Label (EN)'}</label>
              <input
                type="text"
                placeholder="e.g., Make"
                className="input text-sm"
                defaultValue={editingAttribute?.labelEn || ''}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('labelAr') || 'Label (AR)'}</label>
              <input
                type="text"
                placeholder="مثال: الماركة"
                className="input text-sm"
                dir="rtl"
                defaultValue={editingAttribute?.labelAr || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('fieldType') || 'Field Type'}</label>
              <select className="input text-sm" defaultValue={editingAttribute?.dataType || 'text'}>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="multi_select">Multi-Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
                <option value="range">Range</option>
                <option value="file_url">File</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('sortOrder') || 'Sort Order'}</label>
              <input
                type="number"
                className="input text-sm"
                defaultValue={editingAttribute?.sortOrder || 1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary-600" defaultChecked={editingAttribute?.isRequired} />
              <span className="text-sm text-primary-700">{t('required') || 'Required'}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary-600" defaultChecked={editingAttribute?.isFilterable} />
              <span className="text-sm text-primary-700">{t('filterable') || 'Filterable'}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary-600" defaultChecked={editingAttribute?.promoteToIndex} />
              <span className="text-sm text-primary-700 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {t('promoteToIndex') || 'Promote to Index (Search)'}
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={handleSaveAttribute} className="btn-primary flex-1">
              <Save className="w-4 h-4" />
              {t('save') || 'Save'}
            </button>
            <button onClick={() => setShowAttributeModal(false)} className="btn-secondary flex-1">
              <X className="w-4 h-4" />
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        title={editingCategory ? t('editCategory') || 'Edit Category' : t('addCategory') || 'Add Category'}
        onClose={() => setShowCategoryModal(false)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('categoryNameEn') || 'Category Name (EN)'}</label>
              <input
                type="text"
                placeholder="e.g., Vehicles"
                className="input text-sm"
                value={newCategoryData.categoryNameEn}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, categoryNameEn: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('categoryNameAr') || 'Category Name (AR)'}</label>
              <input
                type="text"
                placeholder="مثال: المركبات"
                className="input text-sm"
                dir="rtl"
                value={newCategoryData.categoryNameAr}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, categoryNameAr: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-primary-700 mb-1 block">{t('description') || 'Description'}</label>
            <textarea
              placeholder="Brief description of this category"
              className="input text-sm h-20 resize-none"
              value={newCategoryData.description}
              onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('icon') || 'Icon'}</label>
              <select 
                className="input text-sm"
                value={newCategoryData.icon}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, icon: e.target.value })}
              >
                <option value="Folder">Folder</option>
                <option value="Car">Car</option>
                <option value="Home">Home</option>
                <option value="Briefcase">Briefcase</option>
                <option value="Package">Package</option>
                <option value="Zap">Zap</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-primary-700 mb-1 block">{t('expiryDays') || 'Listing Expiry (Days)'}</label>
              <input
                type="number"
                className="input text-sm"
                value={newCategoryData.expiryDays}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, expiryDays: parseInt(e.target.value) })}
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button onClick={handleSaveCategory} className="btn-primary flex-1">
              <Save className="w-4 h-4" />
              {editingCategory ? t('update') || 'Update' : t('create') || 'Create'}
            </button>
            <button onClick={() => setShowCategoryModal(false)} className="btn-secondary flex-1">
              <X className="w-4 h-4" />
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminSidebar>
  );
}
