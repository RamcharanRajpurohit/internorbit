import Queue from "bull";
import { Resume } from "../models/resume";
import { ResumeAccessLog } from "../models/resume-access-log";
import { ResumeStats } from "../models/resume-stats";

// create redis URL dynamically
const redisURL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`;

const statsQueue = new Queue("resume-stats", redisURL);


/**
 * Aggregate and cache resume statistics
 * Run periodically or after each access
 */
statsQueue.process(async (job) => {
  const { resume_id } = job.data;

  try {
    const resume = await Resume.findById(resume_id);
    if (!resume) return;

    // Get all access logs for this resume
    const logs = await ResumeAccessLog.find({ resume_id })
      .populate('company_id', 'company_name');

    // Aggregate stats
    const viewers = new Map();

    logs.forEach((log) => {
      const companyId = log.company_id._id.toString();
      if (!viewers.has(companyId)) {
        viewers.set(companyId, {
          company_id: log.company_id._id,
        //   company_name: log.company_id.company_name,
          view_count: 0,
          download_count: 0,
          last_accessed: log.timestamp,
        });
      }

      const stats = viewers.get(companyId);
      if (log.access_type === 'view') {
        stats.view_count += 1;
      } else {
        stats.download_count += 1;
      }
      stats.last_accessed = log.timestamp;
    });

    // Update or create stats document
    const viewLogs = logs.filter((l) => l.access_type === 'view');
    const downloadLogs = logs.filter((l) => l.access_type === 'download');

    const stats = await ResumeStats.findOneAndUpdate(
      { resume_id },
      {
        resume_id,
        student_id: resume.student_id,
        total_views: viewLogs.length,
        total_downloads: downloadLogs.length,
        unique_company_views: new Set(
          viewLogs.map((l) => l.company_id.toString())
        ).size,
        unique_company_downloads: new Set(
          downloadLogs.map((l) => l.company_id.toString())
        ).size,
        last_viewed_at: viewLogs.length > 0 ? viewLogs[viewLogs.length - 1].timestamp : null,
        last_downloaded_at:
          downloadLogs.length > 0 ? downloadLogs[downloadLogs.length - 1].timestamp : null,
        viewers: Array.from(viewers.values()),
        updated_at: new Date(),
      },
      { upsert: true, new: true }
    );

    return { success: true, stats };
  } catch (error: any) {
    console.error('Stats aggregation error:', error);
    throw error;
  }
});

/**
 * Queue stats update
 */
export const queueStatsUpdate = (resume_id: string) => {
  return statsQueue.add(
    { resume_id },
    {
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    }
  );
};

export { statsQueue };