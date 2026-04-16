package com.isd.DentonMasjid;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private SharedPreferences.OnSharedPreferenceChangeListener prefListener;
    private final Handler debounceHandler = new Handler(Looper.getMainLooper());
    private Runnable debounceRunnable;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        prefListener = (sharedPreferences, key) -> {
            if (key != null && key.startsWith("widget_")) {
                // Cancel any pending refresh — multiple keys saved at once only trigger ONE refresh
                if (debounceRunnable != null)
                    debounceHandler.removeCallbacks(debounceRunnable);
                debounceRunnable = () -> {
                    sendBroadcast(new Intent(this, PrayerMiniBoxWidgetProvider.class)
                            .setAction(PrayerMiniBoxWidgetProvider.ACTION_REFRESH));
                    sendBroadcast(new Intent(this, PrayerMiniLineWidgetProvider.class)
                            .setAction(PrayerMiniLineWidgetProvider.ACTION_REFRESH));
                    sendBroadcast(new Intent(this, PrayerWidgetProvider.class)
                            .setAction("com.isd.DentonMasjid.ACTION_REFRESH_WIDGET"));
                    sendBroadcast(new Intent(this, PrayerCompactWidgetProvider.class)
                            .setAction("com.isd.DentonMasjid.ACTION_REFRESH_COMPACT_WIDGET"));
                };
                debounceHandler.postDelayed(debounceRunnable, 500);
            }
        };
        prefs.registerOnSharedPreferenceChangeListener(prefListener);
    }
}
