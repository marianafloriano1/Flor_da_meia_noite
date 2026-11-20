export function availabilitySli(samples) {
  if (!Array.isArray(samples) || samples.length === 0)
    throw new Error("task013_availability_samples_required");
  let failures = 0;
  for (const sample of samples) {
    const status = sample?.status;
    if (sample?.timeout === true || (Number.isInteger(status) && status >= 500 && status <= 599))
      failures += 1;
    else if (!Number.isInteger(status) || status < 100 || status > 599)
      throw new Error("task013_availability_sample_invalid");
  }
  return {
    total: samples.length,
    failures,
    successes: samples.length - failures,
    ratio: (samples.length - failures) / samples.length,
  };
}

export function backupIntegritySli(scheduledJobs) {
  if (!Array.isArray(scheduledJobs) || scheduledJobs.length === 0)
    throw new Error("task013_backup_jobs_required");
  const successes = scheduledJobs.filter(
    (job) => job?.status === "complete" && job?.checksumVerified === true,
  ).length;
  return {
    total: scheduledJobs.length,
    successes,
    failures: scheduledJobs.length - successes,
    ratio: successes / scheduledJobs.length,
  };
}

export function errorBudget(minutesInWindow, target = 0.995) {
  if (
    !Number.isFinite(minutesInWindow) ||
    minutesInWindow <= 0 ||
    !Number.isFinite(target) ||
    target < 0 ||
    target > 1
  ) {
    throw new Error("task013_slo_parameters_invalid");
  }
  return Number((minutesInWindow * (1 - target)).toFixed(6));
}

export function recoveryTargets(
  { lastSuccessfulBackupAt, latestConfirmedMarkerAt, restoredMarkerAt, restoreDurationSeconds },
  now = Date.now(),
) {
  const backupTime = Date.parse(lastSuccessfulBackupAt);
  const latestMarker = Date.parse(latestConfirmedMarkerAt);
  const restoredMarker = Date.parse(restoredMarkerAt);
  if (
    ![backupTime, latestMarker, restoredMarker].every(Number.isFinite) ||
    !Number.isFinite(restoreDurationSeconds) ||
    restoreDurationSeconds < 0
  ) {
    throw new Error("task013_recovery_measurements_invalid");
  }
  if (
    backupTime > now ||
    latestMarker > now ||
    restoredMarker > now ||
    restoredMarker > latestMarker
  ) {
    throw new Error("task013_recovery_measurements_invalid");
  }
  const rpoSeconds = Math.max(0, (latestMarker - restoredMarker) / 1000);
  const backupAgeSeconds = Math.max(0, (now - backupTime) / 1000);
  return {
    backupAgeSeconds,
    rpoSeconds,
    rtoSeconds: restoreDurationSeconds,
    rpoWithin24h: rpoSeconds <= 24 * 60 * 60,
    rtoWithin24h: restoreDurationSeconds <= 24 * 60 * 60,
  };
}
