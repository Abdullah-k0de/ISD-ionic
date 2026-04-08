package com.isd.DentonMasjid;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.util.Log;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PrayerCompactWidgetProvider extends AppWidgetProvider {
    private static final String ACTION_REFRESH_COMPACT_WIDGET = "com.isd.DentonMasjid.ACTION_REFRESH_COMPACT_WIDGET";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        PendingResult pendingResult = goAsync();

        updateBaseViews(context, appWidgetManager, appWidgetIds, true);

        executor.execute(() -> {
            try {
                fetchDataSync(context, appWidgetManager, appWidgetIds);
            } finally {
                if (pendingResult != null)
                    pendingResult.finish();
            }
        });
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH_COMPACT_WIDGET.equals(intent.getAction())) {
            PendingResult pendingResult = goAsync();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, PrayerCompactWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);

            updateBaseViews(context, appWidgetManager, appWidgetIds, true);

            executor.execute(() -> {
                try {
                    fetchDataSync(context, appWidgetManager, appWidgetIds);
                } finally {
                    if (pendingResult != null)
                        pendingResult.finish();
                }
            });
        }
    }

    private String extractColor(SharedPreferences prefs, String key, String defaultValue) {
        String raw = prefs.getString(key, defaultValue);
        if (raw == null)
            return defaultValue;
        return raw.replace("\"", "");
    }

    private void applyThemeColors(Context context, RemoteViews views) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String bgColorStr = extractColor(prefs, "widget_bg", "#080808");
        String textColorStr = extractColor(prefs, "widget_text", "#FFFFFF");
        String accentColorStr = extractColor(prefs, "widget_accent", "#d4af37");
        String textMutedStr = extractColor(prefs, "widget_text_muted", "#a0a0a0");

        try {
            int bgColor = Color.parseColor(bgColorStr);
            int textColor = Color.parseColor(textColorStr);
            int accentColor = Color.parseColor(accentColorStr);
            int textMuted = Color.parseColor(textMutedStr);

            views.setInt(R.id.layout_bg, "setBackgroundColor", bgColor);
            views.setTextColor(R.id.tv_title, textColor);
            views.setTextColor(R.id.btn_refresh, accentColor);
            views.setTextColor(R.id.tv_hijri_date, accentColor);

            int[] nameViews = { R.id.tv_fajr_name, R.id.tv_dhuhr_name, R.id.tv_asr_name, R.id.tv_maghrib_name,
                    R.id.tv_isha_name, R.id.tv_jummah_name };
            for (int id : nameViews)
                views.setTextColor(id, textColor);

            int[] azanViews = { R.id.tv_fajr_azan, R.id.tv_dhuhr_azan, R.id.tv_asr_azan, R.id.tv_maghrib_azan,
                    R.id.tv_isha_azan };
            for (int id : azanViews)
                views.setTextColor(id, textColor);

            int[] iqamaViews = { R.id.tv_fajr_iqama, R.id.tv_dhuhr_iqama, R.id.tv_asr_iqama, R.id.tv_maghrib_iqama,
                    R.id.tv_isha_iqama };
            for (int id : iqamaViews)
                views.setTextColor(id, accentColor);

            views.setTextColor(R.id.tv_jummah_time, accentColor);

            views.setTextColor(R.id.tv_sunrise_name, textMuted);
            views.setTextColor(R.id.tv_sunrise_azan, textMuted);
            views.setTextColor(R.id.tv_lastthird_name, textMuted);
            views.setTextColor(R.id.tv_lastthird_azan, textMuted);

            views.setTextColor(R.id.tv_last_refreshed, textMuted);
        } catch (Exception e) {
            Log.e("PrayerCompactWidget", "Color Parse Error", e);
        }
    }

    private void updateBaseViews(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds,
            boolean isLoading) {
        try {
            for (int appWidgetId : appWidgetIds) {
                RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_clock_compact_widget);

                int[] rowIds = { R.id.row_fajr, R.id.row_sunrise, R.id.row_dhuhr, R.id.row_asr, R.id.row_maghrib,
                        R.id.row_isha };
                for (int row : rowIds)
                    views.setInt(row, "setBackgroundColor", Color.TRANSPARENT);

                applyThemeColors(context, views);

                Intent refreshIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                refreshIntent.setAction(ACTION_REFRESH_COMPACT_WIDGET);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
                PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, refreshIntent, flags);
                views.setOnClickPendingIntent(R.id.btn_refresh, pendingIntent);

                Intent appIntent = new Intent(context, MainActivity.class);
                PendingIntent appPendingIntent = PendingIntent.getActivity(context, 0, appIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.layout_bg, appPendingIntent);

                if (isLoading) {
                    views.setTextViewText(R.id.tv_last_refreshed, "Refreshing...");
                }

                appWidgetManager.updateAppWidget(appWidgetId, views);
            }
        } catch (Exception e) {
            Log.e("PrayerCompactWidget", "Error in updateBaseViews", e);
        }
    }

    private void fetchDataSync(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        try {
            SimpleDateFormat dateFormatter = new SimpleDateFormat("dd-MM-yyyy", Locale.US);
            String todayDate = dateFormatter.format(new Date());

            URL adhanUrl = new URL("https://api.aladhan.com/v1/timings/" + todayDate
                    + "?latitude=33.201662&longitude=-97.144949&method=2");
            HttpURLConnection adhanConn = (HttpURLConnection) adhanUrl.openConnection();
            adhanConn.setConnectTimeout(6000);
            adhanConn.setReadTimeout(6000);
            adhanConn.setRequestMethod("GET");
            StringBuilder adhanBuilder = new StringBuilder();
            if (adhanConn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(adhanConn.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    adhanBuilder.append(line);
                }
                reader.close();
            }
            String adhanJsonString = adhanBuilder.toString();

            URL supabaseUrl = new URL("https://qybqlmhslforglomkxjg.supabase.co/rest/v1/prayer_times?select=*");
            HttpURLConnection iqamaConn = (HttpURLConnection) supabaseUrl.openConnection();
            iqamaConn.setConnectTimeout(6000);
            iqamaConn.setReadTimeout(6000);
            iqamaConn.setRequestMethod("GET");
            iqamaConn.setRequestProperty("apikey",
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnFsbWhzbGZvcmdsb21reGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDkxMjEsImV4cCI6MjA4Nzg4NTEyMX0.UPWuMcfM4mc9liWuYRydq19UAr5PPI5jPcJRqdVu57E");
            iqamaConn.setRequestProperty("Authorization",
                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnFsbWhzbGZvcmdsb21reGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDkxMjEsImV4cCI6MjA4Nzg4NTEyMX0.UPWuMcfM4mc9liWuYRydq19UAr5PPI5jPcJRqdVu57E");

            StringBuilder iqamaBuilder = new StringBuilder();
            if (iqamaConn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(iqamaConn.getInputStream()));
                String line;
                while ((line = reader.readLine()) != null) {
                    iqamaBuilder.append(line);
                }
                reader.close();
            }
            String iqamaJsonString = iqamaBuilder.toString();

            updateWidgetWithData(context, appWidgetManager, appWidgetIds, adhanJsonString, iqamaJsonString);

        } catch (Exception e) {
            Log.e("PrayerCompactWidget", "Fetch failed", e);

            for (int appWidgetId : appWidgetIds) {
                RemoteViews errorViews = new RemoteViews(context.getPackageName(), R.layout.prayer_clock_compact_widget);
                errorViews.setTextViewText(R.id.tv_last_refreshed, "Connection Error");
                appWidgetManager.partiallyUpdateAppWidget(appWidgetId, errorViews);
            }
        }
    }

    private int timeToMinutes(String time24) {
        try {
            String cleanTime = time24.split("\\s+")[0];
            String[] parts = cleanTime.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            return -1;
        }
    }

    private CharSequence makeBold(String text) {
        if (text == null)
            return "";
        android.text.SpannableString sp = new android.text.SpannableString(text);
        sp.setSpan(new android.text.style.StyleSpan(android.graphics.Typeface.BOLD), 0, text.length(), android.text.Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
        return sp;
    }

    private void updateWidgetWithData(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds,
            String adhanBody, String iqamaBody) {
        try {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_clock_compact_widget);

            int[] allRowIds = { R.id.row_fajr, R.id.row_sunrise, R.id.row_dhuhr, R.id.row_asr, R.id.row_maghrib,
                    R.id.row_isha };
            for (int row : allRowIds)
                views.setInt(row, "setBackgroundColor", Color.TRANSPARENT);

            applyThemeColors(context, views);

            SimpleDateFormat currentHourMinFormat = new SimpleDateFormat("HH:mm", Locale.US);
            String currentTimeStr = currentHourMinFormat.format(new Date());
            int currentMins = timeToMinutes(currentTimeStr);

            SimpleDateFormat timeFormat = new SimpleDateFormat("h:mm a", Locale.US);
            views.setTextViewText(R.id.tv_last_refreshed, "Updated: " + timeFormat.format(new Date()));

            if (!adhanBody.isEmpty()) {
                JSONObject dateObj = new JSONObject(adhanBody).getJSONObject("data").getJSONObject("date");
                JSONObject hijriObj = dateObj.getJSONObject("hijri");
                String hijriDay = hijriObj.getString("day");
                String hijriMonth = hijriObj.getJSONObject("month").getString("en");
                String hijriYear = hijriObj.getString("year");

                String combinedHijri = hijriDay + " " + hijriMonth + " " + hijriYear + " AH";
                views.setTextViewText(R.id.tv_hijri_date, combinedHijri);

                JSONObject timings = new JSONObject(adhanBody).getJSONObject("data").getJSONObject("timings");
                String rawFajr = timings.getString("Fajr");
                String rawSunrise = timings.getString("Sunrise");
                String rawDhuhr = timings.getString("Dhuhr");
                String rawAsr = timings.getString("Asr");
                String rawMaghrib = timings.getString("Maghrib");
                String rawIsha = timings.getString("Isha");

                int pFajr = timeToMinutes(rawFajr);
                int pSunrise = timeToMinutes(rawSunrise);
                int pDhuhr = timeToMinutes(rawDhuhr);
                int pAsr = timeToMinutes(rawAsr);
                int pMaghrib = timeToMinutes(rawMaghrib);
                int pIsha = timeToMinutes(rawIsha);

                // Math for Last Third natively: Maghrib + (Night_Duration * 2/3)
                int nightMins = (pFajr + 1440) - pMaghrib;
                int lastThirdMins = pMaghrib + (nightMins * 2) / 3;
                if (lastThirdMins >= 1440)
                    lastThirdMins -= 1440;
                String lastThirdTime = String.format(Locale.US, "%02d:%02d", lastThirdMins / 60, lastThirdMins % 60);

                views.setTextViewText(R.id.tv_fajr_azan, formatTime(rawFajr));
                views.setTextViewText(R.id.tv_sunrise_azan, formatTime(rawSunrise));
                views.setTextViewText(R.id.tv_dhuhr_azan, formatTime(rawDhuhr));
                views.setTextViewText(R.id.tv_asr_azan, formatTime(rawAsr));
                views.setTextViewText(R.id.tv_maghrib_azan, formatTime(rawMaghrib));
                views.setTextViewText(R.id.tv_isha_azan, formatTime(rawIsha));
                views.setTextViewText(R.id.tv_lastthird_azan, formatTime(lastThirdTime));

                int currentPrayerIndex = 0;
                int nextPrayerIndex = 0;
                int nextPrayerMins = 0;

                if (currentMins >= pFajr && currentMins < pSunrise) {
                    currentPrayerIndex = 0;
                    nextPrayerIndex = 1;
                    nextPrayerMins = pSunrise;
                } else if (currentMins >= pSunrise && currentMins < pDhuhr) {
                    currentPrayerIndex = 1;
                    nextPrayerIndex = 2;
                    nextPrayerMins = pDhuhr;
                } else if (currentMins >= pDhuhr && currentMins < pAsr) {
                    currentPrayerIndex = 2;
                    nextPrayerIndex = 3;
                    nextPrayerMins = pAsr;
                } else if (currentMins >= pAsr && currentMins < pMaghrib) {
                    currentPrayerIndex = 3;
                    nextPrayerIndex = 4;
                    nextPrayerMins = pMaghrib;
                } else if (currentMins >= pMaghrib && currentMins < pIsha) {
                    currentPrayerIndex = 4;
                    nextPrayerIndex = 5;
                    nextPrayerMins = pIsha;
                } else if (currentMins >= pIsha || currentMins < pFajr) {
                    currentPrayerIndex = 5;
                    nextPrayerIndex = 0;
                    nextPrayerMins = pFajr;
                }

                int[] rowIds = { R.id.row_fajr, R.id.row_sunrise, R.id.row_dhuhr, R.id.row_asr, R.id.row_maghrib,
                        R.id.row_isha };
                int[] nameIds = { R.id.tv_fajr_name, R.id.tv_sunrise_name, R.id.tv_dhuhr_name, R.id.tv_asr_name,
                        R.id.tv_maghrib_name, R.id.tv_isha_name };
                int[] azanIds = { R.id.tv_fajr_azan, R.id.tv_sunrise_azan, R.id.tv_dhuhr_azan, R.id.tv_asr_azan,
                        R.id.tv_maghrib_azan, R.id.tv_isha_azan };
                int[] iqamaIds = { R.id.tv_fajr_iqama, -1, R.id.tv_dhuhr_iqama, R.id.tv_asr_iqama,
                        R.id.tv_maghrib_iqama, R.id.tv_isha_iqama };

                SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                int bgColor = Color.parseColor(extractColor(prefs, "widget_bg", "#080808"));
                int accentColor = Color.parseColor(extractColor(prefs, "widget_accent", "#d4af37"));

                // Current Prayer Highlight
                views.setInt(rowIds[currentPrayerIndex], "setBackgroundColor", accentColor);
                views.setTextColor(nameIds[currentPrayerIndex], bgColor);
                views.setTextColor(azanIds[currentPrayerIndex], bgColor);
                if (iqamaIds[currentPrayerIndex] != -1)
                    views.setTextColor(iqamaIds[currentPrayerIndex], bgColor);

                // Next Prayer (Bold and colored)
                views.setTextColor(nameIds[nextPrayerIndex], accentColor);
                views.setTextColor(azanIds[nextPrayerIndex], accentColor);
                if (iqamaIds[nextPrayerIndex] != -1)
                    views.setTextColor(iqamaIds[nextPrayerIndex], accentColor);

                String[] allNames = { "Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha" };
                String[] allAzans = { formatTime(rawFajr), formatTime(rawSunrise), formatTime(rawDhuhr),
                        formatTime(rawAsr), formatTime(rawMaghrib), formatTime(rawIsha) };

                views.setTextViewText(nameIds[nextPrayerIndex], makeBold(allNames[nextPrayerIndex]));
                views.setTextViewText(azanIds[nextPrayerIndex], makeBold(allAzans[nextPrayerIndex]));

                // Auto-Wakeup when prayer hits
                java.util.Calendar c = java.util.Calendar.getInstance();
                c.set(java.util.Calendar.HOUR_OF_DAY, 0);
                c.set(java.util.Calendar.MINUTE, 0);
                c.set(java.util.Calendar.SECOND, 0);
                c.set(java.util.Calendar.MILLISECOND, 0);
                long midnightMs = c.getTimeInMillis();
                long nextTimeMs = midnightMs + (nextPrayerMins * 60000L);
                if (currentMins >= pIsha && nextPrayerIndex == 0) {
                    nextTimeMs += 86400000L; // Next Fajr is tomorrow
                }
                
                for (int appWidgetId : appWidgetIds) {
                    Intent alarmIntent = new Intent(context, PrayerCompactWidgetProvider.class);
                    alarmIntent.setAction(ACTION_REFRESH_COMPACT_WIDGET);
                    PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(
                            context, appWidgetId, alarmIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                    android.app.AlarmManager am = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
                    try {
                        am.setExactAndAllowWhileIdle(android.app.AlarmManager.RTC, nextTimeMs + 1000L, alarmPendingIntent);
                    } catch (SecurityException se) {
                        am.set(android.app.AlarmManager.RTC, nextTimeMs + 1000L, alarmPendingIntent);
                    }
                }
            }

            if (!iqamaBody.isEmpty()) {
                int[] iqamaIds = { R.id.tv_fajr_iqama, -1, R.id.tv_dhuhr_iqama, R.id.tv_asr_iqama,
                        R.id.tv_maghrib_iqama, R.id.tv_isha_iqama };

                JSONArray iqamaArray = new JSONArray(iqamaBody);
                for (int i = 0; i < iqamaArray.length(); i++) {
                    JSONObject obj = iqamaArray.getJSONObject(i);
                    String name = obj.getString("prayer").toLowerCase();
                    String iqamaTime = formatTime(obj.getString("iqamah"));

                    int targetIndex = -1;
                    switch (name) {
                        case "fajr":
                            targetIndex = 0;
                            break;
                        case "zuhr":
                        case "dhuhr":
                        case "dhur":
                            targetIndex = 2;
                            break;
                        case "asr":
                            targetIndex = 3;
                            break;
                        case "maghrib":
                            targetIndex = 4;
                            break;
                        case "isha":
                            targetIndex = 5;
                            break;
                    }

                    if (targetIndex != -1 && targetIndex != 1) {
                        views.setTextViewText(iqamaIds[targetIndex], iqamaTime);
                    }
                }
            }

            // Always reapply the general click intets to the new views object
            Intent appIntent = new Intent(context, MainActivity.class);
            PendingIntent appPendingIntent = PendingIntent.getActivity(context, 0, appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.layout_bg, appPendingIntent);

            Intent refreshIntent = new Intent(context, PrayerCompactWidgetProvider.class);
            refreshIntent.setAction(ACTION_REFRESH_COMPACT_WIDGET);
            for (int appWidgetId : appWidgetIds) {
                PendingIntent pendingIntent = PendingIntent.getBroadcast(context, appWidgetId, refreshIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.btn_refresh, pendingIntent);
                appWidgetManager.updateAppWidget(appWidgetId, views);
            }
        } catch (Exception e) {
            Log.e("PrayerCompactWidget", "Update UI failed", e);
        }
    }

    private String formatTime(String time24) {
        try {
            String cleanTime = time24.split("\\s+")[0];
            String[] parts = cleanTime.split(":");
            if (parts.length < 2)
                return time24;
            int hours = Integer.parseInt(parts[0].trim());
            String minutes = parts[1].trim();
            String ampm = (hours >= 12) ? "PM" : "AM";
            if (hours == 0)
                hours = 12;
            else if (hours > 12)
                hours -= 12;
            return hours + ":" + minutes + " " + ampm;
        } catch (Exception e) {
            return time24;
        }
    }
}
