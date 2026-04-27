"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRecentActivity, ActivityEvent } from "@/lib/activityLog";
import { Clock } from "lucide-react";

export function RecentActivity() {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const update = async () => {
      const activities = await getRecentActivity();
      setActivity(activities);
    };
    update();
    
    window.addEventListener("activityUpdate", update);
    window.addEventListener("storage", update);
    
    return () => {
      window.removeEventListener("activityUpdate", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-cream-50 dark:bg-[#292524] rounded-2xl p-5 shadow-lg border border-brown-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-brown-700 dark:text-brown-400" />
        <h3 className="text-lg font-semibold text-brown-900 dark:text-cream-50">Recent Activity</h3>
      </div>

      {activity.length === 0 ? (
        <p className="text-sm text-brown-600 dark:text-brown-400 italic">No recent activity yet.</p>
      ) : (
        <ul className="space-y-2">
          {activity.map((a, index) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-l-4 border-amber-700 dark:border-amber-600 pl-3 py-1"
            >
              <p className="text-sm text-brown-900 dark:text-cream-100">{a.message}</p>
              <p className="text-xs text-brown-500 dark:text-brown-400">
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
