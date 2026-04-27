"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getFollowups, updateFollowup, Followup } from "@/lib/api";
import { Calendar as CalendarIcon, CheckCircle, Circle, Plus } from "lucide-react";

export default function TimelineTab({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: followups = [], isLoading, error } = useQuery({
    queryKey: ["followups", profileId],
    queryFn: () => getFollowups(profileId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateFollowup(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups", profileId] });
      toast.success("Follow-up updated!");
    },
    onError: () => {
      toast.error("Failed to update follow-up");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-600 mx-auto"></div>
        <p className="mt-2 text-brown-600 dark:text-brown-400">Loading timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading followups. Please try again.
      </div>
    );
  }

  // Filtered followups based on selected date
  const visibleFollowups = selectedDate
    ? followups.filter(
        (f) => new Date(f.date).toDateString() === selectedDate.toDateString()
      )
    : followups;

  const handleToggleComplete = (followup: Followup) => {
    updateMutation.mutate({
      id: followup.id,
      completed: !followup.completed,
    });
  };

  const clearFilter = () => {
    setSelectedDate(null);
    toast("Showing all follow-ups");
  };

  return (
    <div className="space-y-4">
      {/* Date Filter Badge */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between"
        >
          <span className="text-sm text-amber-800 dark:text-amber-300">
            Filtered by: {selectedDate.toLocaleDateString()}
          </span>
          <button
            onClick={clearFilter}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear Filter
          </button>
        </motion.div>
      )}

      {/* Follow-ups List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-brown-900 dark:text-cream-50 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {selectedDate
              ? `Follow-ups for ${selectedDate.toLocaleDateString()}`
              : "All Follow-ups"}
          </h4>
          <span className="text-sm text-brown-600 dark:text-brown-400">
            {visibleFollowups.length} item{visibleFollowups.length !== 1 ? "s" : ""}
          </span>
        </div>

        {visibleFollowups.length === 0 ? (
          <div className="bg-brown-50 dark:bg-gray-800 rounded-xl p-8 text-center border border-brown-200 dark:border-gray-700">
            <CalendarIcon className="w-12 h-12 text-brown-400 mx-auto mb-2" />
            <p className="text-sm text-brown-600 dark:text-brown-400">
              {selectedDate
                ? "No follow-ups scheduled for this date."
                : "No follow-ups yet. Add one to get started!"}
            </p>
          </div>
        ) : (
          visibleFollowups.map((followup, index) => (
            <motion.div
              key={followup.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-cream-50 dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-all duration-200 ${
                followup.completed
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
                  : "border-brown-200 dark:border-gray-700 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        followup.completed
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}
                    >
                      {followup.type}
                    </span>
                    <span className="text-xs text-brown-600 dark:text-brown-400">
                      {new Date(followup.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-brown-800 dark:text-brown-200 font-medium">
                    {followup.note}
                  </p>
                  {followup.createdBy && (
                    <p className="text-xs text-brown-500 dark:text-brown-400 mt-1">
                      Created by: {followup.createdBy}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleToggleComplete(followup)}
                  disabled={updateMutation.isPending}
                  className="flex-shrink-0 p-2 hover:bg-brown-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title={followup.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {followup.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-brown-400 dark:text-brown-500" />
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
