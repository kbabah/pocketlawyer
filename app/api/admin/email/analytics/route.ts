import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Mock analytics data for now
    // In production, you would fetch real data from your email service provider
    const analyticsData = {
      summary: {
        totalSent: 1250,
        totalDelivered: 1180,
        totalOpened: 520,
        totalClicked: 180,
        deliveryRate: 94.4,
        openRate: 44.1,
        clickRate: 15.3,
        bounceRate: 5.6
      },
      chartData: generateMockChartData(period),
      templatePerformance: await getTemplatePerformance()
    };

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

function generateMockChartData(period: string) {
  const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      sent: Math.floor(Math.random() * 100) + 20,
      opened: Math.floor(Math.random() * 50) + 10,
      clicked: Math.floor(Math.random() * 20) + 5
    });
  }
  
  return data;
}

async function getTemplatePerformance() {
  try {
    const templatesSnapshot = await adminDb
      .collection('email_templates')
      .limit(10)
      .get();

    return templatesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Untitled Template',
        sent: Math.floor(Math.random() * 500) + 50,
        openRate: Math.floor(Math.random() * 50) + 20,
        clickRate: Math.floor(Math.random() * 20) + 5
      };
    });
  } catch (error) {
    console.error('Error fetching template performance:', error);
    return [];
  }
}
