/**
 * Branch Data Generator
 * Generates unique, consistent sample data for each branch based on branch ID
 */

// Simple seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string to number seed
    this.seed = seed.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// Sample data pools
const branchNames = [
  'Mike Salam', 'Adeola Branch', 'Ikeja Central', 'Victoria Island', 
  'Surulere Hub', 'Yaba Office', 'Lekki Branch', 'Ikoyi Center',
  'Festac Branch', 'Ajah Office', 'Maryland Hub', 'Gbagada Branch'
];

const regions = [
  'Lagos State', 'Ogun State', 'Oyo State', 'Osun State',
  'Ondo State', 'Ekiti State', 'Kwara State', 'Kogi State'
];

const creditOfficerNames = [
  'Ademola Jumoke', 'Adegboyega Precious', 'Nneka Chukwu', 'Damilare Usman',
  'Jide Kosoko', 'Oladeji Israel', 'Eze Chinedu', 'Adebanji Bolaji',
  'Baba Kaothat', 'Adebayo Salami', 'Chioma Okafor', 'Tunde Bakare',
  'Funke Akindele', 'Segun Arinze', 'Ngozi Ezeonu', 'Kunle Afolayan',
  'Mercy Johnson', 'Ramsey Nouah', 'Genevieve Nnaji', 'Omotola Jalade'
];

const emailDomains = [
  'mac.com', 'comcast.net', 'yahoo.ca', 'aol.com', 'yahoo.com',
  'gmail.com', 'live.com', 'msn.com', 'me.com', 'outlook.com'
];

const statuses = ['Active', 'In active'] as const;

/**
 * Generate unique branch data based on branch ID
 */
export function generateBranchData(branchId: string) {
  // Handle undefined or null branch IDs
  if (!branchId) {
    branchId = 'default';
  }
  
  const rng = new SeededRandom(branchId);

  // Generate branch info
  const branchName = rng.choice(branchNames);
  const region = rng.choice(regions);
  const branchIdNumber = rng.nextInt(10000000, 99999999).toString();
  
  // Generate date created (within last 2 years)
  const daysAgo = rng.nextInt(1, 730);
  const dateCreated = new Date();
  dateCreated.setDate(dateCreated.getDate() - daysAgo);

  // Generate statistics
  const allCOs = rng.nextInt(15, 85);
  const allCustomers = rng.nextInt(5000, 45000);
  const activeLoans = rng.nextInt(10000, 60000);
  const loansProcessed = rng.nextFloat(20000, 150000);

  const statistics = {
    allCOs: {
      value: allCOs,
      change: rng.nextInt(-15, 25),
      changeLabel: ''
    },
    allCustomers: {
      value: allCustomers,
      change: rng.nextInt(-10, 30),
      changeLabel: ''
    },
    activeLoans: {
      value: activeLoans,
      change: rng.nextInt(-30, 40),
      changeLabel: ''
    },
    loansProcessed: {
      amount: loansProcessed,
      change: rng.nextInt(-20, 50),
      changeLabel: '',
      isCurrency: true
    }
  };

  // Add change labels
  statistics.allCOs.changeLabel = `${statistics.allCOs.change > 0 ? '+' : ''}${statistics.allCOs.change}% this month`;
  statistics.allCustomers.changeLabel = `${statistics.allCustomers.change > 0 ? '+' : ''}${statistics.allCustomers.change}% this month`;
  statistics.activeLoans.changeLabel = `${statistics.activeLoans.change > 0 ? '+' : ''}${statistics.activeLoans.change}% this month`;
  statistics.loansProcessed.changeLabel = `${statistics.loansProcessed.change > 0 ? '+' : ''}${statistics.loansProcessed.change}% this month`;

  // Generate credit officers (5-15 officers per branch)
  const coCount = rng.nextInt(5, 15);
  const creditOfficers = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < coCount; i++) {
    let name = rng.choice(creditOfficerNames);
    // Ensure unique names
    while (usedNames.has(name)) {
      name = rng.choice(creditOfficerNames);
    }
    usedNames.add(name);

    const idNumber = rng.nextInt(10000, 99999).toString();
    const status = rng.next() > 0.2 ? 'Active' : 'In active'; // 80% active
    const phone = `+234${rng.nextInt(800, 909)}${rng.nextInt(1000000, 9999999)}`;
    const emailPrefix = name.toLowerCase().replace(' ', '');
    const email = `${emailPrefix}@${rng.choice(emailDomains)}`;
    
    const joinDaysAgo = rng.nextInt(30, daysAgo);
    const dateJoined = new Date();
    dateJoined.setDate(dateJoined.getDate() - joinDaysAgo);

    creditOfficers.push({
      id: `co-${i + 1}`,
      name,
      idNumber,
      status: status as 'Active' | 'In active',
      phone,
      email,
      dateJoined: dateJoined.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })
    });
  }

  // Generate reports (8-20 reports)
  const reportCount = rng.nextInt(8, 20);
  const reports = [];

  for (let i = 0; i < reportCount; i++) {
    const reportId = `ID: ${rng.nextInt(10000, 99999)}`;
    const officer = rng.choice(creditOfficers);
    const reportDaysAgo = rng.nextInt(1, 365);
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - reportDaysAgo);

    reports.push({
      id: `report-${i + 1}`,
      reportId,
      branchName: officer.name,
      timeSent: officer.email,
      date: reportDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })
    });
  }

  // Generate missed reports (2-8 missed reports)
  const missedCount = rng.nextInt(2, 8);
  const missedReports = [];

  for (let i = 0; i < missedCount; i++) {
    const reportId = `ID: ${rng.nextInt(10000, 99999)}`;
    const officer = rng.choice(creditOfficers);
    const dueDaysAgo = rng.nextInt(1, 180);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - dueDaysAgo);

    missedReports.push({
      id: `missed-${i + 1}`,
      reportId,
      branchName: officer.name,
      status: 'Missed' as const,
      dateDue: dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      })
    });
  }

  return {
    branchInfo: {
      name: branchName,
      branchId: branchIdNumber,
      dateCreated: dateCreated.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit' 
      }),
      region
    },
    statistics,
    creditOfficers,
    reports,
    missedReports
  };
}
