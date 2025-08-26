import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function ChatAnalytics() {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [questionStats, setQuestionStats] = useState({});
  const [feedbackStats, setFeedbackStats] = useState([]);
  const [emotionStats, setEmotionStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 Admin-only access (safe for undefined/null)
  if (typeof currentUser === 'undefined' || currentUser === null) {
    return <div className="p-6 text-gray-600">Checking admin access...</div>;
  }

  if (!currentUser?.isAdmin && currentUser?.role !== 'admin') {
    return <div className="p-6 text-red-600 font-semibold">403 - Access Denied</div>;
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [qRes, fRes, eRes] = await Promise.all([
          fetch('/api/chat/stats'),
          fetch('/api/chat/feedback/stats'),
          fetch('/api/chat/emotions')
        ]);
        const [qData, fData, eData] = await Promise.all([
          qRes.json(),
          fRes.json(),
          eRes.json()
        ]);
        setQuestionStats(qData || {});
        setFeedbackStats(fData || []);
        setEmotionStats(eData || {});
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(`Failed to load analytics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const clearAnalytics = async () => {
    if (!window.confirm('Clear all analytics data?')) return;
    try {
      await fetch('/api/chat/stats', { method: 'DELETE' });
      setQuestionStats({});
      setFeedbackStats([]);
      setEmotionStats({});
      alert('Analytics data cleared successfully!');
    } catch (err) {
      console.error('Failed to clear stats:', err);
      alert(`Failed to clear analytics: ${err.message}`);
    }
  };

  const exportFeedbackCSV = () => {
    const headers = ['Question', 'Helpful', 'Not Helpful'];
    const rows = feedbackStats.map(row => [
      `"${typeof row._id === 'string' ? row._id : JSON.stringify(row._id)}"`,
      row.helpful,
      row.notHelpful
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_summary.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-4 text-gray-600">Loading analytics...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const questionLabels = Object.keys(questionStats);
  const questionCounts = questionLabels.map(q => questionStats[q]?.length || 0);
  const emotionLabels = Object.keys(emotionStats);
  const emotionCounts = emotionLabels.map(date => emotionStats[date] || 0);

  const totalQuestions = questionCounts.reduce((a, b) => a + b, 0);
  const totalFeedback = feedbackStats.reduce((sum, f) => sum + f.helpful + f.notHelpful, 0);
  const totalEmotions = emotionCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">📊 Chatbot Analytics Dashboard</h2>
        <div className="flex gap-3">
          <button onClick={exportFeedbackCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            Export CSV
          </button>
          <button onClick={clearAnalytics} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Clear Analytics
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Questions" value={totalQuestions} color="blue" icon="❓" />
        <StatCard label="Total Feedback" value={totalFeedback} color="green" icon="📝" />
        <StatCard label="Emotional Triggers" value={totalEmotions} color="red" icon="😟" />
      </section>

      {/* Question Usage Chart */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Most Asked Questions</h3>
        {questionLabels.length === 0 ? (
          <p className="text-sm text-gray-500">No questions logged yet.</p>
        ) : (
          <div className="h-64">
            <Bar
              data={{
                labels: questionLabels,
                datasets: [{
                  label: 'Times Asked',
                  data: questionCounts,
                  backgroundColor: 'rgba(59, 130, 246, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false }
                },
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 45,
                      font: { size: 11 }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                }
              }}
            />
          </div>
        )}
      </section>

      {/* Feedback Summary Table */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Feedback Summary</h3>
        {feedbackStats.length === 0 ? (
          <p className="text-sm text-gray-500">No feedback submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300 rounded overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left font-medium">Question</th>
                  <th className="p-3 text-center font-medium">👍 Helpful</th>
                  <th className="p-3 text-center font-medium">👎 Not Helpful</th>
                  <th className="p-3 text-center font-medium">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {feedbackStats.map((entry, i) => {
                  const total = entry.helpful + entry.notHelpful;
                  const successRate = total > 0 ? Math.round((entry.helpful / total) * 100) : 0;
                  return (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-3 max-w-xs truncate" title={String(entry._id)}>{String(entry._id)}</td>
                      <td className="p-3 text-center text-green-600 font-medium">{entry.helpful}</td>
                      <td className="p-3 text-center text-red-600 font-medium">{entry.notHelpful}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          successRate >= 80 ? 'bg-green-100 text-green-800' :
                          successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {successRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Emotional Trends Chart */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Emotional Triggers Over Time</h3>
        {emotionLabels.length === 0 ? (
          <p className="text-sm text-gray-500">No emotional triggers detected yet.</p>
        ) : (
          <div className="h-64">
            <Line
              data={{
                labels: emotionLabels,
                datasets: [{
                  label: 'Emotional Triggers',
                  data: emotionCounts,
                  borderColor: 'rgba(239, 68, 68, 0.8)',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 5
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true
                    }
                  },
                  title: { display: false }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Date'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Triggers'
                    },
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

// ✅ Reusable stat card component
function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`text-${color}-500 text-3xl`}>{icon}</div>
      </div>
    </div>
  );
}
