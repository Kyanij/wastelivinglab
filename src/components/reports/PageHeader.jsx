import { useTranslation } from 'react-i18next';

export default function PageHeader({ 
  title, 
  description,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
}