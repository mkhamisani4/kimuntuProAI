'use client';

function ActivityItem({ text, time }) {
  return (
    <li className="p-3 bg-white/10 rounded-xl mb-2 text-sm flex justify-between items-center text-gray-300 hover:bg-white/20 transition-all">
      <div>{text}</div>
      <div className="text-gray-400 text-xs">{time}</div>
    </li>
  );
}

export default function RecentActivity() {
  // Placeholder data - can be replaced with API call later
  const activities = [
    { id: 1, title: 'Created draft: Business Plan', time: '2 hours ago' },
    { id: 2, title: 'Saved: Funding strategy draft', time: '1 day ago' },
    { id: 3, title: 'Reviewed: Digital presence checklist', time: '3 days ago' },
  ];

  return (
    <section className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-6 hover:shadow-2xl hover:shadow-black/20 transition-all">
      <h2 className="mb-4 text-2xl font-bold text-white">🕒 Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="text-gray-400 italic text-center p-8">No activity yet</p>
      ) : (
        <ul className="list-none" role="list">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              text={activity.title}
              time={activity.time}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
