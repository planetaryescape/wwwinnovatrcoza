type ExportableData = Record<string, unknown>[];

interface CSVExportOptions {
  filename: string;
  headers?: string[];
  fields?: string[];
}

export function exportToCSV(data: ExportableData, options: CSVExportOptions): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename, headers, fields } = options;
  
  const fieldNames = fields || Object.keys(data[0]);
  
  const headerRow = headers || fieldNames.map(field => 
    field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
  );
  
  const csvRows: string[] = [];
  csvRows.push(headerRow.join(','));
  
  for (const row of data) {
    const values = fieldNames.map(field => {
      const value = row[field];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportUsersToCSV(users: any[]): void {
  const mappedData = users.map(user => ({
    id: user.id,
    name: user.name || '',
    email: user.email,
    company: user.company || '',
    membershipTier: user.membershipTier,
    status: user.status,
    role: user.role,
    creditsBasic: user.creditsBasic,
    creditsPro: user.creditsPro,
    totalSpend: user.totalSpend || '0',
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || '',
    lastActivityDate: user.lastActivityDate || '',
  }));

  exportToCSV(mappedData, {
    filename: 'innovatr_users',
    headers: [
      'ID',
      'Name',
      'Email',
      'Company',
      'Membership Tier',
      'Status',
      'Role',
      'Basic Credits',
      'Pro Credits',
      'Total Spend',
      'Created At',
      'Last Login',
      'Last Activity',
    ],
  });
}

export function exportReportsToCSV(reports: any[]): void {
  const mappedData = reports.map(report => ({
    id: report.id,
    title: report.title,
    category: report.category,
    industry: report.industry || '',
    status: report.status || 'published',
    accessLevel: report.accessLevel || 'public',
    date: report.date,
    viewCount: report.viewCount || 0,
    downloadCount: report.downloadCount || 0,
    topics: Array.isArray(report.topics) ? report.topics.join('; ') : (Array.isArray(report.tags) ? report.tags.join('; ') : ''),
    teaser: report.teaser || '',
  }));

  exportToCSV(mappedData, {
    filename: 'innovatr_reports',
    headers: [
      'ID',
      'Title',
      'Category',
      'Industry',
      'Status',
      'Access Level',
      'Date',
      'Views',
      'Downloads',
      'Topics',
      'Preview Text',
    ],
  });
}

export function exportPerformanceToCSV(reports: any[]): void {
  const mappedData = reports.map(report => ({
    title: report.title,
    category: report.category,
    accessLevel: report.accessLevel || 'public',
    viewCount: report.viewCount || 0,
    uniqueViewCount: report.uniqueViewCount || 0,
    downloadCount: report.downloadCount || 0,
    upgradeInfluenceScore: report.upgradeInfluenceScore || 0,
    engagementRate: report.viewCount ? ((report.downloadCount || 0) / report.viewCount * 100).toFixed(1) + '%' : '0%',
    date: report.date,
  }));

  exportToCSV(mappedData, {
    filename: 'innovatr_report_performance',
    headers: [
      'Title',
      'Category',
      'Access Level',
      'Total Views',
      'Unique Views',
      'Downloads',
      'Upgrade Influence',
      'Engagement Rate',
      'Published Date',
    ],
  });
}

export function exportOrdersToCSV(orders: any[]): void {
  const mappedData = orders.map(order => ({
    id: order.id,
    customerName: order.customerName || '',
    customerEmail: order.customerEmail,
    customerCompany: order.customerCompany || '',
    purchaseType: order.purchaseType,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    createdAt: order.createdAt,
  }));

  exportToCSV(mappedData, {
    filename: 'innovatr_orders',
    headers: [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Company',
      'Purchase Type',
      'Amount',
      'Currency',
      'Status',
      'Created At',
    ],
  });
}

export function exportSubscriptionsToCSV(subscriptions: any[]): void {
  const mappedData = subscriptions.map(sub => ({
    id: sub.id,
    customerEmail: sub.customerEmail,
    planType: sub.planType,
    amount: sub.amount,
    currency: sub.currency,
    billingInterval: sub.billingInterval,
    status: sub.status,
    cyclesCompleted: sub.cyclesCompleted,
    cyclesTotal: sub.cyclesTotal,
    nextBillingDate: sub.nextBillingDate || '',
    createdAt: sub.createdAt,
  }));

  exportToCSV(mappedData, {
    filename: 'innovatr_subscriptions',
    headers: [
      'Subscription ID',
      'Customer Email',
      'Plan Type',
      'Amount',
      'Currency',
      'Billing Interval',
      'Status',
      'Cycles Completed',
      'Total Cycles',
      'Next Billing Date',
      'Created At',
    ],
  });
}
