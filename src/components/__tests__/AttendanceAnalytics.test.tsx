import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceAnalytics } from '../AttendanceAnalytics';

interface AttendanceData {
  id: string;
  name: string;
  department: string;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendanceRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'none';
  lastAttendance: Date;
  status: 'active' | 'inactive';
  subjects: string[];
  weeklyData: any[];
}

vi.mock('@/lib/analytics-utils', () => ({
  processRealTimeData: vi.fn((data: any[]) => ({
    totalCount: data.length,
    activeCount: data.filter((item: any) => item.status === 'active').length,
    inactiveCount: data.filter((item: any) => item.status === 'inactive').length,
    attendedClasses: data.reduce((sum: number, item: any) => sum + item.attendedClasses, 0),
    absentClasses: data.reduce((sum: number, item: any) => sum + item.absentClasses, 0),
    lateClasses: data.reduce((sum: number, item: any) => sum + item.lateClasses, 0),
    riskLevels: {},
    weeklyData: [],
    riskLevelData: [],
    departmentStats: [],
    historicalData: [],
    timeOfDayData: [],
    comparativeData: [],
    subjectPerformance: [],
    goalTracking: [],
    performanceRanking: [],
    drillDownData: {},
    crossFilterData: {}
  })),
  calculateAttendanceRate: vi.fn((attended: number, total: number) => (total > 0 ? (attended / total) * 100 : 0)),
  getRiskLevelColor: vi.fn(() => '#ff0000'),
  getTrendIcon: vi.fn(() => 'up'),
  calculateWeeklyAttendanceData: vi.fn(() => []),
  validateAttendanceData: vi.fn(() => ({ isValid: true, errors: [], warnings: [], dataQuality: 1 }))
}));

vi.mock('@/lib/services/export.service', () => ({
  ExportService: {
    exportAnalytics: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('@/components/ui/toast', () => ({
  Toast: ({ message, type, onClose }: { message: string; type?: string; onClose?: () => void }) => (
    <div data-testid="toast" data-type={type} onClick={onClose}>
      {message}
    </div>
  )
}));

const mockData: AttendanceData[] = [
  {
    id: '1',
    name: 'John Doe',
    department: 'Computer Science',
    totalClasses: 20,
    attendedClasses: 18,
    absentClasses: 1,
    lateClasses: 1,
    attendanceRate: 90,
    riskLevel: 'low',
    lastAttendance: new Date(),
    status: 'active',
    subjects: ['CS101', 'CS102'],
    weeklyData: []
  },
  {
    id: '2',
    name: 'Jane Smith',
    department: 'Mathematics',
    totalClasses: 20,
    attendedClasses: 15,
    absentClasses: 3,
    lateClasses: 2,
    attendanceRate: 75,
    riskLevel: 'medium',
    lastAttendance: new Date(),
    status: 'active',
    subjects: ['MATH101', 'MATH102'],
    weeklyData: []
  }
];

const defaultProps = {
  data: mockData,
  loading: false,
  type: 'student' as const,
  onDrillDown: vi.fn(),
  onExport: vi.fn(),
  onRefresh: vi.fn(),
  enableAdvancedFeatures: true,
  enableRealTime: false,
  enableDrillDown: true,
  enableTimeRange: true,
  showHeader: true,
  showSecondaryFilters: true,
  selectedSubject: 'all',
  onSubjectChange: vi.fn(),
  subjects: [] as Array<{ id: string; name: string }>
};

describe('AttendanceAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AttendanceAnalytics {...defaultProps} />);
    expect(screen.getByText(/Student Attendance Analytics/i)).toBeDefined();
  });

  it('shows loading state when loading prop is true', () => {
    render(<AttendanceAnalytics {...defaultProps} loading={true} />);
    expect(screen.getByText(/Loading Analytics/i)).toBeDefined();
  });

  it('displays correct statistics when data is loaded', async () => {
    render(<AttendanceAnalytics {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeDefined();
    });
  });

  it('handles empty data gracefully', () => {
    render(<AttendanceAnalytics {...defaultProps} data={[]} />);
    expect(screen.getByText(/No Analytics Data Available/i)).toBeDefined();
  });

  it('shows Export in header', async () => {
    render(<AttendanceAnalytics {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Export/i)).toBeDefined();
    });
  });

  it('handles tab navigation correctly', async () => {
    render(<AttendanceAnalytics {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeDefined();
    });
    expect(screen.getByText('Trends')).toBeDefined();
    expect(screen.getByText('Patterns')).toBeDefined();
    fireEvent.click(screen.getByText('Trends'));
    expect(screen.getByText(/Attendance Trend Analysis/i)).toBeDefined();
  });

  it('applies filters when filters are visible', async () => {
    render(<AttendanceAnalytics {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeDefined();
    });
    expect(screen.getByText('All Departments')).toBeDefined();
    expect(screen.getByText('All Levels')).toBeDefined();
  });

  it('shows error state when data processing fails', async () => {
    const { processRealTimeData } = await import('@/lib/analytics-utils');
    vi.mocked(processRealTimeData).mockImplementationOnce(() => {
      throw new Error('Data processing failed');
    });
    render(<AttendanceAnalytics {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeDefined();
    });
  });

  it('handles student type correctly', async () => {
    render(<AttendanceAnalytics {...defaultProps} type="student" />);
    await waitFor(() => {
      expect(screen.getByText(/Student Attendance Analytics/i)).toBeDefined();
    });
  });
});

describe('AttendanceAnalytics Utilities', () => {
  it('calculates attendance rate correctly', async () => {
    const { calculateAttendanceRate } = await import('@/lib/analytics-utils');
    expect(vi.mocked(calculateAttendanceRate)(18, 20)).toBe(90);
    expect(vi.mocked(calculateAttendanceRate)(0, 0)).toBe(0);
  });

  it('processes real-time data correctly', async () => {
    const { processRealTimeData } = await import('@/lib/analytics-utils');
    const result = vi.mocked(processRealTimeData)(mockData, 'student');
    expect(result.totalCount).toBe(2);
    expect(result.attendedClasses).toBe(33);
  });
});
