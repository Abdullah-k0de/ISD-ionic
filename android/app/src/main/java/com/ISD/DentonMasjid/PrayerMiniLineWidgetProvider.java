package com.isd.DentonMasjid;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.util.Log;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PrayerMiniLineWidgetProvider extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.isd.DentonMasjid.ACTION_REFRESH_MINI_LINE";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        showLoading(context, appWidgetManager, appWidgetIds);
        final android.content.BroadcastReceiver.PendingResult result = goAsync();
        executor.submit(() -> {
            try {
                fetchAndUpdate(context, appWidgetManager, appWidgetIds);
            } finally {
                result.finish();
            }
        });
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(
                    new android.content.ComponentName(context, PrayerMiniLineWidgetProvider.class));
            if (ids.length > 0) {
                showLoading(context, mgr, ids);
                final android.content.BroadcastReceiver.PendingResult result = goAsync();
                executor.submit(() -> {
                    try {
                        fetchAndUpdate(context, mgr, ids);
                    } finally {
                        result.finish();
                    }
                });
            }
        }
    }

    private void showLoading(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_mini_line_widget);
            applyTheme(context, views);
            views.setTextViewText(R.id.tv_current_name, "...");
            views.setTextViewText(R.id.tv_current_azan, "");
            views.setTextColor(R.id.tv_current_iqama, Color.TRANSPARENT);
            views.setTextViewText(R.id.tv_next_name, "...");
            views.setTextViewText(R.id.tv_next_azan, "");
            views.setTextColor(R.id.tv_next_iqama, Color.TRANSPARENT);
            views.setTextViewText(R.id.tv_last_refreshed, "Refreshing...");
            mgr.updateAppWidget(id, views);
        }
    }

    private void fetchAndUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        scheduleRetryAlarm(context, ids, 30 * 60 * 1000L);
        Exception lastEx = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                if (attempt > 0)
                    Thread.sleep(3000);
                SimpleDateFormat df = new SimpleDateFormat("dd-MM-yyyy", Locale.US);
                String today = df.format(new Date());

                URL adhanUrl = new URL("https://api.aladhan.com/v1/timings/" + today
                        + "?latitude=33.201662&longitude=-97.144949&method=2");
                HttpURLConnection ac = (HttpURLConnection) adhanUrl.openConnection();
                ac.setConnectTimeout(12000);
                ac.setReadTimeout(12000);
                ac.setRequestMethod("GET");
                StringBuilder ab = new StringBuilder();
                if (ac.getResponseCode() == 200) {
                    BufferedReader r = new BufferedReader(new InputStreamReader(ac.getInputStream()));
                    String line;
                    while ((line = r.readLine()) != null)
                        ab.append(line);
                    r.close();
                }

                URL sbUrl = new URL("https://qybqlmhslforglomkxjg.supabase.co/rest/v1/prayer_times?select=*");
                HttpURLConnection sc = (HttpURLConnection) sbUrl.openConnection();
                sc.setConnectTimeout(12000);
                sc.setReadTimeout(12000);
                sc.setRequestMethod("GET");
                sc.setRequestProperty("apikey",
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnFsbWhzbGZvcmdsb21reGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDkxMjEsImV4cCI6MjA4Nzg4NTEyMX0.UPWuMcfM4mc9liWuYRydq19UAr5PPI5jPcJRqdVu57E");
                sc.setRequestProperty("Authorization",
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnFsbWhzbGZvcmdsb21reGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDkxMjEsImV4cCI6MjA4Nzg4NTEyMX0.UPWuMcfM4mc9liWuYRydq19UAr5PPI5jPcJRqdVu57E");
                StringBuilder sb = new StringBuilder();
                if (sc.getResponseCode() == 200) {
                    BufferedReader r = new BufferedReader(new InputStreamReader(sc.getInputStream()));
                    String line;
                    while ((line = r.readLine()) != null)
                        sb.append(line);
                    r.close();
                }

                render(context, mgr, ids, ab.toString(), sb.toString());
                return;
            } catch (Exception e) {
                lastEx = e;
                Log.w("MiniLineWidget", "Attempt " + (attempt + 1) + " failed", e);
            }
        }
        Log.e("MiniLineWidget", "All attempts failed", lastEx);
        for (int id : ids) {
            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.prayer_mini_line_widget);
            applyTheme(context, v);
            v.setTextViewText(R.id.tv_current_name, "Tap ↻");
            mgr.partiallyUpdateAppWidget(id, v);
        }
    }

    private void render(Context context, AppWidgetManager mgr, int[] ids, String adhanBody, String iqamaBody) {
        try {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_mini_line_widget);
            applyTheme(context, views);

            if (!adhanBody.isEmpty()) {
                JSONObject data = new JSONObject(adhanBody).getJSONObject("data");
                JSONObject timings = data.getJSONObject("timings");
                String rawFajr = timings.getString("Fajr");
                String rawSunrise = timings.getString("Sunrise");
                String rawDhuhr = timings.getString("Dhuhr");
                String rawAsr = timings.getString("Asr");
                String rawMaghrib = timings.getString("Maghrib");
                String rawIsha = timings.getString("Isha");

                int pFajr = toMins(rawFajr), pSunrise = toMins(rawSunrise), pDhuhr = toMins(rawDhuhr);
                int pAsr = toMins(rawAsr), pMaghrib = toMins(rawMaghrib), pIsha = toMins(rawIsha);
                int nowMins = toMins(new SimpleDateFormat("HH:mm", Locale.US).format(new Date()));

                String[][] prayers = {
                        { "Fajr", rawFajr, "fajr" },
                        { "Sunrise", rawSunrise, "sunrise" },
                        { "Dhuhr", rawDhuhr, "dhuhr" },
                        { "Asr", rawAsr, "asr" },
                        { "Maghrib", rawMaghrib, "maghrib" },
                        { "Isha", rawIsha, "isha" }
                };
                int[] pMins = { pFajr, pSunrise, pDhuhr, pAsr, pMaghrib, pIsha };

                int curIdx = 5, nextIdx = 0;
                int nextPrayerMins = pFajr;
                for (int i = pMins.length - 1; i >= 0; i--) {
                    if (nowMins >= pMins[i]) {
                        curIdx = i;
                        nextIdx = (i + 1) % pMins.length;
                        nextPrayerMins = pMins[nextIdx];
                        break;
                    }
                }
                if (curIdx == 5 && nowMins >= pIsha) {
                    nextIdx = 0;
                    nextPrayerMins = pFajr;
                }

                String curIqama = "", nextIqama = "";
                if (!iqamaBody.isEmpty()) {
                    JSONArray arr = new JSONArray(iqamaBody);
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject obj = arr.getJSONObject(i);
                        String pKey = obj.getString("prayer").toLowerCase();
                        String iqamaT = fmt(obj.getString("iqamah"));
                        String curKey = prayers[curIdx][2];
                        String nxtKey = prayers[nextIdx][2];
                        if (pKey.equals(curKey) || (pKey.equals("zuhr") && curKey.equals("dhuhr"))
                                || (pKey.equals("dhur") && curKey.equals("dhuhr")))
                            curIqama = iqamaT;
                        if (pKey.equals(nxtKey) || (pKey.equals("zuhr") && nxtKey.equals("dhuhr"))
                                || (pKey.equals("dhur") && nxtKey.equals("dhuhr")))
                            nextIqama = iqamaT;
                    }
                }

                views.setTextViewText(R.id.tv_current_name, prayers[curIdx][0]);
                views.setTextViewText(R.id.tv_current_azan, fmt(prayers[curIdx][1]));
                views.setTextViewText(R.id.tv_current_iqama, curIqama);
                views.setTextViewText(R.id.tv_next_name, prayers[nextIdx][0]);
                views.setTextViewText(R.id.tv_next_azan, fmt(prayers[nextIdx][1]));
                views.setTextViewText(R.id.tv_next_iqama, nextIqama);

                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
                cal.set(java.util.Calendar.MINUTE, 0);
                cal.set(java.util.Calendar.SECOND, 0);
                cal.set(java.util.Calendar.MILLISECOND, 0);
                long nextTimeMs = cal.getTimeInMillis() + (nextPrayerMins * 60000L);
                if (nowMins >= pIsha && nextIdx == 0)
                    nextTimeMs += 86400000L;

                // Use 30s buffer after Adhan to ensure time has definitely passed
                scheduleRetryAlarm(context, ids, nextTimeMs - System.currentTimeMillis() + 5000L);

            }

            // Set Last Updated time in header (always, even if adhan data empty)
            SimpleDateFormat tf = new SimpleDateFormat("h:mm a", Locale.US);
            views.setTextViewText(R.id.tv_last_refreshed, "Last Updated: " + tf.format(new Date()));

            for (int id : ids) {
                Intent ri = new Intent(context, PrayerMiniLineWidgetProvider.class);
                ri.setAction(ACTION_REFRESH);
                PendingIntent rp = PendingIntent.getBroadcast(context, id, ri,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.btn_refresh, rp);

                Intent ai = new Intent(context, MainActivity.class);
                PendingIntent ap = PendingIntent.getActivity(context, 0, ai,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.layout_bg, ap);

                mgr.updateAppWidget(id, views);
            }
        } catch (Exception e) {
            Log.e("MiniLineWidget", "Render failed", e);
        }
    }

    private void applyTheme(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        try {
            int bg = Color.parseColor(extract(prefs, "widget_bg", "#080808"));
            int text = Color.parseColor(extract(prefs, "widget_text", "#FFFFFF"));
            int accent = Color.parseColor(extract(prefs, "widget_accent", "#d4af37"));
            int muted = Color.parseColor(extract(prefs, "widget_text_muted", "#a0a0a0"));

            views.setInt(R.id.layout_bg, "setBackgroundColor", bg);
            views.setTextColor(R.id.tv_hijri_date, accent); // hijri = accent
            views.setTextColor(R.id.tv_last_refreshed, muted); // updated time = muted
            views.setTextColor(R.id.btn_refresh, accent);
            views.setTextColor(R.id.tv_now_label, muted);
            views.setTextColor(R.id.tv_current_name, text);
            views.setTextColor(R.id.tv_current_azan, text);
            views.setTextColor(R.id.tv_current_iqama, accent);
            views.setTextColor(R.id.tv_next_label, muted);
            views.setTextColor(R.id.tv_next_name, accent);
            views.setTextColor(R.id.tv_next_azan, accent);
            views.setTextColor(R.id.tv_next_iqama, accent);
        } catch (Exception e) {
            Log.e("MiniLineWidget", "Theme error", e);
        }
    }

    private void scheduleRetryAlarm(Context context, int[] ids, long delayMs) {
        android.app.AlarmManager am = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        long t = System.currentTimeMillis() + delayMs;

        // Log the schedule time for the user (ISDPrayer tag)
        String readableTime = new SimpleDateFormat("EEE, MMM d, h:mm:ss a", Locale.US).format(new Date(t));
        Log.d("ISDPrayer", "[MiniLine] Next wakeup scheduled for: " + readableTime);

        for (int id : ids) {
            Intent i = new Intent(context, PrayerMiniLineWidgetProvider.class);
            i.setAction(ACTION_REFRESH);
            PendingIntent pi = PendingIntent.getBroadcast(context, id + 8000, i,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            try {
                am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, t, pi);
            } catch (SecurityException se) {
                am.set(android.app.AlarmManager.RTC_WAKEUP, t, pi);
            }
        }
    }

    private int toMins(String t) {
        try {
            String[] p = t.split("\\s+")[0].split(":");
            return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
        } catch (Exception e) {
            return -1;
        }
    }

    private String fmt(String t) {
        try {
            String clean = t.split("\\s+")[0];
            String[] p = clean.split(":");
            int h = Integer.parseInt(p[0].trim());
            String m = p[1].trim();
            String ap = h >= 12 ? "PM" : "AM";
            if (h == 0)
                h = 12;
            else if (h > 12)
                h -= 12;
            return h + ":" + m + " " + ap;
        } catch (Exception e) {
            return t;
        }
    }

    private String extract(SharedPreferences prefs, String key, String def) {
        String v = prefs.getString(key, def);
        return v == null ? def : v.replace("\"", "");
    }
}
